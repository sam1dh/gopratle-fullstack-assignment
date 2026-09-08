import { describe, it, expect } from "vitest";
import {
  createRequirementSchema,
  plannerDetailsSchema,
  performerDetailsSchema,
  crewDetailsSchema,
  eventSchema,
} from "../index.js";

const validPlannerPayload = {
  category: "planner" as const,
  event: {
    name: "Hyderabad Product Launch Night",
    type: "Corporate Event",
    startDate: "2026-10-14",
    endDate: "2026-10-14",
    location: "Hyderabad, Telangana",
    venue: "The Leela Palace",
  },
  details: {
    guestCount: 200,
    servicesNeeded: ["catering", "decor"],
    budget: 500000,
    themeOrStyle: "Modern Corporate",
    specialRequirements: "VIP seating area",
  },
};

const validPerformerPayload = {
  category: "performer" as const,
  event: {
    name: "Summer Music Fest",
    type: "Concert",
    startDate: "2026-11-01",
    endDate: "2026-11-02",
    location: "Mumbai, Maharashtra",
  },
  details: {
    performanceType: "Live Band",
    genre: "Indie / Pop",
    performerCount: 5,
    performanceDurationMinutes: 90,
    budget: 75000,
    technicalRequirements: "PA system + monitors",
    portfolioUrl: "https://example.com/portfolio",
  },
};

const validCrewPayload = {
  category: "crew" as const,
  event: {
    name: "Film Shoot",
    type: "Production",
    startDate: "2026-10-20",
    endDate: "2026-10-25",
    location: "Pune, Maharashtra",
  },
  details: {
    crewRole: "Grip",
    crewCount: 4,
    experienceLevel: "intermediate" as const,
    shiftStart: "06:00",
    shiftEnd: "18:00",
    budget: 120000,
    equipmentRequired: "Dolly + track",
    specialRequirements: "Early call time",
  },
};

describe("eventSchema", () => {
  it("accepts valid event", () => {
    expect(eventSchema.safeParse(validPlannerPayload.event).success).toBe(true);
  });

  it("rejects missing event name", () => {
    const result = eventSchema.safeParse({
      ...validPlannerPayload.event,
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects end date before start date", () => {
    const result = eventSchema.safeParse({
      ...validPlannerPayload.event,
      startDate: "2026-10-20",
      endDate: "2026-10-15",
    });
    expect(result.success).toBe(false);
  });

  it("allows same start and end date (single day)", () => {
    const result = eventSchema.safeParse({
      ...validPlannerPayload.event,
      startDate: "2026-10-14",
      endDate: "2026-10-14",
    });
    expect(result.success).toBe(true);
  });
});

describe("plannerDetailsSchema", () => {
  it("accepts valid planner details", () => {
    expect(
      plannerDetailsSchema.safeParse(validPlannerPayload.details).success
    ).toBe(true);
  });

  it("rejects guestCount of 0", () => {
    const result = plannerDetailsSchema.safeParse({
      ...validPlannerPayload.details,
      guestCount: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty servicesNeeded", () => {
    const result = plannerDetailsSchema.safeParse({
      ...validPlannerPayload.details,
      servicesNeeded: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative budget", () => {
    const result = plannerDetailsSchema.safeParse({
      ...validPlannerPayload.details,
      budget: -100,
    });
    expect(result.success).toBe(false);
  });
});

describe("performerDetailsSchema", () => {
  it("accepts valid performer details", () => {
    expect(
      performerDetailsSchema.safeParse(validPerformerPayload.details).success
    ).toBe(true);
  });

  it("rejects missing performanceType", () => {
    const result = performerDetailsSchema.safeParse({
      ...validPerformerPayload.details,
      performanceType: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects performerCount of 0", () => {
    const result = performerDetailsSchema.safeParse({
      ...validPerformerPayload.details,
      performerCount: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid portfolioUrl", () => {
    const result = performerDetailsSchema.safeParse({
      ...validPerformerPayload.details,
      portfolioUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("allows empty portfolioUrl", () => {
    const result = performerDetailsSchema.safeParse({
      ...validPerformerPayload.details,
      portfolioUrl: "",
    });
    expect(result.success).toBe(true);
  });

  it("allows missing optional fields", () => {
    const result = performerDetailsSchema.safeParse({
      performanceType: "DJ",
      performerCount: 1,
      performanceDurationMinutes: 60,
      budget: 30000,
    });
    expect(result.success).toBe(true);
  });
});

describe("crewDetailsSchema", () => {
  it("accepts valid crew details", () => {
    expect(
      crewDetailsSchema.safeParse(validCrewPayload.details).success
    ).toBe(true);
  });

  it("rejects missing crewRole", () => {
    const result = crewDetailsSchema.safeParse({
      ...validCrewPayload.details,
      crewRole: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid experienceLevel", () => {
    const result = crewDetailsSchema.safeParse({
      ...validCrewPayload.details,
      experienceLevel: "super",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid experience levels", () => {
    for (const level of ["entry", "intermediate", "expert"]) {
      const result = crewDetailsSchema.safeParse({
        ...validCrewPayload.details,
        experienceLevel: level,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe("createRequirementSchema (discriminated union)", () => {
  it("accepts valid planner requirement", () => {
    expect(createRequirementSchema.safeParse(validPlannerPayload).success).toBe(
      true
    );
  });

  it("accepts valid performer requirement", () => {
    expect(
      createRequirementSchema.safeParse(validPerformerPayload).success
    ).toBe(true);
  });

  it("accepts valid crew requirement", () => {
    expect(createRequirementSchema.safeParse(validCrewPayload).success).toBe(
      true
    );
  });

  it("rejects unsupported category", () => {
    const result = createRequirementSchema.safeParse({
      ...validPlannerPayload,
      category: "vendor",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing category", () => {
    const result = createRequirementSchema.safeParse({
      event: validPlannerPayload.event,
      details: validPlannerPayload.details,
    });
    expect(result.success).toBe(false);
  });

  it("rejects planner details under performer category", () => {
    const result = createRequirementSchema.safeParse({
      category: "performer",
      event: validPerformerPayload.event,
      details: validPlannerPayload.details,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing event", () => {
    const result = createRequirementSchema.safeParse({
      category: "planner",
      details: validPlannerPayload.details,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing details", () => {
    const result = createRequirementSchema.safeParse({
      category: "planner",
      event: validPlannerPayload.event,
    });
    expect(result.success).toBe(false);
  });
});
