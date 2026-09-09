import type { Request, Response } from "express";
import { autocompleteQuerySchema } from "@gopratle/contracts";
import { ZodError } from "zod";
import { autocompletePlaces, getPlaceDetails } from "../services/places.service.js";
import { ValidationError } from "../utils/api-error.js";

function formatZodErrors(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    fields[issue.path.join(".")] = issue.message;
  }
  return fields;
}

export async function handleAutocomplete(req: Request, res: Response): Promise<void> {
  const result = autocompleteQuerySchema.safeParse(req.query);
  if (!result.success) {
    throw new ValidationError(formatZodErrors(result.error));
  }
  const suggestions = await autocompletePlaces(result.data.input, result.data.language);
  res.status(200).json({ success: true, data: { suggestions } });
}

export async function handlePlaceDetails(req: Request, res: Response): Promise<void> {
  const placeId = String(req.params.placeId);
  const language = req.query.language === "hi" ? "hi" : "en";
  const details = await getPlaceDetails(placeId, language);
  res.status(200).json({ success: true, data: details });
}
