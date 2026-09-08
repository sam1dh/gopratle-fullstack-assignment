import { Requirement, type RequirementDocument } from "../models/requirement.model.js";
import type { CreateRequirementInput } from "@gopratle/contracts";

export async function createRequirement(
  input: CreateRequirementInput
): Promise<RequirementDocument> {
  const doc = await Requirement.create({
    category: input.category,
    event: {
      name: input.event.name,
      type: input.event.type,
      startDate: new Date(input.event.startDate),
      endDate: new Date(input.event.endDate),
      location: input.event.location,
      venue: input.event.venue,
    },
    details: input.details,
    status: "submitted",
  });
  return doc;
}

export async function getRequirementById(
  id: string
): Promise<RequirementDocument | null> {
  return Requirement.findById(id);
}
