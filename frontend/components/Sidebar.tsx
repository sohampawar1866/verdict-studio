"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Scale,
  ShieldAlert,
  KeyRound,
  Activity,
  GitBranch,
  Terminal,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
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
    <aside className="w-64 bg-slate-900/90 backdrop-blur border-r border-slate-800 flex flex-col h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Scale className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              VERDICT <span className="text-cyan-400 font-mono">STUDIO</span>
            </span>
            <span className="text-[10px] tracking-wider uppercase font-mono text-slate-400 block -mt-0.5">
              & Haize Sentinel
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-mono tracking-wider text-slate-400 uppercase">
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-200"
                }`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-6 px-3 py-2 text-[10px] font-mono tracking-wider text-slate-400 uppercase">
          Ecosystem
        </div>
        <a
          href="https://github.com/haizelabs/verdict"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span>haizelabs/verdict</span>
          </span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </nav>

      {/* Backend Health Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between px-3 py-2 rounded-md bg-slate-900 border border-slate-800 text-[11px]">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                backendHealthy === true
                  ? "bg-emerald-400 shadow-sm shadow-emerald-500/50 animate-pulse"
                  : backendHealthy === false
                  ? "bg-red-400"
                  : "bg-amber-400"
              }`}
            />
            <span className="text-slate-300 font-mono">FastAPI Core</span>
          </div>
          <span
            className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
              backendHealthy === true
                ? "bg-emerald-950 text-emerald-300 border border-emerald-800/50"
                : backendHealthy === false
                ? "bg-red-950 text-red-300 border border-red-800/50"
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
