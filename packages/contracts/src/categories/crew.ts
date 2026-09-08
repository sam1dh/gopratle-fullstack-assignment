import { z } from "zod";

export const crewDetailsSchema = z.object({
  crewRole: z.string().min(1, "Crew role is required"),
  crewCount: z.number().int().min(1, "Crew count must be at least 1"),
  experienceLevel: z.enum(["entry", "intermediate", "expert"]),
  shiftStart: z.string().min(1, "Shift start is required"),
  shiftEnd: z.string().min(1, "Shift end is required"),
  budget: z.number().min(0, "Budget must be non-negative"),
  equipmentRequired: z.string().optional(),
  specialRequirements: z.string().optional(),
});

export type CrewDetails = z.infer<typeof crewDetailsSchema>;
