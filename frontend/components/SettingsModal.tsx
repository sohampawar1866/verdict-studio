"use client";

import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff, Check } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface UserAPISettings {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  customBaseUrl?: string;
  customApiKey?: string;
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
  const [customApiKey, setCustomApiKey] = useState("");
  const [showOpenai, setShowOpenai] = useState(false);
  const [showAnthropic, setShowAnthropic] = useState(false);
  const [showCustomKey, setShowCustomKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredAPISettings();
      setOpenaiKey(stored.openaiApiKey || "");
      setAnthropicKey(stored.anthropicApiKey || "");
      setCustomBaseUrl(stored.customBaseUrl || "");
      setCustomApiKey(stored.customApiKey || "");
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const hasAnyKey = Boolean(
    openaiKey.trim() ||
    anthropicKey.trim() ||
    customBaseUrl.trim() ||
    customApiKey.trim()
  );

  const handleSave = () => {
    const settings: UserAPISettings = {
      openaiApiKey: openaiKey.trim(),
      anthropicApiKey: anthropicKey.trim(),
      customBaseUrl: customBaseUrl.trim(),
      customApiKey: customApiKey.trim(),
    };
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 800);
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
      setCustomApiKey("");
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
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              API Settings & Custom Endpoints
            </h2>
            <p className="text-sm text-slate-300 mt-1 font-normal">
              Optional BYOK (Bring Your Own Key) for live model completions
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-[#4a154b] transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Consolidated Quiet Status Line */}
          <div className="flex items-center justify-between text-xs text-slate-300 bg-[#120413] border border-[#4a154b]/40 px-4 py-3 rounded-xl">
            <span className="font-mono text-emerald-400 font-medium">
              {hasAnyKey
                ? "Live Model Inference Active"
                : "Interactive Demo Mode Active (Zero Key / Free)"}
            </span>
            <span className="text-slate-400 text-[11px] font-mono">
              Cached in localStorage only
            </span>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 pt-1">
            {/* OpenAI API Key */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200 flex items-center justify-between">
                <span>OpenAI API Key (Optional)</span>
                <span className="text-xs font-mono text-slate-400 font-normal">
                  GPT-4o, GPT-4o-mini, o1
                </span>
              </label>
              <div className="relative">
                <input
                  type={showOpenai ? "text" : "password"}
                  placeholder="sk-proj-..."
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  className="w-full bg-[#100311] border border-[#4a154b]/50 rounded-xl px-4 py-3 pr-11 text-sm text-white focus:outline-none focus:border-[#d9bdde] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowOpenai(!showOpenai)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showOpenai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Anthropic API Key */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200 flex items-center justify-between">
                <span>Anthropic API Key (Optional)</span>
                <span className="text-xs font-mono text-slate-400 font-normal">
                  Claude 3.5 Sonnet, Haiku
                </span>
              </label>
              <div className="relative">
                <input
                  type={showAnthropic ? "text" : "password"}
                  placeholder="sk-ant-..."
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  className="w-full bg-[#100311] border border-[#4a154b]/50 rounded-xl px-4 py-3 pr-11 text-sm text-white focus:outline-none focus:border-[#d9bdde] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowAnthropic(!showAnthropic)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showAnthropic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Custom Base URL */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200 flex items-center justify-between">
                <span>Custom Base URL (Optional)</span>
                <span className="text-xs font-mono text-slate-400 font-normal">
                  OpenRouter, Groq, Ollama
                </span>
              </label>
              <input
                type="text"
                placeholder="https://openrouter.ai/api/v1 or http://localhost:11434/v1"
                value={customBaseUrl}
                onChange={(e) => setCustomBaseUrl(e.target.value)}
                className="w-full bg-[#100311] border border-[#4a154b]/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d9bdde] font-mono"
              />
            </div>

            {/* Custom Provider API Key */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200 flex items-center justify-between">
                <span>Custom Provider API Key (Optional)</span>
                <span className="text-xs font-mono text-slate-400 font-normal">
                  OpenRouter, Groq, Together AI
                </span>
              </label>
              <div className="relative">
                <input
                  type={showCustomKey ? "text" : "password"}
                  placeholder="sk-or-..., gsk_..."
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  className="w-full bg-[#100311] border border-[#4a154b]/50 rounded-xl px-4 py-3 pr-11 text-sm text-white focus:outline-none focus:border-[#d9bdde] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowCustomKey(!showCustomKey)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showCustomKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#4a154b]/30 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleClear}
              disabled={!hasAnyKey}
              className="px-4 py-2.5 rounded-full text-xs font-mono text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              Clear Stored Keys
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="btn-primary-pill flex items-center gap-2"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-[#2ecc71]" />
                  <span>Saved to Browser</span>
                </>
              ) : (
                <span>Save to Browser</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
