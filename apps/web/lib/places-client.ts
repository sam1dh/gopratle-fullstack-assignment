import type { AutocompleteResponse, PlaceSuggestion } from "@gopratle/contracts";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export async function fetchPlaceSuggestions(
  input: string,
  language: "en" | "hi" = "en",
  signal?: AbortSignal
): Promise<PlaceSuggestion[]> {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/places/autocomplete?input=${encodeURIComponent(input)}&language=${language}`,
    { signal }
  );
  const data = (await res.json()) as AutocompleteResponse | { success: false };
  if (!res.ok || !data.success) return [];
  return (data as AutocompleteResponse).data.suggestions;
}
