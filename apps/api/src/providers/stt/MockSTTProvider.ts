import type {
  STTProvider,
  STTTranscribeInput,
} from "./STTProvider.js";

// Mock STT: verifies the audio pipeline without calling a vendor.
// Swap with a real provider (e.g. Whisper) behind the same interface.
export class MockSTTProvider implements STTProvider {
  readonly name = "mock-stt";

  async transcribe(_input: STTTranscribeInput): Promise<{ text: string }> {
    return { text: "What should I enter here?" };
  }
}
