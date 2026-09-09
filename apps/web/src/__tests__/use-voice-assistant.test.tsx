import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useVoiceAssistant } from "../../hooks/useVoiceAssistant";
import type { RequirementAssistantContext } from "@gopratle/contracts";

const context: RequirementAssistantContext = {
  currentStep: "event-basics",
  category: "performer",
  event: {},
  categoryDetails: {},
  validationErrors: [],
  completedFields: [],
  missingRequiredFields: ["name"],
};

class FakeRecognition {
  lang = "";
  interimResults = false;
  maxAlternatives = 1;
  onresult: ((e: { results: { transcript: string }[][] }) => void) | null = null;
  onerror: ((e: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  started = false;
  stopped = false;
  start() {
    this.started = true;
  }
  stop() {
    this.stopped = true;
  }
  abort() {
    this.stopped = true;
  }
  emitResult(transcript: string) {
    this.onresult?.({ results: [[{ transcript }]] });
  }
  emitEnd() {
    this.onend?.();
  }
}

let instances: FakeRecognition[] = [];

describe("useVoiceAssistant", () => {
  beforeEach(() => {
    instances = [];
    vi.stubGlobal(
      "SpeechRecognition",
      class extends FakeRecognition {
        constructor() {
          super();
          instances.push(this);
        }
      }
    );
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { response: "Choose Product Launch.", suggestedAction: { type: "NONE" } },
      }),
    }));
    // No device speechSynthesis in jsdom: hook simulates speaking time.
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("starts idle with English by default", () => {
    const { result } = renderHook(() =>
      useVoiceAssistant({ buildContext: () => context })
    );
    expect(result.current.state).toBe("idle");
    expect(result.current.language).toBe("en");
    expect(result.current.continuous).toBe(false);
  });

  it("toggle starts a continuous session with a greeting, then listens", async () => {
    const { result } = renderHook(() =>
      useVoiceAssistant({ buildContext: () => context })
    );
    act(() => {
      result.current.toggle();
    });
    // Greeting is spoken first (fetch mocked: no real audio -> timer fallback)
    expect(result.current.state).toBe("speaking");
    expect(result.current.continuous).toBe(true);

    await act(async () => {
      await vi.runAllTimersAsync();
    });
    expect(result.current.state).toBe("listening");
    expect(instances).toHaveLength(1);
  });

  it("loops back to listening after answering (stays on)", async () => {
    const { result } = renderHook(() =>
      useVoiceAssistant({ buildContext: () => context })
    );
    act(() => {
      result.current.toggle();
    });
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    expect(result.current.state).toBe("listening");

    await act(async () => {
      instances[0].emitResult("What should I select for event type?");
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current.state).toBe("speaking");

    await act(async () => {
      await vi.runAllTimersAsync();
    });
    // Continuous: back to listening instead of idle
    expect(result.current.state).toBe("listening");
    expect(instances).toHaveLength(2);
    expect(result.current.continuous).toBe(true);
  });

  it("toggle while active stops the session", async () => {
    const { result } = renderHook(() =>
      useVoiceAssistant({ buildContext: () => context })
    );
    act(() => {
      result.current.toggle();
    });
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    expect(result.current.state).toBe("listening");

    act(() => {
      result.current.toggle();
    });
    expect(result.current.state).toBe("idle");
    expect(result.current.continuous).toBe(false);
  });

  it("enters error state when recognition is unsupported", async () => {
    vi.unstubAllGlobals();
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useVoiceAssistant({ buildContext: () => context, onError })
    );
    act(() => {
      result.current.toggle();
    });
    // Greeting finishes first, then listening fails without STT support.
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    expect(result.current.state).toBe("error");
    expect(result.current.errorMessage).toMatch(/not supported/i);
    expect(onError).toHaveBeenCalled();
  });

  it("setLanguage switches recognition language and persists it", async () => {
    const { result } = renderHook(() =>
      useVoiceAssistant({ buildContext: () => context })
    );
    act(() => {
      result.current.setLanguage("hi");
    });
    expect(result.current.language).toBe("hi");
    expect(localStorage.getItem("gopratle.voice.lang")).toBe("hi");

    act(() => {
      result.current.toggle();
    });
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    expect(instances[0].lang).toBe("hi-IN");
  });

  it("records the exchange for the API inspector", async () => {
    const { result } = renderHook(() =>
      useVoiceAssistant({ buildContext: () => context })
    );
    expect(result.current.lastExchange).toBeNull();
    act(() => {
      result.current.toggle();
    });
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    await act(async () => {
      instances[0].emitResult("What should I select?");
      await vi.advanceTimersByTimeAsync(0);
    });
    const ex = result.current.lastExchange;
    expect(ex?.transcript).toBe("What should I select?");
    expect(ex?.request.message).toBe("What should I select?");
    expect(ex?.responseText).toBe("Choose Product Launch.");
    expect(ex?.timings.llmMs).not.toBeNull();
  });

  it("calls onAction when the reply carries an automation action", async () => {
    const actionFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          response: "Done.",
          suggestedAction: { type: "SUGGEST_FIELD_VALUE", field: "event.name", value: "X" },
        },
      }),
    });
    vi.stubGlobal("fetch", actionFetch);
    const onAction = vi.fn();
    const { result } = renderHook(() =>
      useVoiceAssistant({ buildContext: () => context, onAction })
    );
    act(() => {
      result.current.toggle();
    });
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    await act(async () => {
      instances[0].emitResult("set event name to X");
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(onAction).toHaveBeenCalledWith({
      type: "SUGGEST_FIELD_VALUE",
      field: "event.name",
      value: "X",
    });
  });

  it("sends the selected language with assistant messages", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { response: "ok", suggestedAction: { type: "NONE" } },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() =>
      useVoiceAssistant({ buildContext: () => context })
    );
    act(() => {
      result.current.setLanguage("hi");
    });
    act(() => {
      result.current.toggle();
    });
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    await act(async () => {
      instances[0].emitResult("Namaste");
      await vi.advanceTimersByTimeAsync(0);
    });
    const messageCall = fetchMock.mock.calls.find((c: unknown[]) =>
      String(c[0]).endsWith("/assistant/message")
    );
    expect(messageCall).toBeTruthy();
    expect(JSON.parse(String(messageCall?.[1]?.body))).toMatchObject({ language: "hi" });
  });
});
