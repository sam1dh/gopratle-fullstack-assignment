import type { AssistantLanguage } from "@gopratle/contracts";

export interface TTSProvider {
  readonly name: string;
  readonly mimeType: string;
  synthesize(
    text: string,
    language?: AssistantLanguage
  ): Promise<{ audioBase64: string; mimeType: string }>;
}
