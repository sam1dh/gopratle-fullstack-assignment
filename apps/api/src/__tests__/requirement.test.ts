import { describe, it, expect, beforeAll, vi } from "vitest";
import request from "supertest";

const { mockSave, mockFindById } = vi.hoisted(() => ({
  mockSave: vi.fn(),
  mockFindById: vi.fn(),
}));

vi.mock("mongoose", () => {
  const mSchema: any = class {
    static Types = { Mixed: {}, ObjectId: {} };
    index = vi.fn();
  };
  return {
    default: {
      connect: vi.fn(),
      disconnect: vi.fn(),
      model: vi.fn(() => ({
        create: mockSave,
        findById: mockFindById,
      })),
      Schema: mSchema,
    },
    Schema: mSchema,
  };
});

vi.mock("../config/env.js", () => ({
  getEnv: () => ({
    NODE_ENV: "test",
    PORT: 5000,
    MONGODB_URI: "mongodb://localhost:27017/test",
    FRONTEND_URL: "http://localhost:3000",
  }),
}));

import app from "../app.js";

const validPlannerPayload = {
  category: "planner",
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
  category: "performer",
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
  category: "crew",
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
    experienceLevel: "intermediate",
    shiftStart: "06:00",
    shiftEnd: "18:00",
    budget: 120000,
    equipmentRequired: "Dolly + track",
    specialRequirements: "Early call time",
  },
};

describe("Health endpoint", () => {
  it("GET /api/v1/health returns status ok", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("POST /api/v1/requirements", () => {
  beforeAll(() => {
    mockSave.mockImplementation((data) =>
      Promise.resolve({
        _id: "507f1f77bcf86cd799439011",
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );
  });

  it("creates a planner requirement", async () => {
    const res = await request(app)
      .post("/api/v1/requirements")
      .send(validPlannerPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.category).toBe("planner");
    expect(res.body.data.status).toBe("submitted");
    expect(res.body.data.id).toBeDefined();
  });

  it("creates a performer requirement", async () => {
    const res = await request(app)
      .post("/api/v1/requirements")
      .send(validPerformerPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.category).toBe("performer");
  });

  it("creates a crew requirement", async () => {
    const res = await request(app)
      .post("/api/v1/requirements")
      .send(validCrewPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.category).toBe("crew");
  });

  it("rejects invalid category", async () => {
    const res = await request(app)
      .post("/api/v1/requirements")
      .send({ ...validPlannerPayload, category: "vendor" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects missing event name", async () => {
    const res = await request(app)
      .post("/api/v1/requirements")
      .send({
        ...validPlannerPayload,
        event: { ...validPlannerPayload.event, name: "" },
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects end date before start date", async () => {
    const res = await request(app)
      .post("/api/v1/requirements")
      .send({
        ...validPlannerPayload,
        event: {
          ...validPlannerPayload.event,
          startDate: "2026-10-20",
          endDate: "2026-10-15",
        },
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects wrong category details", async () => {
    const res = await request(app)
      .post("/api/v1/requirements")
      .send({
        category: "performer",
        event: validPerformerPayload.event,
        details: validPlannerPayload.details,
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("GET /api/v1/requirements/:id", () => {
  it("returns a requirement by id", async () => {
    mockFindById.mockResolvedValueOnce({
      _id: "507f1f77bcf86cd799439011",
      category: "planner",
      event: validPlannerPayload.event,
      details: validPlannerPayload.details,
      status: "submitted",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app).get(
      "/api/v1/requirements/507f1f77bcf86cd799439011"
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.category).toBe("planner");
  });

  it("returns 404 for non-existent id", async () => {
    mockFindById.mockResolvedValueOnce(null);

    const res = await request(app).get(
      "/api/v1/requirements/507f1f77bcf86cd799439099"
    );
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe("Unknown routes", () => {
  it("returns 404 for unknown routes", async () => {
    const res = await request(app).get("/api/v1/unknown");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
