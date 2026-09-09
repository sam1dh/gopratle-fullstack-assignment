import { describe, it, expect } from "vitest";
import { parseVoiceCommand } from "../services/voice-commands.js";
import type { RequirementAssistantContext } from "@gopratle/contracts";

const base: RequirementAssistantContext = {
  currentStep: "event-basics",
  category: "performer",
  event: {},
  categoryDetails: {},
  validationErrors: [],
  completedFields: [],
  missingRequiredFields: ["name"],
};

describe("parseVoiceCommand", () => {
  it("parses set event name", () => {
    const out = parseVoiceCommand("set event name to Launch Night", base, "en");
    expect(out?.action).toEqual({
      type: "SUGGEST_FIELD_VALUE",
      field: "event.name",
      value: "Launch Night",
    });
    expect(out?.confirmation).toMatch(/Launch Night/);
  });

  it("parses budget with lakh", () => {
    const out = parseVoiceCommand("set budget to 1.5 lakh", base, "en");
    expect(out?.action).toEqual({
      type: "SUGGEST_FIELD_VALUE",
      field: "details.budget",
      value: 150000,
    });
  });

  it("parses duration in hours to minutes", () => {
    const out = parseVoiceCommand("set duration to three hours", base, "en");
    expect(out?.action).toEqual({
      type: "SUGGEST_FIELD_VALUE",
      field: "details.performanceDurationMinutes",
      value: 180,
    });
  });

  it("parses performer count words", () => {
    const out = parseVoiceCommand("set performer count to five", base, "en");
    expect(out?.action?.value).toBe(5);
  });

  it("parses category select", () => {
    const out = parseVoiceCommand("select performer", base, "en");
    expect(out?.action).toEqual({
      type: "SUGGEST_FIELD_VALUE",
      field: "category",
      value: "performer",
    });
  });

  it("parses go-to-step commands", () => {
    expect(parseVoiceCommand("next", base, "en")?.action).toEqual({
      type: "GO_TO_STEP",
      value: "next",
    });
    expect(parseVoiceCommand("go to review", base, "en")?.action).toEqual({
      type: "GO_TO_STEP",
      value: "review",
    });
    expect(parseVoiceCommand("back", base, "en")?.action).toEqual({
      type: "GO_TO_STEP",
      value: "back",
    });
  });

  it("parses focus commands", () => {
    expect(parseVoiceCommand("focus event name", base, "en")?.action).toEqual({
      type: "FOCUS_FIELD",
      field: "eventName",
    });
  });

  it("parses dates to ISO", () => {
    const out = parseVoiceCommand("set start date to 2026-12-20", base, "en");
    expect(out?.action?.value).toBe("2026-12-20");
  });

  it("parses times", () => {
    const crew = { ...base, category: "crew" as const };
    const out = parseVoiceCommand("set shift start to 9 am", crew, "en");
    expect(out?.action).toEqual({
      type: "SUGGEST_FIELD_VALUE",
      field: "details.shiftStart",
      value: "09:00",
    });
  });

  it("parses experience level synonyms", () => {
    const crew = { ...base, category: "crew" as const };
    const out = parseVoiceCommand("set experience to expert", crew, "en");
    expect(out?.action?.value).toBe("expert");
  });

  it("parses Hindi set-location command", () => {
    const out = parseVoiceCommand("location Hyderabad rakho", base, "hi");
    expect(out?.action).toEqual({
      type: "SUGGEST_FIELD_VALUE",
      field: "event.location",
      value: "Hyderabad",
    });
    expect(out?.confirmation).toMatch(/rakha gaya/);
  });

  it("returns null for open questions", () => {
    expect(parseVoiceCommand("What should I put here?", base, "en")).toBeNull();
    expect(parseVoiceCommand("Is everything ready?", base, "en")).toBeNull();
  });

  it("returns null for unknown fields", () => {
    expect(parseVoiceCommand("set spaceship to Mars", base, "en")).toBeNull();
  });

  it("parses submit commands", () => {
    for (const msg of ["submit", "submit the form", "submit my requirement", "post it"]) {
      expect(parseVoiceCommand(msg, base, "en")?.action).toEqual({
        type: "SUBMIT_REQUIREMENT",
      });
    }
    expect(parseVoiceCommand("submit karo", base, "hi")?.action).toEqual({
      type: "SUBMIT_REQUIREMENT",
    });
  });
});

describe("parseVoiceCommand dates", () => {
  it("defaults a missing year to current or next year", async () => {
    const { parseVoiceCommand } = await import("../services/voice-commands.js");
    const ctx: RequirementAssistantContext = {
      currentStep: "event-basics",
      category: null,
      event: {},
      categoryDetails: {},
      validationErrors: [],
      completedFields: [],
      missingRequiredFields: [],
    };
    const out = parseVoiceCommand("set start date to December 20", ctx, "en");
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const expectedYear = month === 11 && new Date().getDate() > 20 ? year + 1 : year;
    expect(out?.action?.value).toBe(
      month === 11 && new Date().getDate() > 20
        ? `${expectedYear}-12-20`
        : `${year}-12-20`
    );
  });
});

describe("parseVoiceCommand confirmations", () => {
  it("speaks dates humanized, not as digits", async () => {
    const { parseVoiceCommand } = await import("../services/voice-commands.js");
    const ctx: RequirementAssistantContext = {
      currentStep: "event-basics",
      category: null,
      event: {},
      categoryDetails: {},
      validationErrors: [],
      completedFields: [],
      missingRequiredFields: [],
    };
    const out = parseVoiceCommand("set end date to 2026-12-20", ctx, "en");
    expect(out?.confirmation).toMatch(/20 December 2026/);
    expect(out?.confirmation).not.toMatch(/2026-12-20/);
  });
});

describe("parseVoiceCommand money words", () => {
  it("parses fifty thousand rupees as 50000", async () => {
    const { parseVoiceCommand } = await import("../services/voice-commands.js");
    const base: RequirementAssistantContext = {
      currentStep: "requirements",
      category: "performer",
      event: {},
      categoryDetails: {},
      validationErrors: [],
      completedFields: [],
      missingRequiredFields: [],
    };
    const out = parseVoiceCommand("set budget to fifty thousand rupees", base, "en");
    expect(out?.action?.value).toBe(50000);
    expect(out?.confirmation).toMatch(/50,000/);
  });
});
