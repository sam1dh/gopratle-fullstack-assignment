import { z } from "zod";

export const plannerDetailsSchema = z.object({
  guestCount: z.number().int().min(1, "Guest count must be at least 1"),
  servicesNeeded: z
    .array(z.string().min(1, "Service name cannot be empty"))
    .min(1, "At least one service is required"),
  budget: z.number().min(0, "Budget must be non-negative"),
  themeOrStyle: z.string().optional(),
  specialRequirements: z.string().optional(),
});

export type PlannerDetails = z.infer<typeof plannerDetailsSchema>;
