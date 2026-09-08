import { z } from "zod";

export const performerDetailsSchema = z.object({
  performanceType: z.string().min(1, "Performance type is required"),
  genre: z.string().optional(),
  performerCount: z.number().int().min(1, "Performer count must be at least 1"),
  performanceDurationMinutes: z
    .number()
    .int()
    .min(1, "Duration must be at least 1 minute"),
  budget: z.number().min(0, "Budget must be non-negative"),
  technicalRequirements: z.string().optional(),
  portfolioUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type PerformerDetails = z.infer<typeof performerDetailsSchema>;
