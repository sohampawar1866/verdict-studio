"use client";

import React, { useState, useEffect } from "react";
import { X, KeyRound, Shield, Check, Trash2, Eye, EyeOff, Sparkles, SlidersHorizontal, Globe } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface UserAPISettings {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  customBaseUrl?: string;
}

export const SETTINGS_STORAGE_KEY = "verdict_studio_api_settings";

export function getStoredAPISettings(): UserAPISettings {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [customBaseUrl, setCustomBaseUrl] = useState("");
  const [showOpenai, setShowOpenai] = useState(false);
  const [showAnthropic, setShowAnthropic] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredAPISettings();
      setOpenaiKey(stored.openaiApiKey || "");
      setAnthropicKey(stored.anthropicApiKey || "");
      setCustomBaseUrl(stored.customBaseUrl || "");
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const hasAnyKey = Boolean(openaiKey.trim() || anthropicKey.trim() || customBaseUrl.trim());

  const handleSave = () => {
    const settings: UserAPISettings = {
      openaiApiKey: openaiKey.trim(),
      anthropicApiKey: anthropicKey.trim(),
      customBaseUrl: customBaseUrl.trim(),
    };
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 900);
    } catch (e) {
      console.error("Failed to save settings to localStorage:", e);
    }
  };

  const handleClear = () => {
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      setOpenaiKey("");
      setAnthropicKey("");
      setCustomBaseUrl("");
      setSavedSuccess(false);
    } catch (e) {
      console.error("Failed to clear settings:", e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50 animate-fade-in select-none">
      <div className="bg-[#170718] border border-[#4a154b]/40 rounded-3xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-6 sm:p-7 border-b border-[#4a154b]/30 flex items-center justify-between bg-[#230c25]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4a154b]/40 border border-[#d9bdde]/20 flex items-center justify-center text-[#d9bdde] shadow-sm">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                API Settings & Custom Endpoints
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 font-normal">
                Optional BYOK (Bring Your Own Key) for live model completions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-[#4a154b] transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Active Mode Status Badge */}
          <div
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
              hasAnyKey
                ? "bg-[#081f14] border-[#007a5a]/60 text-[#2ecc71]"
                : "bg-[#1f0a21] border-[#4a154b]/40 text-slate-300"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {hasAnyKey ? (
                <Sparkles className="w-4 h-4 text-[#2ecc71] flex-shrink-0" />
              ) : (
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              )}
              <div className="text-xs font-mono font-semibold">
                {hasAnyKey ? (
                  <span>⚡ Active Mode: Live Model Inference (Using Browser Key)</span>
                ) : (
                  <span>🟢 Active Mode: Interactive Demo Simulation (Free / Zero-Setup)</span>
                )}
              </div>
            </div>
          </div>

          {/* Privacy Guarantee Badge */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#100311] border border-[#4a154b]/30 text-xs text-slate-400">
            <Shield className="w-4 h-4 text-[#38bdf8] flex-shrink-0" />
            <span>
              🔐 Keys are stored <strong>strictly in your browser</strong> (<code className="text-[#38bdf8] font-mono text-[11px]">localStorage</code>). Zero server-side persistence.
            </span>
          </div>

          {/* Key Inputs */}
          <div className="space-y-4 pt-1">
            {/* OpenAI API Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span>OpenAI API Key (Optional)</span>
                <span className="text-[10px] font-mono text-slate-400">GPT-4o, GPT-4o-mini, o1</span>
              </label>
              <div className="relative">
                <input
                  type={showOpenai ? "text" : "password"}
                  placeholder="sk-proj-..."
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  className="w-full bg-[#100311] border border-[#4a154b]/50 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white focus:outline-none focus:border-[#d9bdde] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowOpenai(!showOpenai)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showOpenai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Anthropic API Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span>Anthropic API Key (Optional)</span>
                <span className="text-[10px] font-mono text-slate-400">Claude 3.5 Sonnet, Haiku</span>
              </label>
              <div className="relative">
                <input
                  type={showAnthropic ? "text" : "password"}
                  placeholder="sk-ant-..."
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  className="w-full bg-[#100311] border border-[#4a154b]/50 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white focus:outline-none focus:border-[#d9bdde] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowAnthropic(!showAnthropic)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showAnthropic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Custom Base URL / Endpoint */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  Custom Base URL / Endpoint (Optional)
                </span>
                <span className="text-[10px] font-mono text-slate-400">OpenRouter, Groq, Ollama</span>
              </label>
              <input
                type="text"
                placeholder="e.g. https://openrouter.ai/api/v1 or http://localhost:11434/v1"
                value={customBaseUrl}
                onChange={(e) => setCustomBaseUrl(e.target.value)}
                className="w-full bg-[#100311] border border-[#4a154b]/50 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#d9bdde] font-mono"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#4a154b]/30 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleClear}
              disabled={!hasAnyKey}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Stored Keys</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="btn-primary-pill flex items-center gap-2"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-[#2ecc71]" />
                  <span>Saved to Browser!</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Save to Browser</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
