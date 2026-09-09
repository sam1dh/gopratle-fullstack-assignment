import { describe, it, expect, vi } from "vitest";
import { AssistantService } from "../services/assistant.service.js";
import { MockSTTProvider } from "../providers/stt/MockSTTProvider.js";
import { MockTTSProvider } from "../providers/tts/MockTTSProvider.js";
import { ApiError } from "../utils/api-error.js";
import type { RequirementAssistantContext } from "@gopratle/contracts";

const context: RequirementAssistantContext = {
  currentStep: "event-basics",
  category: null,
  event: {},
  categoryDetails: {},
  validationErrors: [],
  completedFields: [],
  missingRequiredFields: ["name"],
};

function stubPrimary() {
  return {
    name: "groq",
    generate: vi.fn().mockResolvedValue({
      response: "Primary answer.",
      suggestedAction: { type: "NONE" },
    }),
  };
}

describe("AssistantService resilience", () => {
  it("answers direct commands without calling the LLM", async () => {
    const llm = { name: "spy", generate: vi.fn() };
    const service = new AssistantService(
      llm,
      new MockSTTProvider(),
      new MockTTSProvider(),
      null
    );
    const out = await service.answer({
      message: "set event name to Launch Night",
      language: "en",
      context,
    });
    expect(llm.generate).not.toHaveBeenCalled();
    expect(out.suggestedAction).toEqual({
      type: "SUGGEST_FIELD_VALUE",
      field: "event.name",
      value: "Launch Night",
    });
  });

  it("uses the primary LLM when healthy (no fallback call)", async () => {
    const primary = stubPrimary();
    const fallback = {
      name: "openrouter",
      generate: vi.fn(),
    };
    const service = new AssistantService(
      primary,
      new MockSTTProvider(),
      new MockTTSProvider(),
      fallback
    );
    const out = await service.answer({
      message: "Tell me about budgets",
      language: "en",
      context,
    });
    expect(out.response).toBe("Primary answer.");
    expect(fallback.generate).not.toHaveBeenCalled();
  });

  it("tries the OpenRouter fallback on primary 429", async () => {
    const quotaLLM = {
      name: "groq",
      generate: vi.fn().mockRejectedValue(new ApiError(429, "quota", "QUOTA_EXHAUSTED")),
    };
    const openRouter = {
      name: "openrouter",
      generate: vi.fn().mockResolvedValue({
        response: "OpenRouter answer.",
        suggestedAction: { type: "NONE" },
      }),
    };
    const service = new AssistantService(
      quotaLLM,
      new MockSTTProvider(),
      new MockTTSProvider(),
      openRouter
    );
    const out = await service.answer({
      message: "Tell me about budgets",
      language: "en",
      context,
    });
    expect(openRouter.generate).toHaveBeenCalled();
    expect(out.response).toBe("OpenRouter answer.");
  });

  it("throws honestly when both providers fail (no mock)", async () => {
    const quotaLLM = {
      name: "groq",
      generate: vi.fn().mockRejectedValue(new ApiError(429, "quota", "QUOTA_EXHAUSTED")),
    };
    const deadFallback = {
      name: "openrouter",
      generate: vi.fn().mockRejectedValue(new ApiError(500, "down", "ASSISTANT_ERROR")),
    };
    const service = new AssistantService(
      quotaLLM,
      new MockSTTProvider(),
      new MockTTSProvider(),
      deadFallback
    );
    await expect(
      service.answer({ message: "Tell me about budgets", language: "en", context })
    ).rejects.toMatchObject({ code: "ASSISTANT_ERROR" });
  });

  it("throws 503 when no LLM is configured", async () => {
    const prevGroq = process.env.GROQ_API_KEY;
    const prevOR = process.env.OPENROUTER_API_KEY;
    process.env.MONGODB_URI =
      process.env.MONGODB_URI ?? "mongodb://localhost:27017/test";
    delete process.env.GROQ_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
    const { resetEnv } = await import("../config/env.js");
    resetEnv();
    try {
      const service = new AssistantService(
        null,
        new MockSTTProvider(),
        new MockTTSProvider(),
        null
      );
      // Without keys there is no mock to hide behind: honest 503.
      await expect(
        service.answer({ message: "Tell me about budgets", language: "en", context })
      ).rejects.toMatchObject({ code: "ASSISTANT_UNAVAILABLE" });
    } finally {
      if (prevGroq !== undefined) process.env.GROQ_API_KEY = prevGroq;
      if (prevOR !== undefined) process.env.OPENROUTER_API_KEY = prevOR;
      resetEnv();
    }
  });

  it("rethrows non-retryable errors", async () => {
    const badLLM = {
      name: "groq",
      generate: vi.fn().mockRejectedValue(new ApiError(400, "bad", "VALIDATION_ERROR")),
    };
    const service = new AssistantService(
      badLLM,
      new MockSTTProvider(),
      new MockTTSProvider(),
      null
    );
    await expect(
      service.answer({ message: "hello there friend", language: "en", context })
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
});
