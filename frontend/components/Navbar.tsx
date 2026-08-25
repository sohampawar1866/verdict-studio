"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GitBranch, KeyRound, ShieldAlert, Activity } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Overview", href: "/", icon: Activity },
    { name: "DAG Studio", href: "/dag-studio", icon: GitBranch },
    { name: "MCP Keys", href: "/mcp-keys", icon: KeyRound },
    { name: "Live Logs", href: "/audit-logs", icon: ShieldAlert },
  ];

  return (
    <header className="h-14 bg-[#140615] border-b border-[#4a154b]/30 px-5 flex items-center justify-between z-30 select-none flex-shrink-0 font-sans">
      {/* Brand Header with Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        <img
          src="/logo.svg"
          alt="Verdict Studio & Haize Sentinel Logo"
          className="h-8 w-auto flex-shrink-0 group-hover:scale-105 transition-transform"
        />
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm tracking-tight text-white font-sans">
            VERDICT <span className="text-[#d9bdde] font-mono font-semibold">STUDIO</span>
          </span>
          <span className="hidden sm:inline-block text-xs font-mono text-slate-400 font-semibold">
            & Haize Sentinel
          </span>
        </div>
      </Link>

      {/* Nav Links */}
      <nav className="flex items-center gap-1.5">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? "bg-[#4a154b] text-white shadow-sm border border-[#d9bdde]/30"
                  : "text-slate-300 hover:text-white hover:bg-[#260c28]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
