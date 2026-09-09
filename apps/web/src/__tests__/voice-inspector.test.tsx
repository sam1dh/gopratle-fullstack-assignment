import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VoiceInspector } from "../../components/voice-assistant/VoiceInspector";
import type { VoiceExchange } from "../../hooks/useVoiceAssistant";

const exchange: VoiceExchange = {
  at: "2026-09-10T10:00:00.000Z",
  transcript: "set event name to Launch Night",
  language: "en",
  request: {
    message: "set event name to Launch Night",
    language: "en",
    context: {
      currentStep: "event-basics",
      category: null,
      event: {},
      categoryDetails: {},
      validationErrors: [],
      completedFields: [],
      missingRequiredFields: ["name"],
    },
  },
  responseText: "Done. Event name set to Launch Night.",
  action: { type: "SUGGEST_FIELD_VALUE", field: "event.name", value: "Launch Night" },
  timings: { llmMs: 120, ttsMs: 300 },
  error: null,
};

describe("VoiceInspector", () => {
  it("renders nothing without the debug flag", () => {
    render(<VoiceInspector exchange={exchange} />);
    expect(screen.queryByText(/Voice API flow/i)).toBeNull();
  });

  it("shows the full request/response flow when enabled", () => {
    render(<VoiceInspector exchange={exchange} enabled />);
    expect(screen.getByText(/Voice API flow/i)).toBeVisible();
    expect(screen.getByText(/set event name to Launch Night/)).toBeVisible();
    expect(screen.getByText(/Done\. Event name set to Launch Night\./)).toBeVisible();
    expect(screen.getByText(/SUGGEST_FIELD_VALUE/)).toBeVisible();
    expect(screen.getByText(/event-basics/)).toBeVisible();
    expect(screen.getByText(/120ms/)).toBeVisible();
  });

  it("collapses on header click", () => {
    render(<VoiceInspector exchange={exchange} enabled />);
    fireEvent.click(screen.getByText(/Voice API flow/i));
    expect(screen.queryByText(/SUGGEST_FIELD_VALUE/)).toBeNull();
  });
});
