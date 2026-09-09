import { z } from "zod";

export const placeSuggestionSchema = z.object({
  placeId: z.string(),
  text: z.string(),
  mainText: z.string().optional(),
  secondaryText: z.string().optional(),
});
export type PlaceSuggestion = z.infer<typeof placeSuggestionSchema>;

export const autocompleteQuerySchema = z.object({
  input: z.string().min(2).max(100),
  language: z.enum(["en", "hi"]).default("en"),
});
export type AutocompleteQuery = z.infer<typeof autocompleteQuerySchema>;

export const autocompleteResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ suggestions: z.array(placeSuggestionSchema) }),
});
export type AutocompleteResponse = z.infer<typeof autocompleteResponseSchema>;

export const placeDetailsSchema = z.object({
  placeId: z.string(),
  formattedAddress: z.string(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});
export type PlaceDetails = z.infer<typeof placeDetailsSchema>;

export const placeDetailsResponseSchema = z.object({
  success: z.literal(true),
  data: placeDetailsSchema,
});
export type PlaceDetailsResponse = z.infer<typeof placeDetailsResponseSchema>;
