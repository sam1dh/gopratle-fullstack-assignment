import type { PlaceSuggestion, PlaceDetails } from "@gopratle/contracts";
import type { PlacesProvider } from "./PlacesProvider.js";
import { ApiError } from "../../utils/api-error.js";

interface AutocompleteResponse {
  suggestions?: {
    placePrediction?: {
      place?: string;
      placeId?: string;
      text?: { text?: string };
      structuredFormat?: {
        mainText?: { text?: string };
        secondaryText?: { text?: string };
      };
    };
  }[];
}

interface DetailsResponse {
  id?: string;
  formattedAddress?: string;
  addressComponents?: { longText?: string; types?: string[] }[];
}

// Google Places (new API). The browser never sees the key: all calls are
// proxied through the backend.
export class GooglePlacesProvider implements PlacesProvider {
  readonly name = "google-places";

  constructor(private readonly apiKey: string) {}

  private languageCode(language: string): string {
    return language === "hi" ? "hi" : "en";
  }

  async autocomplete(input: string, language: string): Promise<PlaceSuggestion[]> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    try {
      const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": this.apiKey,
        },
        body: JSON.stringify({ input, languageCode: this.languageCode(language) }),
      });
      if (!res.ok) {
        throw new ApiError(500, "Location search is unavailable", "PLACES_ERROR");
      }
      const data = (await res.json()) as AutocompleteResponse;
      return (data.suggestions ?? [])
        .map((s) => s.placePrediction)
        .filter((p) => p?.placeId && p?.text?.text)
        .map((p) => ({
          placeId: p!.placeId as string,
          text: p!.text!.text as string,
          mainText: p!.structuredFormat?.mainText?.text,
          secondaryText: p!.structuredFormat?.secondaryText?.text,
        }));
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(500, "Location search is unavailable", "PLACES_ERROR");
    } finally {
      clearTimeout(timer);
    }
  }

  async details(placeId: string, language: string): Promise<PlaceDetails> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    try {
      const url =
        `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}` +
        `?languageCode=${this.languageCode(language)}` +
        `&fields=id,formattedAddress,addressComponents`;
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { "X-Goog-Api-Key": this.apiKey },
      });
      if (!res.ok) {
        throw new ApiError(500, "Location details are unavailable", "PLACES_ERROR");
      }
      const data = (await res.json()) as DetailsResponse;
      if (!data.formattedAddress) {
        throw new ApiError(404, "Place not found.", "NOT_FOUND");
      }
      const pick = (type: string) =>
        data.addressComponents?.find((c) => c.types?.includes(type))?.longText;
      return {
        placeId: data.id ?? placeId,
        formattedAddress: data.formattedAddress,
        city: pick("locality") ?? pick("administrative_area_level_3"),
        state: pick("administrative_area_level_1"),
        country: pick("country"),
      };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(500, "Location details are unavailable", "PLACES_ERROR");
    } finally {
      clearTimeout(timer);
    }
  }
}
