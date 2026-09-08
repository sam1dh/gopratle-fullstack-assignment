import { z } from "zod";
import {
  plannerDetailsSchema,
  performerDetailsSchema,
  crewDetailsSchema,
} from "./categories/index.js";

export const categoryEnum = z.enum(["planner", "performer", "crew"]);
export type Category = z.infer<typeof categoryEnum>;

export const eventSchema = z
  .object({
    name: z.string().min(1, "Event name is required"),
    type: z.string().min(1, "Event type is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    location: z.string().min(1, "Location is required"),
    venue: z.string().optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    },
    { message: "End date must be on or after start date", path: ["endDate"] }
  );

export type EventInput = z.infer<typeof eventSchema>;

const requirementWithDetails = z.discriminatedUnion("category", [
  z.object({
    category: z.literal("planner"),
    event: eventSchema,
    details: plannerDetailsSchema,
  }),
  z.object({
    category: z.literal("performer"),
    event: eventSchema,
    details: performerDetailsSchema,
  }),
  z.object({
    category: z.literal("crew"),
    event: eventSchema,
    details: crewDetailsSchema,
  }),
]);

export const createRequirementSchema = requirementWithDetails;

export type CreateRequirementInput = z.infer<typeof createRequirementSchema>;

export type PlannerRequirement = CreateRequirementInput & { category: "planner" };
export type PerformerRequirement = CreateRequirementInput & { category: "performer" };
export type CrewRequirement = CreateRequirementInput & { category: "crew" };

export const requirementResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string(),
    category: categoryEnum,
    status: z.literal("submitted"),
    createdAt: z.string(),
  }),
});

export type RequirementResponse = z.infer<typeof requirementResponseSchema>;

export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string().optional(),
    fields: z.record(z.string()).optional(),
  }),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
