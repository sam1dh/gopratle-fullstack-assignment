export type VoiceAssistantState =
  | "idle"
  | "listening"
  | "processing"
  | "speaking"
  | "error";

export type VoiceLanguage = "en" | "hi";

export const VOICE_STATUS_TEXT: Record<VoiceAssistantState, string> = {
  idle: "Tap mic to speak",
  listening: "Listening…",
  processing: "Thinking…",
  speaking: "Speaking…",
  error: "Something went wrong. Tap to try again.",
};

export const VOICE_ARIA_LABEL: Record<VoiceAssistantState, string> = {
  idle: "Start voice assistant",
  listening: "Stop voice assistant",
  processing: "Stop voice assistant",
  speaking: "Stop voice assistant",
  error: "Voice assistant error. Tap to try again.",
};

export const GREETINGS: Record<VoiceLanguage, string> = {
  en: "Hi! I'm your GoPratle assistant. Tell me about your event, or ask me what to fill in.",
  hi: "Namaste! Main aapki GoPratle sahayak hoon. Apne event ke baare mein bataiye, ya poochhiye kya bharna hai.",
};

export const LANG_STORAGE_KEY = "gopratle.voice.lang";
