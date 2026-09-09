import type { AssistantLanguage } from "@gopratle/contracts";
import type { TTSProvider } from "./TTSProvider.js";
import { ApiError } from "../../utils/api-error.js";

export interface CartesiaVoices {
  en: string;
  hi: string;
}

const MODEL_FOR_LANGUAGE: Record<AssistantLanguage, string> = {
  // sonic-2 serves English; Hindi is served by sonic-turbo
  // (sonic-multilingual is sunset).
  en: "sonic-2",
  hi: "sonic-turbo",
};

// Real TTS provider backed by Cartesia. Keys stay server-side.
// Default voices are feminine: Iris (en), Lavanya (hi).
export class CartesiaTTSProvider implements TTSProvider {
  readonly name = "cartesia";
  readonly mimeType = "audio/mpeg";

  constructor(
    private readonly apiKey: string,
    private readonly voices: CartesiaVoices = {
      en: "c894559e-d529-4d70-a6fb-3330ecf7ef6b",
      hi: "c6bbc7d5-4b35-4d49-b1c6-4417019a61c1",
    }
  ) {}

  async synthesize(
    text: string,
    language: AssistantLanguage = "en"
  ): Promise<{ audioBase64: string; mimeType: string }> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);
    try {
      const res = await fetch("https://api.cartesia.ai/tts/bytes", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.apiKey,
          "Cartesia-Version": "2024-06-10",
        },
        body: JSON.stringify({
          model_id: MODEL_FOR_LANGUAGE[language],
          transcript: text,
          voice: { mode: "id", id: this.voices[language] },
          output_format: { container: "mp3", encoding: "mp3", sample_rate: 44100 },
          language,
        }),
      });
      if (!res.ok) {
        throw new ApiError(500, "Speech synthesis is unavailable", "TTS_ERROR");
      }
      const bytes = new Uint8Array(await res.arrayBuffer());
      if (bytes.length === 0) {
        throw new ApiError(500, "Speech synthesis returned no audio", "TTS_ERROR");
      }
      return {
        audioBase64: Buffer.from(bytes).toString("base64"),
        mimeType: this.mimeType,
      };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(500, "Speech synthesis is unavailable", "TTS_ERROR");
    } finally {
      clearTimeout(timer);
    }
  }
}
