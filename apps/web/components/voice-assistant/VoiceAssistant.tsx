"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, ChevronDown, Check } from "lucide-react";
import type { VoiceAssistantState, VoiceLanguage } from "../../types/voice";
import { VOICE_STATUS_TEXT, VOICE_ARIA_LABEL } from "../../types/voice";

interface VoiceAssistantProps {
  state: VoiceAssistantState;
  errorMessage?: string | null;
  language: VoiceLanguage;
  continuous: boolean;
  onToggle: () => void;
  onLanguageChange: (lang: VoiceLanguage) => void;
}

// Bounded, anchor-preserving scale per state. Only the transform changes,
// centered on the button, over 200ms.
const SCALE_FOR_STATE: Record<VoiceAssistantState, string> = {
  idle: "scale-100",
  listening: "scale-[1.12]",
  processing: "scale-[1.12]",
  speaking: "scale-[1.22]",
  error: "scale-100",
};

const STATUS_FOR_STATE: Record<VoiceAssistantState, string> = {
  idle: "Tap to speak",
  listening: "Listening...",
  processing: "Thinking…",
  speaking: "Speaking...",
  error: VOICE_STATUS_TEXT.error,
};

interface WaveformProps {
  bars?: number;
  /** Live amplitudes 0..1 per bar. When omitted, bars idle-animate via CSS.
   *  Pass mic/AI levels here later to drive the waveform for real. */
  levels?: number[];
  /** Listening animates briskly; speaking breathes slower. */
  pace?: "live" | "calm";
}

export function VoiceWaveform({ bars = 13, levels, pace = "live" }: WaveformProps) {
  const profile = (i: number) => {
    const t = bars <= 1 ? 0 : i / (bars - 1);
    return 0.25 + 0.75 * Math.sin(Math.PI * t);
  };
  return (
    <span
      className={`voice-wave-lg ${pace === "calm" ? "voice-wave-calm" : ""}`}
      aria-hidden="true"
    >
      {Array.from({ length: levels?.length ?? bars }, (_, i) => {
        const level = levels ? Math.min(1, Math.max(0, levels[i] ?? 0)) : null;
        return (
          <span
            key={i}
            className={`voice-wave-lg-bar ${level !== null ? "voice-wave-driven" : ""}`}
            style={
              level !== null
                ? { height: `${Math.round(10 + level * 90)}%` }
                : {
                    height: `${Math.round(profile(i) * 100)}%`,
                    animationDelay: `${(i % 7) * 110}ms`,
                  }
            }
          />
        );
      })}
    </span>
  );
}

const LANGUAGES: { id: VoiceLanguage; short: string; label: string }[] = [
  { id: "en", short: "EN", label: "English" },
  { id: "hi", short: "हिं", label: "Hindi" },
];

export function VoiceAssistant({
  state,
  errorMessage,
  language,
  continuous,
  onToggle,
  onLanguageChange,
}: VoiceAssistantProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const showWaveform = state === "listening" || state === "speaking";
  const statusText =
    state === "error" ? (errorMessage ?? VOICE_STATUS_TEXT.error) : STATUS_FOR_STATE[state];
  const current = LANGUAGES.find((l) => l.id === language) ?? LANGUAGES[0];

  return (
    <div
      data-testid="voice-widget"
      className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3 pointer-events-none max-[980px]:bottom-6 max-[980px]:right-4"
    >
      {/* Status bubble: always the same shell, centered above the mic */}
      <div
        role="status"
        aria-live="polite"
        className="relative min-w-[190px] max-w-[calc(100vw-48px)] rounded-[26px] border border-[#e6e8f2] bg-white px-6 pb-3 shadow-[0_12px_32px_-12px_rgba(79,70,229,0.25)]"
      >
        <div className={`flex flex-col items-center ${showWaveform ? "pt-4 gap-1.5" : "py-3"}`}>
          {showWaveform && (
            <VoiceWaveform pace={state === "speaking" ? "calm" : "live"} />
          )}
          {state === "processing" ? (
            <span className="flex items-center gap-2 text-[15px] font-semibold text-slate-600">
              Thinking
              <span className="voice-thinking-dots voice-thinking-dots-slate">
                <span />
                <span />
                <span />
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-2 text-[15px] font-semibold text-slate-600">
              {continuous && state !== "idle" && (
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              )}
              {statusText}
            </span>
          )}
        </div>
        {/* Pointer tail toward the microphone */}
        <span
          aria-hidden="true"
          className="absolute -bottom-[7px] left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-b border-r border-[#e6e8f2] bg-white"
        />
      </div>

      {/* Hero microphone: one fixed box, state scales it around its center */}
      <div className="relative">
        <div
          className={`voice-widget-scale relative origin-center transition-transform duration-200 ease-out ${SCALE_FOR_STATE[state]}`}
        >
          {state === "listening" && (
            <>
              <span className="voice-pulse-ring" aria-hidden="true" />
              <span className="voice-pulse-ring voice-pulse-ring-delay" aria-hidden="true" />
            </>
          )}
          {state === "speaking" && <span className="voice-breathe-glow" aria-hidden="true" />}

          <button
            type="button"
            onClick={onToggle}
            aria-label={VOICE_ARIA_LABEL[state]}
            className="voice-mic-btn pointer-events-auto relative grid place-items-center h-14 w-14 rounded-full text-white gradient-brand shadow-[0_10px_28px_-6px_rgba(79,70,229,0.55)] transition-all duration-200 hover:scale-[1.06] hover:shadow-[0_14px_34px_-6px_rgba(79,70,229,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            <Mic className="w-6 h-6 text-white" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Compact language selector below the mic */}
      <div ref={menuRef} className="relative pointer-events-auto">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label={`Assistant language: ${current.label}. Change language`}
          className="flex items-center gap-1.5 rounded-full border border-[#e6e8f2] bg-white px-4 py-1.5 text-[15px] font-bold text-slate-600 shadow-[0_6px_18px_-8px_rgba(15,23,42,0.25)] transition-all duration-200 hover:shadow-[0_8px_22px_-8px_rgba(15,23,42,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {current.short}
          <ChevronDown
            className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
        {menuOpen && (
          <div
            role="menu"
            aria-label="Assistant language"
            className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-2xl border border-[#e6e8f2] bg-white p-1.5 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.3)] animate-rise"
          >
            {LANGUAGES.map((l) => (
              <button
                key={l.id}
                type="button"
                role="menuitemradio"
                aria-checked={language === l.id}
                onClick={() => {
                  onLanguageChange(l.id);
                  setMenuOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  language === l.id
                    ? "bg-primary-soft text-primary"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {l.label}
                {language === l.id && <Check className="w-4 h-4" aria-hidden="true" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <span className="sr-only" aria-live="polite">
        {state === "idle" ? "Voice assistant idle" : statusText}
      </span>
    </div>
  );
}
