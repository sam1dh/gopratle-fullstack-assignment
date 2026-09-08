import type { Request, Response } from "express";
import { createRequirementSchema } from "@gopratle/contracts";
import { ZodError } from "zod";
import {
  createRequirement,
  getRequirementById,
} from "../services/requirement.service.js";
import { ValidationError, NotFoundError } from "../utils/api-error.js";

function formatZodErrors(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    fields[path] = issue.message;
  }
  return fields;
}

export async function handleCreateRequirement(
  req: Request,
  res: Response
): Promise<void> {
  const result = createRequirementSchema.safeParse(req.body);
  if (!result.success) {
    throw new ValidationError(formatZodErrors(result.error));
  }

  const requirement = await createRequirement(result.data);

  res.status(201).json({
    success: true,
    data: {
      id: requirement._id.toString(),
      category: requirement.category,
      status: requirement.status,
      createdAt: requirement.createdAt.toISOString(),
    },
  });
}

export async function handleGetRequirement(
  req: Request,
  res: Response
): Promise<void> {
  const id = String(req.params.id);
  const requirement = await getRequirementById(id);
  if (!requirement) {
    throw new NotFoundError("Requirement");
  }

  res.status(200).json({
    success: true,
    data: {
      id: requirement._id.toString(),
      category: requirement.category,
      event: requirement.event,
      details: requirement.details,
      status: requirement.status,
      createdAt: requirement.createdAt.toISOString(),
      updatedAt: requirement.updatedAt.toISOString(),
    },
  });
}
