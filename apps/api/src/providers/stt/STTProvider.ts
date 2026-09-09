export interface STTTranscribeInput {
  mimeType?: string;
  sizeBytes?: number;
  durationMs?: number;
}

export interface STTProvider {
  readonly name: string;
  transcribe(input: STTTranscribeInput): Promise<{ text: string }>;
}
