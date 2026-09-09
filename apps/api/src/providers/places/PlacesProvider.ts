import type { PlaceSuggestion, PlaceDetails } from "@gopratle/contracts";

export interface PlacesProvider {
  readonly name: string;
  autocomplete(input: string, language: string): Promise<PlaceSuggestion[]>;
  details(placeId: string, language: string): Promise<PlaceDetails>;
}
