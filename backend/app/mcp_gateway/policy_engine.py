import fnmatch
from urllib.parse import urlparse
from typing import Tuple, Optional, List, Dict, Any
import sqlparse
from sqlparse.sql import Statement
from sqlparse.tokens import DML, DDL, Keyword

from app.models.key import MCPKeyRecord


DESTRUCTIVE_SQL_KEYWORDS = {
    "DROP",
    "DELETE",
    "TRUNCATE",
    "UPDATE",
    "INSERT",
    "ALTER",
    "CREATE",
    "REPLACE",
    "EXEC",
    "EXECUTE",
    "MERGE",
}


def validate_sql_query(query: str, read_only: bool = True) -> Tuple[bool, Optional[str]]:
    """
    Parses SQL at the AST level using sqlparse to guarantee strict read-only compliance.
    Returns: (is_valid, error_reason)
    """
    if not query or not query.strip():
        return False, "Empty SQL query"

    if not read_only:
        return True, None

    try:
        parsed_statements: List[Statement] = sqlparse.parse(query)
        if not parsed_statements:
            return False, "Unparseable SQL statement"

        for stmt in parsed_statements:
            stmt_type = stmt.get_type()
            # If statement is explicitly not SELECT, block immediately
            if stmt_type and stmt_type.upper() != "SELECT":
                return (
                    False,
                    f"Destructive SQL statement '{stmt_type}' rejected on Read-Only key.",
                )

            # Deep token inspection for hidden DDL/DML clauses or multi-statement injections
            for token in stmt.flatten():
                token_val = token.value.strip().upper()
                if token_val in DESTRUCTIVE_SQL_KEYWORDS:
                    return (
                        False,
                        f"Prohibited SQL keyword '{token_val}' detected in AST token stream.",
                    )

        return True, None
    except Exception as e:
        # Fail-closed policy for security
        return False, f"SQL AST parsing error: {str(e)}"


def validate_domain_whitelist(url: str, allowed_domains: List[str]) -> Tuple[bool, Optional[str]]:
    """
    Validates target URL against domain whitelist wildcard patterns.
    """
    if not url:
        return False, "Missing URL parameter"

    if "*" in allowed_domains or "*.*" in allowed_domains:
        return True, None

    try:
        parsed = urlparse(url)
        hostname = parsed.hostname or url
        hostname = hostname.lower()

        for pattern in allowed_domains:
            pattern = pattern.strip().lower()
            if fnmatch.fnmatch(hostname, pattern):
                return True, None

        return (
            False,
            f"Domain '{hostname}' is not permitted by key whitelist policy ({', '.join(allowed_domains)}).",
        )
    except Exception as e:
        return False, f"Invalid URL format: {str(e)}"


def evaluate_tool_policy(
    key_record: MCPKeyRecord,
    tool_name: str,
    parameters: Dict[str, Any],
) -> Tuple[bool, str, Optional[str]]:
    """
    Evaluates complete tool execution request against the scoped key's security policy.
    Returns: (is_allowed, status_str, violation_reason)
    """
    # 1. Key Active Check
    if not key_record.is_active:
        return False, "BLOCKED", f"MCP Key '{key_record.name}' is revoked or disabled."

    # 2. Blacklist / Prohibited Tools Check
    if tool_name in key_record.prohibited_tools:
        return (
            False,
            "BLOCKED",
            f"Tool '{tool_name}' is strictly prohibited by security policy for this key.",
        )

    # 3. Whitelist / Allowed Tools Check
    if key_record.allowed_tools and "*" not in key_record.allowed_tools:
        if tool_name not in key_record.allowed_tools:
            return (
                False,
                "BLOCKED",
                f"Tool '{tool_name}' is not in the allowed tool whitelist for this key.",
            )

    # 4. SQL Guardrail Check
    if "sql" in tool_name.lower() or "db" in tool_name.lower() or "query" in tool_name.lower():
        query = str(parameters.get("query", ""))
        is_sql_valid, sql_err = validate_sql_query(query, read_only=key_record.sql_read_only)
        if not is_sql_valid:
            return False, "BLOCKED", f"SQL Policy Violation: {sql_err}"

    # 5. Domain / Web Fetch Whitelist Check
    if "web" in tool_name.lower() or "fetch" in tool_name.lower() or "http" in tool_name.lower():
        target_url = str(parameters.get("url", ""))
        if target_url:
            is_domain_valid, domain_err = validate_domain_whitelist(
                target_url, key_record.allowed_domains
            )
            if not is_domain_valid:
                return False, "BLOCKED", f"SSRF/Domain Policy Violation: {domain_err}"

    # 6. Inline Verdict Debate Trigger Check
    if key_record.enforce_verdict_eval:
        # Policy indicates Verdict safety review is active
        return True, "VERDICT_REVIEW", None

    return True, "ALLOWED", None
