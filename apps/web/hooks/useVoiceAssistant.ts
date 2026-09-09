"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AssistantAction,
  AssistantLanguage,
  RequirementAssistantContext,
} from "@gopratle/contracts";
import type { VoiceAssistantState, VoiceLanguage } from "../types/voice";
import { GREETINGS, LANG_STORAGE_KEY } from "../types/voice";
import { postAssistantMessage, postSpeak } from "../lib/assistant-client";

interface UseVoiceAssistantOptions {
  buildContext: () => RequirementAssistantContext;
  onError?: (message: string) => void;
  onAction?: (action: AssistantAction) => void;
}

export interface VoiceExchange {
  at: string;
  transcript: string;
  language: VoiceLanguage;
  request: {
    message: string;
    language: string;
    context: RequirementAssistantContext;
  };
  responseText: string | null;
  action: AssistantAction | null;
  timings: { llmMs: number | null; ttsMs: number | null };
  error: string | null;
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

type RecognitionConstructor = new () => SpeechRecognitionInstance;

function getRecognitionConstructor(): RecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition as RecognitionConstructor) ||
    (w.webkitSpeechRecognition as RecognitionConstructor) ||
    null;
}

const MAX_SILENT_RETRIES = 3;

function loadLanguage(): VoiceLanguage {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    return saved === "hi" ? "hi" : "en";
  } catch {
    return "en";
  }
}

/**
 * Continuous voice session. Tap once to start: the assistant greets you,
 * then keeps listening until you tap again to stop. Barge-in supported.
 */
