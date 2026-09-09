import { z } from "zod";

export const assistantStepEnum = z.enum([
  "event-basics",
  "requirements",
  "details",
  "review",
]);
export type AssistantStep = z.infer<typeof assistantStepEnum>;

export const assistantLanguageEnum = z.enum(["en", "hi"]);
export type AssistantLanguage = z.infer<typeof assistantLanguageEnum>;

export const assistantContextSchema = z.object({
  currentStep: assistantStepEnum,
  category: z.enum(["planner", "performer", "crew"]).nullable(),
  currentField: z.string().max(80).optional(),
  event: z
    .object({
      name: z.string().optional(),
      type: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      location: z.string().optional(),
      venue: z.string().optional(),
    })
    .default({}),
  categoryDetails: z.record(z.string(), z.unknown()).default({}),
  validationErrors: z
    .array(z.object({ field: z.string(), message: z.string() }))
    .default([]),
  completedFields: z.array(z.string()).default([]),
  missingRequiredFields: z.array(z.string()).default([]),
  nextStep: z.string().max(120).optional(),
});
export type RequirementAssistantContext = z.infer<typeof assistantContextSchema>;

export const assistantActionSchema = z.object({
  type: z.enum(["NONE", "SUGGEST_FIELD_VALUE", "FOCUS_FIELD", "GO_TO_STEP", "SUBMIT_REQUIREMENT"]),
  field: z.string().max(80).optional(),
  value: z.unknown().optional(),
});
export type AssistantAction = z.infer<typeof assistantActionSchema>;

export const assistantMessageRequestSchema = z.object({
  message: z.string().min(1, "message is required").max(500),
  language: assistantLanguageEnum.default("en"),
  context: assistantContextSchema,
});
export type AssistantMessageRequest = z.infer<typeof assistantMessageRequestSchema>;

export const assistantMessageResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    response: z.string(),
    suggestedAction: assistantActionSchema.nullable(),
  }),
});
export type AssistantMessageResponse = z.infer<typeof assistantMessageResponseSchema>;

export const transcribeRequestSchema = z.object({
  mimeType: z.string().max(80).optional(),
  sizeBytes: z.number().int().min(0).max(5 * 1024 * 1024).optional(),
  durationMs: z.number().int().min(0).max(120_000).optional(),
  mockText: z.string().max(500).optional(),
});
export type TranscribeRequest = z.infer<typeof transcribeRequestSchema>;

export const transcribeResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ text: z.string() }),
});
export type TranscribeResponse = z.infer<typeof transcribeResponseSchema>;

export const speakRequestSchema = z.object({
  text: z.string().min(1).max(500),
  language: assistantLanguageEnum.default("en"),
});
export type SpeakRequest = z.infer<typeof speakRequestSchema>;

export const speakResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    mimeType: z.string(),
    audioBase64: z.string(),
    text: z.string(),
  }),
});
export type SpeakResponse = z.infer<typeof speakResponseSchema>;
