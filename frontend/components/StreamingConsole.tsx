"use client";

import React, { useRef, useEffect, useState } from "react";
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
  ChevronDown,
  ChevronUp,
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
  isOfflineMode?: boolean;
  onClear: () => void;
  onClose: () => void;
}

export default function StreamingConsole({
  messages,
  isExecuting,
  finalVerdict,
  isOfflineMode,
  onClear,
  onClose,
}: StreamingConsoleProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getRoleStyle = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes("prosecutor")) {
      return {
        badge: "bg-[#cc4117]/20 text-[#ff8e75] border-[#cc4117]/40",
        border: "border-[#cc4117]/30 bg-[#260a10]",
        icon: ShieldAlert,
        iconColor: "text-[#ff6b4a]",
        title: "Prosecution Argument",
      };
    }
    if (r.includes("defense")) {
      return {
        badge: "bg-[#007a5a]/20 text-[#2ecc71] border-[#007a5a]/40",
        border: "border-[#007a5a]/30 bg-[#081f14]",
        icon: ShieldCheck,
        iconColor: "text-[#2ecc71]",
        title: "Defense Counsel",
      };
    }
    if (r.includes("fact") || r.includes("check")) {
      return {
        badge: "bg-[#1264a3]/20 text-[#38bdf8] border-[#1264a3]/40",
        border: "border-[#1264a3]/30 bg-[#071826]",
        icon: SearchCheck,
        iconColor: "text-[#38bdf8]",
        title: "Verification Finding",
      };
    }
    if (r.includes("chief") || r.includes("judge") || r.includes("justice")) {
      return {
        badge: "bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/40",
        border: "border-[#f59e0b]/30 bg-[#261607]",
        icon: Gavel,
        iconColor: "text-[#f59e0b]",
        title: "Chief Justice Adjudication",
      };
    }
    return {
      badge: "bg-[#4a154b]/40 text-[#d9bdde] border-[#d9bdde]/30",
      border: "border-[#4a154b]/30 bg-[#1e0a20]",
      icon: Terminal,
      iconColor: "text-[#d9bdde]",
      title: "Reasoning Step",
    };
  };

  return (
    <div
      className={`bg-[#120413]/95 border-t border-[#4a154b]/40 flex flex-col select-none relative z-30 shadow-2xl backdrop-blur transition-all duration-200 ${
        isExpanded ? "h-96" : "h-64"
      }`}
    >
      {/* Console Top Bar */}
      <div className="h-10 px-4 bg-[#1e0a20] border-b border-[#4a154b]/30 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#4a154b] flex items-center justify-center text-white shadow-sm">
              <Terminal className="w-3 h-3 text-[#d9bdde]" />
            </div>
            <span className="text-xs font-bold text-white font-sans tracking-tight">
              Live Multi-Agent Debate Viewer
            </span>
          </div>

          {isExecuting && (
            <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#4a154b]/60 border border-[#d9bdde]/30 text-[10px] font-mono text-[#d9bdde] animate-pulse">
              <Sparkles className="w-2.5 h-2.5 animate-spin" />
              <span>STREAMING TOKENS...</span>
            </div>
          )}

          {isOfflineMode && (
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/50 font-semibold">
              Local Client Mode
            </span>
          )}

          {finalVerdict && (
            <div
              className={`flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                finalVerdict.includes("BLOCK")
                  ? "bg-[#2a0b12] text-[#ff8e75] border-[#cc4117]/60"
                  : "bg-[#0a2318] text-[#2ecc71] border-[#007a5a]/60"
              }`}
            >
              {finalVerdict.includes("BLOCK") ? (
                <AlertTriangle className="w-3 h-3 text-[#ff6b4a]" />
              ) : (
                <CheckCircle2 className="w-3 h-3 text-[#2ecc71]" />
              )}
              <span>VERDICT: {finalVerdict}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse height" : "Expand height"}
            className="p-1.5 rounded-full text-[#d9bdde]/70 hover:text-white hover:bg-[#4a154b] transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClear}
            className="px-2.5 py-1 rounded-full text-[#d9bdde]/80 hover:text-white hover:bg-[#4a154b] transition-colors text-[10px] font-mono flex items-center gap-1 font-semibold border border-transparent hover:border-[#d9bdde]/20"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#d9bdde]/70 hover:text-white hover:bg-[#4a154b] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#d9bdde]/60 text-xs font-sans">
            Hit <strong className="text-white mx-1 font-bold">"Run Debate Simulation"</strong> in the top toolbar to stream sub-models arguing token-by-token.
          </div>
        ) : (
          messages.map((msg) => {
            const style = getRoleStyle(msg.role);
            const Icon = style.icon;
            return (
              <div
                key={msg.id}
                className={`p-3.5 rounded-2xl border ${style.border} transition-all space-y-1.5 shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${style.iconColor}`} />
                    <span className="font-bold text-white font-sans">{msg.unitName}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold ${style.badge}`}>
                      {style.title}
                    </span>
                  </div>
                  {msg.isStreaming && (
                    <span className="text-[10px] text-[#d9bdde] animate-pulse font-mono font-bold">
                      ● Active
                    </span>
                  )}
                </div>

                <div className="text-slate-200 leading-relaxed whitespace-pre-wrap pl-5 font-mono text-[11px]">
                  {msg.text}
                  {msg.isStreaming && <span className="inline-block w-1.5 h-3 bg-[#d9bdde] animate-ping ml-1" />}
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