export function useVoiceAssistant({ buildContext, onError, onAction }: UseVoiceAssistantOptions) {
  const [state, setState] = useState<VoiceAssistantState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [language, setLanguageState] = useState<VoiceLanguage>("en");
  const [continuous, setContinuous] = useState(false);
  const [lastExchange, setLastExchange] = useState<VoiceExchange | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const stopAudioRef = useRef<(() => void) | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const stateRef = useRef<VoiceAssistantState>("idle");
  const continuousRef = useRef(false);
  const languageRef = useRef<VoiceLanguage>("en");
  const sessionRef = useRef(0);
  const silentRetriesRef = useRef(0);
  const buildContextRef = useRef(buildContext);
  buildContextRef.current = buildContext;

  const setBoth = useCallback((next: VoiceAssistantState, error: string | null = null) => {
    stateRef.current = next;
    setState(next);
    setErrorMessage(error);
  }, []);

  const fail = useCallback(
    (message: string) => {
      continuousRef.current = false;
      setContinuous(false);
      setBoth("error", message);
      onError?.(message);
    },
    [onError, setBoth]
  );

  const stopSpeakingAudio = useCallback(() => {
    stopAudioRef.current?.();
    stopAudioRef.current = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const stopRecognition = useCallback(() => {
    try {
      recognitionRef.current?.abort();
    } catch {
      // noop
    }
    recognitionRef.current = null;
  }, []);

  // AudioContext must be created/resumed inside the tap gesture so later
  // programmatic playback is not blocked by autoplay policy.
  const ensureAudioContext = useCallback(() => {
    try {
      if (typeof window === "undefined") return;
      const Ctx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
      if (audioCtxRef.current.state === "suspended") {
        void audioCtxRef.current.resume();
      }
    } catch {
      // Web Audio unavailable; HTMLAudio/device fallbacks apply
    }
  }, []);

  const playBuffer = useCallback(
    (base64: string, mime: string, onDone: () => void, onFailed: () => void): (() => void) | null => {
      try {
        const ctx = audioCtxRef.current;
        if (!ctx || typeof window === "undefined" || typeof window.Audio === "undefined") {
          return playElement(base64, mime, onDone, onFailed);
        }
        const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        const bufferCopy = bytes.buffer.slice(0) as ArrayBuffer;
        let source: AudioBufferSourceNode | null = null;
        let stopped = false;
        void ctx.decodeAudioData(
          bufferCopy,
          (buffer) => {
            if (stopped) return;
            source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.onended = onDone;
            source.start();
          },
          onFailed
        );
        return () => {
          stopped = true;
          try {
            source?.stop();
          } catch {
            // already stopped
          }
        };
      } catch {
        return playElement(base64, mime, onDone, onFailed);
      }
    },
    []
  );

  const speakWithDevice = useCallback(
    (text: string, onDone: () => void, onFailed: () => void): (() => void) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        const timer = setTimeout(onDone, Math.min(800 + text.length * 30, 8000));
        return () => clearTimeout(timer);
      }
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languageRef.current === "hi" ? "hi-IN" : "en-US";
      utterance.onend = onDone;
      utterance.onerror = onFailed;
      synth.speak(utterance);
      return () => synth.cancel();
    },
    []
  );

  // Server TTS (Cartesia feminine voice). Null when real audio is
  // unavailable so the caller falls back to device speech.
  const speakViaServer = useCallback(
    async (
      text: string,
      onDone: () => void,
      onFailed: () => void
    ): Promise<(() => void) | null> => {
      try {
        const data = await postSpeak({ text, language: languageRef.current });
        const mime = data.data?.mimeType ?? "";
        const b64 = data.data?.audioBase64 ?? "";
        if (!mime.startsWith("audio/") || mime === "audio/mock" || !b64) return null;
        return playBuffer(b64, mime, onDone, onFailed);
      } catch {
        return null;
      }
    },
    [playBuffer]
  );

  const speakText = useCallback(
    async (text: string, session: number, onDone: () => void) => {
      if (sessionRef.current !== session) return;
      setBoth("speaking");
      const done = () => {
        stopAudioRef.current = null;
        if (sessionRef.current === session) onDone();
      };
      const serverAudio = await speakViaServer(
        text,
        done,
        () => fail("Voice playback failed. Tap to try again.")
      );
      if (sessionRef.current !== session) {
        serverAudio?.();
        return;
      }
      if (serverAudio) {
        stopAudioRef.current = serverAudio;
        return;
      }
      stopAudioRef.current = speakWithDevice(
        text,
        done,
        () => fail("Voice playback failed. Tap to try again.")
      );
    },
    [fail, setBoth, speakViaServer, speakWithDevice]
  );

  const startListening = useCallback(
    (session: number) => {
      if (sessionRef.current !== session || !continuousRef.current) return;
      const Recognition = getRecognitionConstructor();
      if (!Recognition) {
        fail("Speech recognition is not supported in this browser. You can continue completing the form manually.");
        return;
      }
      try {
        stopRecognition();
        const recognition = new Recognition();
        recognition.lang = languageRef.current === "hi" ? "hi-IN" : "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognitionRef.current = recognition;

        recognition.onresult = (event) => {
          if (sessionRef.current !== session) return;
          silentRetriesRef.current = 0;
          const last = event.results[event.results.length - 1];
          const transcript = last?.[0]?.transcript ?? "";
          recognitionRef.current = null;
          void handleTranscriptRef.current(transcript, session);
        };
        recognition.onerror = (event) => {
          if (sessionRef.current !== session) return;
          recognitionRef.current = null;
          if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            fail("Microphone access is unavailable. You can continue completing the form manually.");
          } else if (event.error === "aborted" || event.error === "no-speech") {
            // no-speech falls through to onend retry logic
          } else {
            fail("Something went wrong. Tap to try again.");
          }
        };
        recognition.onend = () => {
          if (sessionRef.current !== session || !continuousRef.current) return;
          recognitionRef.current = null;
          if (stateRef.current !== "listening") return; // result/error already handled
          if (silentRetriesRef.current < MAX_SILENT_RETRIES) {
            silentRetriesRef.current += 1;
            startListening(session);
          } else {
            stopSessionRef.current();
          }
        };

        recognition.start();
        setBoth("listening");
      } catch {
        fail("Microphone is unavailable. You can continue completing the form manually.");
      }
    },
    [fail, setBoth, stopRecognition]
  );

  const handleTranscript = useCallback(
    async (transcript: string, session: number) => {
      const text = transcript.trim();
      if (!text) {
        if (sessionRef.current === session && continuousRef.current) {
          startListening(session);
        } else {
          setBoth("idle");
        }
        return;
      }
      setBoth("processing");
      const startedAt = new Date().toISOString();
      try {
        const context = buildContextRef.current();
        const lang = languageRef.current;
        const llmStart = performance.now();
        const reply = await postAssistantMessage({
          message: text,
          language: lang,
          context,
        });
        const llmMs = Math.round(performance.now() - llmStart);
        if (sessionRef.current !== session || !continuousRef.current) return;
        // Apply form automation before speaking so the UI updates as it talks.
        const suggested = reply.data.suggestedAction;
        if (suggested && suggested.type !== "NONE") {
          try {
            onActionRef.current?.(suggested);
          } catch {
            // automation must never break the voice loop
          }
        }
        setLastExchange({
          at: startedAt,
          transcript: text,
          language: lang,
          request: { message: text, language: lang, context },
          responseText: reply.data.response,
          action: suggested?.type !== "NONE" ? (suggested ?? null) : null,
          timings: { llmMs, ttsMs: null },
          error: null,
        });
        const ttsStart = performance.now();
        await speakTextRef.current(reply.data.response, session, () => {
          if (sessionRef.current === session && continuousRef.current) {
            startListening(session);
          } else {
            setBoth("idle");
          }
        });
        const ttsMs = Math.round(performance.now() - ttsStart);
        setLastExchange((prev) =>
          prev && prev.transcript === text
            ? { ...prev, timings: { llmMs, ttsMs } }
            : prev
        );
      } catch {
        setLastExchange({
          at: startedAt,
          transcript: text,
          language: languageRef.current,
          request: {
            message: text,
            language: languageRef.current,
            context: buildContextRef.current(),
          },
          responseText: null,
          action: null,
          timings: { llmMs: null, ttsMs: null },
          error: "request failed",
        });
        fail("Something went wrong. Tap to try again.");
      }
    },
    [fail, setBoth, startListening]
  );

  // Refs to break callback cycles
  const handleTranscriptRef = useRef(handleTranscript);
  handleTranscriptRef.current = handleTranscript;
  const onActionRef = useRef(onAction);
  onActionRef.current = onAction;
  const speakTextRef = useRef(speakText);
  speakTextRef.current = speakText;
  const startListeningRef = useRef(startListening);
  startListeningRef.current = startListening;

  const startSession = useCallback(() => {
    const session = sessionRef.current + 1;
    sessionRef.current = session;
    continuousRef.current = true;
    setContinuous(true);
    silentRetriesRef.current = 0;
    setErrorMessage(null);
    ensureAudioContext();
    // Greet, then enter the listen loop. Session stays on until the user stops it.
    void speakTextRef.current(GREETINGS[languageRef.current], session, () => {
      if (sessionRef.current === session && continuousRef.current) {
        startListeningRef.current(session);
      }
    });
  }, [ensureAudioContext]);

  const stopSessionRef = useRef(() => {});
  const stopSession = useCallback(() => {
    sessionRef.current += 1;
    continuousRef.current = false;
    setContinuous(false);
    stopRecognition();
    stopSpeakingAudio();
    setBoth("idle");
  }, [setBoth, stopRecognition, stopSpeakingAudio]);
  stopSessionRef.current = stopSession;

  const toggle = useCallback(() => {
    if (continuousRef.current) {
      stopSession();
    } else {
      startSession();
    }
  }, [startSession, stopSession]);

  const reset = useCallback(() => {
    stopSession();
  }, [stopSession]);

  const setLanguage = useCallback((lang: VoiceLanguage) => {
    languageRef.current = lang;
    setLanguageState(lang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    languageRef.current = loadLanguage();
    setLanguageState(languageRef.current);
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {
        // noop
      }
      stopAudioRef.current?.();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { state, errorMessage, language, setLanguage, continuous, toggle, reset, lastExchange };
}

function playElement(
  base64: string,
  mime: string,
  onDone: () => void,
  onFailed: () => void
): (() => void) | null {
  try {
    if (typeof window === "undefined" || typeof window.Audio === "undefined") return null;
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: mime });
    const url = URL.createObjectURL(blob);
    const audio = new window.Audio(url);
    audio.onended = () => {
      URL.revokeObjectURL(url);
      onDone();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      onFailed();
    };
    void audio.play().catch(onFailed);
    return () => {
      audio.pause();
      URL.revokeObjectURL(url);
    };
  } catch {
    return null;
  }
}
