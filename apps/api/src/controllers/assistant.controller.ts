import type { Request, Response } from "express";
import {
  assistantMessageRequestSchema,
  transcribeRequestSchema,
  speakRequestSchema,
} from "@gopratle/contracts";
import { ZodError } from "zod";
import { assistantService } from "../services/assistant.service.js";
import { ValidationError, ApiError } from "../utils/api-error.js";

function formatZodErrors(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    fields[path] = issue.message;
  }
  return fields;
}

export async function handleAssistantMessage(
  req: Request,
  res: Response
): Promise<void> {
  const result = assistantMessageRequestSchema.safeParse(req.body);
  if (!result.success) {
    throw new ValidationError(formatZodErrors(result.error));
  }

  try {
    const { response, suggestedAction } = await assistantService.answer(
      result.data
    );
    res.status(200).json({
      success: true,
      data: { response, suggestedAction },
    });
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, "Assistant is temporarily unavailable", "ASSISTANT_ERROR");
  }
}

export async function handleTranscribe(
  req: Request,
  res: Response
): Promise<void> {
  const result = transcribeRequestSchema.safeParse(req.body ?? {});
  if (!result.success) {
    throw new ValidationError(formatZodErrors(result.error));
  }
  const mockText =
    typeof req.body?.mockText === "string" ? req.body.mockText : undefined;
  const { text } = await assistantService.transcribe(result.data, mockText);
  res.status(200).json({ success: true, data: { text } });
}

export async function handleSpeak(req: Request, res: Response): Promise<void> {
  const result = speakRequestSchema.safeParse(req.body);
  if (!result.success) {
    throw new ValidationError(formatZodErrors(result.error));
  }
  const data = await assistantService.speak(result.data);
  res.status(200).json({ success: true, data });
}
