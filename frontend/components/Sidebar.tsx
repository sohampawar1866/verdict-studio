"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  KeyRound,
  Activity,
  GitBranch,
  Terminal,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/health", { cache: "no-store" });
        if (res.ok) {
          setBackendHealthy(true);
        } else {
          setBackendHealthy(false);
        }
      } catch {
        setBackendHealthy(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    {
      name: "Dashboard Overview",
      href: "/",
      icon: Activity,
      description: "Live system health & threat telemetry",
    },
    {
      name: "Visual DAG Studio",
      href: "/dag-studio",
      icon: GitBranch,
      description: "Compose & simulate Verdict debate DAGs",
    },
    {
      name: "Sentinel MCP Keys",
      href: "/mcp-keys",
      icon: KeyRound,
      description: "Scoped keys, RBAC & tool guardrails",
    },
    {
      name: "Live Threat Feed",
      href: "/audit-logs",
      icon: ShieldAlert,
      description: "Real-time tool interception & debate logs",
    },
  ];

  return (
    <aside className="w-64 bg-[#140615] border-r border-[#4a154b]/30 flex flex-col h-screen sticky top-0 select-none z-30 font-sans flex-shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#4a154b]/30 flex items-center justify-between bg-[#1b081c]/50">
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/logo.svg"
            alt="Verdict Studio & Haize Sentinel Logo"
            className="h-8 w-auto flex-shrink-0 group-hover:scale-105 transition-transform"
          />
          <div>
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5 font-sans">
              VERDICT <span className="text-[#d9bdde] font-mono font-semibold">STUDIO</span>
            </span>
            <span className="text-xs font-mono text-slate-400 block -mt-0.5 font-semibold">
              & Haize Sentinel
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation & Links */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto flex flex-col justify-between">
        {/* Primary Navigation */}
        <div className="space-y-1.5">
          <div className="px-3 pb-1 text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
            Navigation
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-[#4a154b] text-white shadow-md shadow-[#4a154b]/30 border border-[#d9bdde]/30"
                    : "text-slate-300 hover:text-white hover:bg-[#260c28]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer Sub-Sections: Ecosystem & Builder */}
        <div className="space-y-4 pt-4 border-t border-[#4a154b]/20">
          {/* ECOSYSTEM SECTION */}
          <div className="space-y-1">
            <div className="px-3 text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">
              Ecosystem
            </div>
            <a
              href="https://github.com/haizelabs/verdict"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-1.5 rounded-full text-xs font-mono text-slate-400 hover:text-slate-100 hover:bg-[#260c28] transition-colors"
            >
              <span className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                <span>haizelabs/verdict</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>

            <a
              href="https://github.com/sohampawar1866/verdict-studio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-1.5 rounded-full text-xs font-mono text-slate-400 hover:text-slate-100 hover:bg-[#260c28] transition-colors"
            >
              <span className="flex items-center gap-2">
                <Github className="w-3.5 h-3.5 text-slate-400" />
                <span>verdict-studio</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
          </div>

          {/* BUILDER SECTION */}
          <div className="space-y-1">
            <div className="px-3 text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">
              Builder
            </div>
            <a
              href="https://github.com/sohampawar1866"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-1.5 rounded-full text-xs font-mono text-slate-400 hover:text-slate-100 hover:bg-[#260c28] transition-colors"
            >
              <span className="flex items-center gap-2">
                <Github className="w-3.5 h-3.5 text-slate-400" />
                <span>sohampawar1866</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>

            <a
              href="https://www.linkedin.com/in/sohampawar1866/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-1.5 rounded-full text-xs font-mono text-slate-400 hover:text-slate-100 hover:bg-[#260c28] transition-colors"
            >
              <span className="flex items-center gap-2">
                <Linkedin className="w-3.5 h-3.5 text-slate-400" />
                <span>LinkedIn</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>

            <a
              href="https://devfolio.co/@sohampawar1866"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-1.5 rounded-full text-xs font-mono text-slate-400 hover:text-slate-100 hover:bg-[#260c28] transition-colors"
            >
              <span className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>@sohampawar1866</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
          </div>
        </div>
      </nav>

      {/* Backend Health Footer */}
      <div className="p-3.5 border-t border-[#4a154b]/30 bg-[#0d030e]">
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-full bg-[#1e0a20] border border-[#4a154b]/40 text-[11px]">
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                backendHealthy === true
                  ? "bg-[#007a5a] shadow-sm shadow-[#007a5a] animate-pulse"
                  : backendHealthy === false
                  ? "bg-[#cc4117]"
                  : "bg-amber-400"
              }`}
            />
            <span className="text-slate-200 font-mono text-[11px]">FastAPI Core</span>
          </div>
          <span
            className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              backendHealthy === true
                ? "bg-[#007a5a]/20 text-[#2ecc71] border border-[#007a5a]/40"
                : backendHealthy === false
                ? "bg-[#cc4117]/20 text-[#ff8e75] border border-[#cc4117]/40"
                : "bg-amber-950 text-amber-300"
            }`}
          >
            {backendHealthy === true ? ":8000 ONLINE" : backendHealthy === false ? "OFFLINE" : "CHECKING"}
          </span>
        </div>
      </div>
    </aside>
  );
}
