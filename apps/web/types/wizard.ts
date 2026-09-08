import type { Category, EventInput, PlannerDetails, PerformerDetails, CrewDetails } from "@gopratle/contracts";

export type StepId = "basics" | "requirements" | "details" | "review";

export interface WizardState {
  step: StepId;
  category: Category | null;
  event: Partial<EventInput>;
  plannerDetails: Partial<PlannerDetails>;
  performerDetails: Partial<PerformerDetails>;
  crewDetails: Partial<CrewDetails>;
}

export const STEPS: { id: StepId; label: string; heading: string; description: string }[] = [
  {
    id: "basics",
    label: "Event basics",
    heading: "What are you planning?",
    description: "Start with the essentials.",
  },
  {
    id: "requirements",
    label: "Requirements",
    heading: "What do you need for this role?",
    description: "Tell us the key details.",
  },
  {
    id: "details",
    label: "Details",
    heading: "Anything else we should know?",
    description: "Preferences, logistics, and extras.",
  },
  {
    id: "review",
    label: "Review",
    heading: "Review your requirement",
    description: "Check everything before submitting.",
  },
];

export const CATEGORY_INFO: Record<
  Category,
  { title: string; description: string }
> = {
  planner: {
    title: "Event Planner",
    description:
      "Coordinate vendors, logistics, timeline, and the complete event experience.",
  },
  performer: {
    title: "Performer",
    description:
      "Find the right artist, band, DJ, MC, or live act for your event.",
  },
  crew: {
    title: "Crew",
    description:
      "Request event staff for production, operations, stage, or on-ground support.",
  },
};
