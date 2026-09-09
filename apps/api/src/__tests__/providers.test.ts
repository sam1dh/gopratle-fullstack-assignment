import { describe, it, expect, vi, afterEach } from "vitest";
import { GroqLLMProvider } from "../providers/llm/GroqLLMProvider.js";
import { OpenRouterLLMProvider } from "../providers/llm/OpenRouterLLMProvider.js";
import { CartesiaTTSProvider } from "../providers/tts/CartesiaTTSProvider.js";
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

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("GroqLLMProvider", () => {
  it("returns the model text with a NONE action", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "Choose Product Launch." } }],
        }),
      })
    );
    const provider = new GroqLLMProvider("test-key");
    const out = await provider.generate({ message: "What type?", context: { ...context } });
    expect(out.response).toBe("Choose Product Launch.");
    expect(out.suggestedAction).toEqual({ type: "NONE" });
  });

  it("throws ASSISTANT_ERROR when the vendor fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    const provider = new GroqLLMProvider("bad-key");
    await expect(
      provider.generate({ message: "hi", context: { ...context } })
    ).rejects.toMatchObject({ code: "ASSISTANT_ERROR" });
  });

  it("throws ASSISTANT_ERROR on empty candidates", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ choices: [] }) })
    );
    const provider = new GroqLLMProvider("test-key");
    await expect(
      provider.generate({ message: "hi", context: { ...context } })
    ).rejects.toMatchObject({ code: "ASSISTANT_ERROR" });
  });
});

describe("CartesiaTTSProvider", () => {
  it("returns base64 mp3 audio", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
    });
    vi.stubGlobal("fetch", fetchMock);
    const provider = new CartesiaTTSProvider("test-key");
    const out = await provider.synthesize("Hello", "en");
    expect(out.mimeType).toBe("audio/mpeg");
    expect(out.audioBase64).toBe(Buffer.from([1, 2, 3]).toString("base64"));
    const body = JSON.parse(String(fetchMock.mock.calls[0][1].body));
    expect(body.model_id).toBe("sonic-2");
    expect(body.language).toBe("en");
  });

  it("uses the Hindi model and voice for Hindi", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
    });
    vi.stubGlobal("fetch", fetchMock);
    const provider = new CartesiaTTSProvider("test-key");
    await provider.synthesize("Namaste", "hi");
    const body = JSON.parse(String(fetchMock.mock.calls[0][1].body));
    expect(body.model_id).toBe("sonic-turbo");
    expect(body.language).toBe("hi");
    expect(body.voice.id).toBe("c6bbc7d5-4b35-4d49-b1c6-4417019a61c1");
  });

  it("throws TTS_ERROR when the vendor fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    const provider = new CartesiaTTSProvider("bad-key");
    await expect(provider.synthesize("Hello")).rejects.toMatchObject({
      code: "TTS_ERROR",
    });
  });
});

describe("OpenRouterLLMProvider", () => {
  it("returns the model text and parses an action fence", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content:
                  'Done.\n```action\n{"type": "SUGGEST_FIELD_VALUE", "field": "event.name", "value": "X"}\n```',
              },
            },
          ],
        }),
      })
    );
    const provider = new OpenRouterLLMProvider("test-key");
    const out = await provider.generate({ message: "set name", context: { ...context } });
    expect(out.response).toBe("Done.");
    expect(out.suggestedAction).toEqual({
      type: "SUGGEST_FIELD_VALUE",
      field: "event.name",
      value: "X",
    });
  });

  it("maps 429 to QUOTA_EXHAUSTED", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 429 }));
    const provider = new OpenRouterLLMProvider("test-key");
    await expect(
      provider.generate({ message: "hi", context: { ...context } })
    ).rejects.toMatchObject({ code: "QUOTA_EXHAUSTED" });
  });

  it("throws ASSISTANT_ERROR on empty choices", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ choices: [] }) })
    );
    const provider = new OpenRouterLLMProvider("test-key");
    await expect(
      provider.generate({ message: "hi", context: { ...context } })
    ).rejects.toMatchObject({ code: "ASSISTANT_ERROR" });
  });
});

describe("extractAction", () => {
  it("strips think blocks instead of speaking them", async () => {
    const { extractAction } = await import("../providers/llm/llm-action.js");
    const out = extractAction(
      "<think>Let me reason about form fields</think>Choose Product Launch."
    );
    expect(out.response).toBe("Choose Product Launch.");
    expect(out.action).toEqual({ type: "NONE" });
  });

  it("parses json fences", async () => {
    const { extractAction } = await import("../providers/llm/llm-action.js");
    const out = extractAction(
      'Done.\n```json\n{"type": "GO_TO_STEP", "value": "review"}\n```'
    );
    expect(out.response).toBe("Done.");
    expect(out.action).toEqual({ type: "GO_TO_STEP", value: "review" });
  });

  it("salvages cut-off fences without speaking them", async () => {
    const { extractAction } = await import("../providers/llm/llm-action.js");
    const out = extractAction(
      'Setting it.\n```action\n{"type": "SUGGEST_FIELD_VALUE", "field": "event.name", "value": "X"}'
    );
    expect(out.response).toBe("Setting it.");
    expect(out.action).toEqual({
      type: "SUGGEST_FIELD_VALUE",
      field: "event.name",
      value: "X",
    });
  });

  it("strips bare JSON actions", async () => {
    const { extractAction } = await import("../providers/llm/llm-action.js");
    const out = extractAction(
      'Updated. {"type": "FOCUS_FIELD", "field": "eventName"} thanks'
    );
    expect(out.response).not.toContain("{");
    expect(out.action).toEqual({ type: "FOCUS_FIELD", field: "eventName" });
  });
});

describe("sanitizeSpoken", () => {
  it("removes reordered bare JSON and markdown", async () => {
    const { sanitizeSpoken } = await import("../providers/llm/llm-action.js");
    expect(
      sanitizeSpoken('Sure. {"field": "event.name", "type": "SUGGEST_FIELD_VALUE", "value": "X"} done')
    ).not.toContain("{");
    expect(sanitizeSpoken("**Hello** world")).toBe("Hello world");
  });
});
