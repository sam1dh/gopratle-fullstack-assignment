import { describe, it, expect } from "vitest";
import { buildAssistantContext, type WizardSnapshot } from "../../lib/assistant-context";

const base: WizardSnapshot = {
  step: "basics",
  category: "performer",
  event: { name: "Launch Night", type: "Product Launch" },
  plannerDetails: {},
  performerDetails: { performanceType: "DJ" },
  crewDetails: {},
  errors: {},
};

describe("buildAssistantContext", () => {
  it("maps wizard step to assistant step", () => {
    expect(buildAssistantContext(base).currentStep).toBe("event-basics");
    expect(buildAssistantContext({ ...base, step: "review" }).currentStep).toBe("review");
  });

  it("computes missing event fields", () => {
    const ctx = buildAssistantContext(base);
    expect(ctx.missingRequiredFields).toContain("startDate");
    expect(ctx.missingRequiredFields).toContain("endDate");
    expect(ctx.missingRequiredFields).toContain("location");
    expect(ctx.completedFields).toContain("name");
    expect(ctx.completedFields).toContain("type");
  });

  it("flags missing category when none selected", () => {
    const ctx = buildAssistantContext({ ...base, category: null });
    expect(ctx.missingRequiredFields).toContain("category");
  });

  it("computes performer-specific missing fields", () => {
    const ctx = buildAssistantContext(base);
    expect(ctx.missingRequiredFields).toContain("performerCount");
    expect(ctx.missingRequiredFields).toContain("budget");
    expect(ctx.completedFields).toContain("performanceType");
  });

  it("forwards validation errors and current field", () => {
    const ctx = buildAssistantContext({
      ...base,
      errors: { location: "Location is required" },
      currentField: "eventType",
    });
    expect(ctx.validationErrors).toEqual([
      { field: "location", message: "Location is required" },
    ]);
    expect(ctx.currentField).toBe("eventType");
  });

  it("reports ready state when nothing is missing", () => {
    const ctx = buildAssistantContext({
      step: "review",
      category: "performer",
      event: {
        name: "Show",
        type: "Concert",
        startDate: "2026-12-20",
        endDate: "2026-12-20",
        location: "Hyderabad",
      },
      plannerDetails: {},
      performerDetails: {
        performanceType: "Live Band",
        performerCount: 5,
        performanceDurationMinutes: 90,
        budget: 75000,
      },
      crewDetails: {},
      errors: {},
    });
    expect(ctx.missingRequiredFields).toEqual([]);
    expect(ctx.nextStep).toBe("Submit the requirement");
  });
});
