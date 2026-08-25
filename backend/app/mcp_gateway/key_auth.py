import hashlib
import secrets
from typing import Tuple, Optional


def generate_mcp_key() -> Tuple[str, str, str]:
    """
    Generates a new cryptographically secure scoped MCP API key.
    Returns: (raw_key, key_prefix, hashed_key)
    """
    random_hex = secrets.token_hex(16)
    raw_key = f"haize_mcp_live_{random_hex}"
    key_prefix = raw_key[:18]  # "haize_mcp_live_..."
    hashed_key = hash_mcp_key(raw_key)
    return raw_key, key_prefix, hashed_key


def hash_mcp_key(raw_key: str) -> str:
    """Computes SHA-256 hash digest of raw API key."""
    return hashlib.sha256(raw_key.strip().encode("utf-8")).hexdigest()


def verify_mcp_key(raw_key: str, hashed_key: str) -> bool:
    """Constant-time verification of raw key against stored SHA-256 hash."""
    computed_hash = hash_mcp_key(raw_key)
    return secrets.compare_digest(computed_hash, hashed_key)


def extract_key_from_header(auth_header: Optional[str]) -> Optional[str]:
    """Extracts and sanitizes raw key from Authorization Bearer or direct key header."""
    if not auth_header:
        return None
    header_val = auth_header.strip().strip('"').strip("'")
    if header_val.lower().startswith("bearer "):
        return header_val[7:].strip().strip('"').strip("'")
    return header_val
