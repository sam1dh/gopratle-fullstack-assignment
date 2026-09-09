import type { AssistantLanguage } from "@gopratle/contracts";
import type { TTSProvider } from "./TTSProvider.js";
import { ApiError } from "../../utils/api-error.js";

const LANG_MAP: Record<AssistantLanguage, string> = {
  en: "en-IN",
  hi: "hi-IN",
};

const SPEAKER_MAP: Record<AssistantLanguage, string> = {
  en: "ritu",
  hi: "shubh",
};

// Sarvam AI Bulbul v3 TTS — fallback when Cartesia is unavailable.
// Docs: https://docs.sarvam.ai/api-reference/text-to-speech
export class SarvamTTSProvider implements TTSProvider {
  readonly name = "sarvam";
  readonly mimeType = "audio/mpeg";

  constructor(private readonly apiKey: string) {}

  async synthesize(
    text: string,
    language: AssistantLanguage = "en"
  ): Promise<{ audioBase64: string; mimeType: string }> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);
    try {
      const res = await fetch("https://api.sarvam.ai/text-to-speech", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": this.apiKey,
        },
        body: JSON.stringify({
          text,
          target_language_code: LANG_MAP[language],
          model: "bulbul:v3",
          speaker: SPEAKER_MAP[language],
          output_audio_codec: "mp3",
          speech_sample_rate: 44100,
        }),
      });
      if (!res.ok) {
        throw new ApiError(500, "Sarvam TTS unavailable", "TTS_ERROR");
      }
      const body = (await res.json()) as { audios?: string[] };
      const audio = body?.audios?.[0];
      if (!audio) {
        throw new ApiError(500, "Sarvam TTS returned no audio", "TTS_ERROR");
      }
      return { audioBase64: audio, mimeType: this.mimeType };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(500, "Sarvam TTS unavailable", "TTS_ERROR");
    } finally {
      clearTimeout(timer);
    }
  }
}
