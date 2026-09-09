import type { AssistantLanguage } from "@gopratle/contracts";
import type { TTSProvider } from "./TTSProvider.js";

// Mock TTS: returns the text as base64 so the pipeline is verifiable
// without vendor keys. The frontend prefers device speech synthesis
// for real audio; swap with a real provider behind this interface.
export class MockTTSProvider implements TTSProvider {
  readonly name = "mock-tts";
  readonly mimeType = "audio/mock";

  async synthesize(
    text: string,
    _language?: AssistantLanguage
  ): Promise<{ audioBase64: string; mimeType: string }> {
    return {
      audioBase64: Buffer.from(text, "utf-8").toString("base64"),
      mimeType: this.mimeType,
    };
  }
}
