import type { PlaceSuggestion, PlaceDetails } from "@gopratle/contracts";
import type { PlacesProvider } from "../providers/places/PlacesProvider.js";
import { GooglePlacesProvider } from "../providers/places/GooglePlacesProvider.js";
import { getEnv } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { at: number; value: PlaceSuggestion[] | PlaceDetails }>();

function cached<T extends PlaceSuggestion[] | PlaceDetails>(key: string): T | null {
  const hit = cache.get(key);
  if (!hit || Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit.value as T;
}

function store(key: string, value: PlaceSuggestion[] | PlaceDetails): void {
  if (cache.size > 500) cache.clear();
  cache.set(key, { at: Date.now(), value });
}

function resolveProvider(): PlacesProvider {
  const env = getEnv();
  if (!env.GOOGLE_MAPS_API_KEY) {
    throw new ApiError(503, "Location search is not configured.", "PLACES_UNAVAILABLE");
  }
  return new GooglePlacesProvider(env.GOOGLE_MAPS_API_KEY);
}

export async function autocompletePlaces(
  input: string,
  language: string,
  provider: PlacesProvider | null = null
): Promise<PlaceSuggestion[]> {
  const key = `ac:${language}:${input.toLowerCase()}`;
  const hit = cached<PlaceSuggestion[]>(key);
  if (hit) return hit;
  const result = await (provider ?? resolveProvider()).autocomplete(input, language);
  store(key, result);
  return result;
}

export async function getPlaceDetails(
  placeId: string,
  language: string,
  provider: PlacesProvider | null = null
): Promise<PlaceDetails> {
  const key = `de:${language}:${placeId}`;
  const hit = cached<PlaceDetails>(key);
  if (hit) return hit;
  const result = await (provider ?? resolveProvider()).details(placeId, language);
  store(key, result);
  return result;
}

export function clearPlacesCache(): void {
  cache.clear();
}
