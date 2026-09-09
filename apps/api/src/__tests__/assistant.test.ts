import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";

vi.mock("../config/env.js", () => ({
  getEnv: () => ({
    NODE_ENV: "test",
    PORT: 5000,
    MONGODB_URI: "mongodb://localhost:27017/test",
    FRONTEND_URL: "http://localhost:3000",
    GROQ_API_KEY: "test-groq-key",
    GROQ_MODEL: "test-model",
    OPENROUTER_API_KEY: "test-openrouter-key",
    OPENROUTER_MODEL: "test-fallback-model",
  }),
}));

import app from "../app.js";

const baseContext = {
  currentStep: "event-basics",
  category: "performer",
  event: { name: "Launch Night" },
  categoryDetails: {},
  validationErrors: [],
  completedFields: ["name"],
  missingRequiredFields: ["type", "location"],
};

describe("POST /api/v1/assistant/message", () => {
  beforeEach(() => {
    // Route tests verify plumbing; provider intelligence is unit-tested.
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "Stubbed assistant answer." } }],
        }),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("answers an open question via the LLM", async () => {
    const res = await request(app)
      .post("/api/v1/assistant/message")
      .send({ message: "What should I put for event type?", context: { ...baseContext, currentField: "eventType" } });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.response).toBe("Stubbed assistant answer.");
    expect(res.body.data.suggestedAction).toEqual({ type: "NONE" });
  });

  it("answers direct commands without the LLM", async () => {
    const fetchMock = vi.mocked(fetch);
    const res = await request(app)
      .post("/api/v1/assistant/message")
      .send({
        message: "set event name to Launch Night",
        context: baseContext,
      });
    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(res.body.data.suggestedAction).toEqual({
      type: "SUGGEST_FIELD_VALUE",
      field: "event.name",
      value: "Launch Night",
    });
  });

  it("rejects missing message", async () => {
    const res = await request(app)
      .post("/api/v1/assistant/message")
      .send({ context: baseContext });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects invalid context", async () => {
    const res = await request(app)
      .post("/api/v1/assistant/message")
      .send({ message: "hi", context: { currentStep: "nope" } });
    expect(res.status).toBe(400);
  });

  it("answers an open question via the fallback when primary is throttled", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({ ok: false, status: 429 })
        .mockResolvedValue({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: "Fallback answer." } }],
          }),
        })
    );
    const res = await request(app)
      .post("/api/v1/assistant/message")
      .send({ message: "Tell me about budgets", context: baseContext });
    expect(res.status).toBe(200);
    expect(res.body.data.response).toBe("Fallback answer.");
  });
});

describe("POST /api/v1/assistant/transcribe", () => {
  it("returns mock transcription", async () => {
    const res = await request(app).post("/api/v1/assistant/transcribe").send({});
    expect(res.status).toBe(200);
    expect(res.body.data.text).toBeTruthy();
  });

  it("rejects oversized audio metadata", async () => {
    const res = await request(app)
      .post("/api/v1/assistant/transcribe")
      .send({ sizeBytes: 10 * 1024 * 1024 });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/v1/assistant/speak", () => {
  it("returns mock audio payload", async () => {
    const res = await request(app)
      .post("/api/v1/assistant/speak")
      .send({ text: "Hello there" });
    expect(res.status).toBe(200);
    expect(res.body.data.mimeType).toBeTruthy();
    expect(res.body.data.audioBase64).toBeTruthy();
  });

  it("rejects empty text", async () => {
    const res = await request(app).post("/api/v1/assistant/speak").send({ text: "" });
    expect(res.status).toBe(400);
  });
});
