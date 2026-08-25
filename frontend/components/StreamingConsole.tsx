"use client";

import React, { useRef, useEffect } from "react";
import {
  Terminal,
  X,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  SearchCheck,
  Gavel,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Minimize2,
  Maximize2,
} from "lucide-react";

export interface DebateMessage {
  id: string;
  unitId: string;
  unitName: string;
  role: string;
  text: string;
  isStreaming: boolean;
  verdict?: string;
}

interface StreamingConsoleProps {
  messages: DebateMessage[];
  isExecuting: boolean;
  finalVerdict: string | null;
  onClear: () => void;
  onClose: () => void;
}

export default function StreamingConsole({
  messages,
  isExecuting,
  finalVerdict,
  onClear,
  onClose,
}: StreamingConsoleProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getRoleStyle = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes("prosecutor")) {
      return {
        badge: "bg-red-950/80 text-red-300 border-red-800/60",
        border: "border-red-900/40 bg-red-950/10",
        icon: ShieldAlert,
        iconColor: "text-red-400",
        title: "Prosecution Argument",
      };
    }
    if (r.includes("defense")) {
      return {
        badge: "bg-emerald-950/80 text-emerald-300 border-emerald-800/60",
        border: "border-emerald-900/40 bg-emerald-950/10",
        icon: ShieldCheck,
        iconColor: "text-emerald-400",
        title: "Defense Counsel",
      };
    }
    if (r.includes("fact") || r.includes("check")) {
      return {
        badge: "bg-sky-950/80 text-sky-300 border-sky-800/60",
        border: "border-sky-900/40 bg-sky-950/10",
        icon: SearchCheck,
        iconColor: "text-sky-400",
        title: "Verification Finding",
      };
    }
    if (r.includes("chief") || r.includes("judge") || r.includes("justice")) {
      return {
        badge: "bg-amber-950/80 text-amber-300 border-amber-800/60",
        border: "border-amber-900/40 bg-amber-950/20",
        icon: Gavel,
        iconColor: "text-amber-400",
        title: "Chief Justice Adjudication",
      };
    }
    return {
      badge: "bg-purple-950/80 text-purple-300 border-purple-800/60",
      border: "border-purple-900/40 bg-purple-950/10",
      icon: Terminal,
      iconColor: "text-purple-400",
      title: "Reasoning Step",
    };
  };

  return (
    <div className="h-64 bg-slate-950/95 border-t border-slate-800 flex flex-col select-none relative z-30 shadow-2xl backdrop-blur">
      {/* Console Top Bar */}
      <div className="h-9 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200 font-mono">
              Live Multi-Agent Debate Viewer
            </span>
          </div>

          {isExecuting && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/50 text-[10px] font-mono text-cyan-400 animate-pulse">
              <Sparkles className="w-2.5 h-2.5 animate-spin" />
              <span>STREAMING TOKENS...</span>
            </div>
          )}

          {finalVerdict && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                finalVerdict.includes("BLOCK")
                  ? "bg-red-950 text-red-300 border-red-800"
                  : "bg-emerald-950 text-emerald-300 border-emerald-800"
              }`}
            >
              {finalVerdict.includes("BLOCK") ? (
                <AlertTriangle className="w-3 h-3 text-red-400" />
              ) : (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              )}
              <span>VERDICT: {finalVerdict}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-[10px] font-mono flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            Hit <strong className="text-cyan-400 mx-1">"Run Debate Simulation"</strong> in the top toolbar to stream sub-models arguing token-by-token.
          </div>
        ) : (
          messages.map((msg) => {
            const style = getRoleStyle(msg.role);
            const Icon = style.icon;
            return (
              <div
                key={msg.id}
                className={`p-3 rounded-xl border ${style.border} transition-all space-y-1.5 animate-fade-in`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${style.iconColor}`} />
                    <span className="font-bold text-slate-200">{msg.unitName}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${style.badge}`}>
                      {style.title}
                    </span>
                  </div>
                  {msg.isStreaming && (
                    <span className="text-[10px] text-cyan-400 animate-pulse font-mono">
                      ● Active
                    </span>
                  )}
                </div>

                <div className="text-slate-300 leading-relaxed whitespace-pre-wrap pl-5 font-mono text-[11px]">
                  {msg.text}
                  {msg.isStreaming && <span className="inline-block w-1.5 h-3 bg-cyan-400 animate-ping ml-1" />}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
