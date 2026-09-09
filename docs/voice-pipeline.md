# Voice Pipeline

The GoPratle assistant is voice-first: the user speaks, the system listens,
reasons over the live form context, and speaks back. There is no chat UI.

## Flow

One tap starts a continuous session: the assistant greets you, then keeps
listening until you tap again to stop.

```text
Mic tap (AudioContext resumed in-gesture, autoplay-safe)
  → state = speaking (greeting via Cartesia)
  → state = listening (pulse rings, "Listening…", green session dot)
  → browser SpeechRecognition captures speech (real STT, no vendor key)
  → state = processing ("Thinking…")
  → buildAssistantContext(form state, errors, focused field)
  → POST /api/v1/assistant/message { message, language, context }
  → AssistantService → LLMProvider (Gemini, or mock without key)
  → POST /api/v1/assistant/speak { text, language }
  → SpeechService → TTSProvider (Cartesia MP3, or device speech fallback)
  → state = speaking (waveform, "Speaking…"), audio plays
  → back to listening … until the user taps to stop ("Tap mic to stop")
```

## Barge-in

Tapping the microphone while speaking stops current audio immediately and
returns to `listening`. Only one audio response ever plays at a time.

## Context

Every message carries the full form context: current step, category, event
values, category details, focused field, validation errors, completed and
missing required fields, and the next step. "What should I put here?" is
answered from the focused field, never generically.

## Voice automation

Commands are parsed locally in `voice-commands.ts` — deterministic,
instant, and quota-free (no LLM call):

- "set event name to Launch Night" → fills the field, announces it
- "set budget to 1.5 lakh" → parses Indian money formats
- "set duration to three hours" → converts to 180 minutes
- "select performer" → switches category
- "next" / "back" / "go to review" → navigates steps
- "focus event name" → focuses the field
- Hindi: "location Hyderabad rakho", "performer chuno", "aage badho"

The backend returns `{ response, suggestedAction }`; the frontend applies
the action (`lib/voice-actions.ts`) before speaking, with a visible toast
for every change. Gemini can also emit actions via an ```action JSON
fence for phrasing the parser does not cover.

Saying "submit the form" (or "submit karo") returns a
`SUBMIT_REQUIREMENT` action that triggers the same validated submit as the
button — including full-form validation.

## Demo inspector

Append `?voice-debug=1` to the page URL to show a live API inspector
(bottom-left): transcript → message context → LLM reply with timing →
applied action → TTS timing. Ideal for recordings: the whole
request/response flow is visible while the voice speaks.

## Quota resilience

LLM calls chain Groq → OpenRouter. There is no mock in the chain: without a provider the API answers 503 honestly. If Groq returns 429 or 5xx, the service tries OpenRouter; if that also fails it returns the error honestly. Direct commands never touch any
quota at all. The user never sees a dead assistant for LLM outages.

## Providers

| Layer | Interface | Real | Fallback |
|-------|-----------|------|----------|
| STT | `STTProvider` | Browser SpeechRecognition (`en-US`/`hi-IN`) | Mock endpoint |
| LLM | `LLMProvider` | `GroqLLMProvider` (`GROQ_API_KEY`, model `qwen/qwen3.8-27b`) | `OpenRouterLLMProvider` (`OPENROUTER_API_KEY`, default `inclusionai/ling-3.0-flash-sante:free`), then `MockLLMProvider` (rule-based, contextual) |
| TTS | `TTSProvider` | `CartesiaTTSProvider` (`CARTESIA_API_KEY`): Iris voice + `sonic-2` for English, Lavanya voice + `sonic-turbo` for Hindi | Device `speechSynthesis`, then timed simulation |

Playback prefers server MP3 decoded through a gesture-created
`AudioContext` (immune to autoplay blocks), then HTMLAudio, then device
speech. The EN/हिं toggle switches recognition language, LLM reply
language, Cartesia voice/model, and device-speech locale together;
the choice persists in `localStorage`.

Provider code lives behind interfaces in `apps/api/src/providers/`.
Swap vendors without touching services or the frontend.

## Resilience

Any voice failure (mic denied, STT/LLM/TTS error, network) puts the
assistant in `error` with a recoverable message. The form always works —
voice is an enhancement, never a dependency. Provider keys stay
server-side; the frontend only receives text and playable audio.
Request correlation uses `X-Request-ID`; raw audio is never logged.
