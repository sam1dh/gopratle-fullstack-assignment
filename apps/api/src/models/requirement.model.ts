import mongoose, { Schema, type Document } from "mongoose";
import type { Category } from "@gopratle/contracts";

export interface RequirementDocument extends Document {
  category: Category;
  event: {
    name: string;
    type: string;
    startDate: Date;
    endDate: Date;
    location: string;
    venue?: string;
  };
  details: Record<string, unknown>;
  status: "submitted";
  createdAt: Date;
  updatedAt: Date;
}

const requirementSchema = new Schema<RequirementDocument>(
  {
    category: {
      type: String,
      enum: ["planner", "performer", "crew"],
      required: true,
      index: true,
    },
    event: {
      name: { type: String, required: true },
      type: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      location: { type: String, required: true },
      venue: { type: String },
    },
    details: {
      type: Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ["submitted"],
      default: "submitted",
    },
  },
  { timestamps: true }
);

requirementSchema.index({ category: 1, createdAt: -1 });

export const Requirement = mongoose.model<RequirementDocument>(
  "Requirement",
  requirementSchema
);
