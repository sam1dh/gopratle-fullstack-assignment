import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { GooglePlacesProvider } from "../providers/places/GooglePlacesProvider.js";
import {
  autocompletePlaces,
  getPlaceDetails,
  clearPlacesCache,
} from "../services/places.service.js";

vi.mock("../config/env.js", () => ({
  getEnv: () => ({
    NODE_ENV: "test",
    PORT: 5000,
    MONGODB_URI: "mongodb://localhost:27017/test",
    FRONTEND_URL: "http://localhost:3000",
    GOOGLE_MAPS_API_KEY: "test-maps-key",
  }),
}));

import app from "../app.js";

beforeEach(() => {
  clearPlacesCache();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const autocompletePayload = {
  suggestions: [
    {
      placePrediction: {
        placeId: "ChIJx9Lr6tqZyzsRwvu6koO3k64",
        text: { text: "Hyderabad, Telangana, India" },
        structuredFormat: {
          mainText: { text: "Hyderabad" },
          secondaryText: { text: "Telangana, India" },
        },
      },
    },
  ],
};

describe("GooglePlacesProvider", () => {
  it("maps suggestions", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => autocompletePayload })
    );
    const out = await new GooglePlacesProvider("k").autocomplete("Hyd", "en");
    expect(out).toEqual([
      {
        placeId: "ChIJx9Lr6tqZyzsRwvu6koO3k64",
        text: "Hyderabad, Telangana, India",
        mainText: "Hyderabad",
        secondaryText: "Telangana, India",
      },
    ]);
  });

  it("maps place details with city/state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: "ChIJx9Lr6tqZyzsRwvu6koO3k64",
          formattedAddress: "Hyderabad, Telangana, India",
          addressComponents: [
            { longText: "Hyderabad", types: ["locality"] },
            { longText: "Telangana", types: ["administrative_area_level_1"] },
            { longText: "India", types: ["country"] },
          ],
        }),
      })
    );
    const out = await new GooglePlacesProvider("k").details("ChIJx9Lr6tqZyzsRwvu6koO3k64", "en");
    expect(out).toMatchObject({
      formattedAddress: "Hyderabad, Telangana, India",
      city: "Hyderabad",
      state: "Telangana",
      country: "India",
    });
  });

  it("throws PLACES_ERROR when Google fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 403 }));
    await expect(new GooglePlacesProvider("bad").autocomplete("Hyd", "en")).rejects.toMatchObject({
      code: "PLACES_ERROR",
    });
  });
});

describe("places service cache", () => {
  it("serves repeat queries without refetching", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => autocompletePayload,
    });
    vi.stubGlobal("fetch", fetchMock);
    const provider = new GooglePlacesProvider("k");
    await autocompletePlaces("Hyd", "en", provider);
    await autocompletePlaces("Hyd", "en", provider);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("GET /api/v1/places/autocomplete", () => {
  it("returns suggestions", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => autocompletePayload })
    );
    const res = await request(app).get("/api/v1/places/autocomplete?input=Hyderabad");
    expect(res.status).toBe(200);
    expect(res.body.data.suggestions[0].text).toMatch(/Hyderabad/);
  });

  it("rejects short input", async () => {
    const res = await request(app).get("/api/v1/places/autocomplete?input=H");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/v1/places/:placeId", () => {
  it("returns formatted details", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: "abc",
          formattedAddress: "Mumbai, Maharashtra, India",
          addressComponents: [],
        }),
      })
    );
    const res = await request(app).get("/api/v1/places/abc");
    expect(res.status).toBe(200);
    expect(res.body.data.formattedAddress).toMatch(/Mumbai/);
  });
});
