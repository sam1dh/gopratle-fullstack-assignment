"use client";

import { useState } from "react";
import type { VoiceExchange } from "../../hooks/useVoiceAssistant";

interface VoiceInspectorProps {
  exchange: VoiceExchange | null;
  /** Test override; defaults to the ?voice-debug=1 URL flag. */
  enabled?: boolean;
}

function isDebugEnabled(): boolean {
  try {
    return new URLSearchParams(window.location.search).get("voice-debug") === "1";
  } catch {
    return false;
  }
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 mb-1">
        {label}
      </div>
      <div className="text-[12px] leading-relaxed text-slate-200 break-words">{children}</div>
    </div>
  );
}

function Json({ value }: { value: unknown }) {
  return (
    <pre className="whitespace-pre-wrap break-words rounded-lg bg-black/40 p-2 text-[11px] leading-relaxed text-emerald-200 max-h-[140px] overflow-auto">
      {JSON.stringify(value, null, 1)}
    </pre>
  );
}

// Dev-only API inspector for demos and recordings. Enable with ?voice-debug=1.
// Shows the live voice request/response flow: transcript -> context -> reply.
export function VoiceInspector({ exchange, enabled }: VoiceInspectorProps) {
  const [open, setOpen] = useState(true);
  const [show] = useState(() => enabled ?? isDebugEnabled());
  if (!show) return null;

  const ctx = exchange?.request.context;

  return (
    <div className="fixed bottom-6 left-6 z-50 w-[360px] max-w-[calc(100vw-48px)] rounded-2xl border border-slate-700 bg-[#141828]/95 text-white shadow-2xl backdrop-blur">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-2.5 text-[13px] font-bold"
      >
        <span>
          🎙 Voice API flow
          {exchange && (
            <span className="ml-2 font-mono text-[11px] font-normal text-slate-400">
              {exchange.at.slice(11, 19)}
            </span>
          )}
        </span>
        <span aria-hidden="true">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="max-h-[46vh] overflow-auto px-4 pb-4">
          {!exchange ? (
            <p className="text-[12px] text-slate-400">
              Tap the mic and speak — the transcript, context, reply, action and timings appear here.
            </p>
          ) : (
            <>
              <Row label="🎤 1 · Speech-to-text (browser)">
                “{exchange.transcript}” ({exchange.language})
              </Row>
              <Row label="📦 2 · POST /assistant/message context">
                <Json
                  value={{
                    currentStep: ctx?.currentStep,
                    category: ctx?.category,
                    currentField: ctx?.currentField,
                    missingRequiredFields: ctx?.missingRequiredFields,
                  }}
                />
              </Row>
              <Row label="🧠 3 · LLM reply">
                {exchange.responseText ?? <em className="text-red-300">{exchange.error}</em>}
                {exchange.timings.llmMs !== null && (
                  <span className="ml-2 font-mono text-[11px] text-slate-400">
                    {exchange.timings.llmMs}ms
                  </span>
                )}
              </Row>
              <Row label="⚡ 4 · Action applied">
                {exchange.action ? (
                  <Json value={exchange.action} />
                ) : (
                  <span className="text-slate-400">NONE</span>
                )}
              </Row>
              <Row label="🔊 5 · TTS audio">
                {exchange.timings.ttsMs !== null ? (
                  <span className="font-mono text-[11px]">audio started in {exchange.timings.ttsMs}ms</span>
                ) : (
                  <span className="text-slate-400">pending…</span>
                )}
              </Row>
            </>
          )}
        </div>
      )}
    </div>
  );
}
