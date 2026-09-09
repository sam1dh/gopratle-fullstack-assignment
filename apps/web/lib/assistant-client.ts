import type {
  AssistantMessageRequest,
  AssistantMessageResponse,
  SpeakRequest,
  SpeakResponse,
} from "@gopratle/contracts";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export async function postAssistantMessage(
  input: AssistantMessageRequest
): Promise<AssistantMessageResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/assistant/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || "Assistant is unavailable");
  }
  return data as AssistantMessageResponse;
}

export async function postSpeak(input: SpeakRequest): Promise<SpeakResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/assistant/speak`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || "Speech synthesis is unavailable");
  }
  return data as SpeakResponse;
}
