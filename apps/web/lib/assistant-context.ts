import type {
  Category,
  EventInput,
  PlannerDetails,
  PerformerDetails,
  CrewDetails,
  RequirementAssistantContext,
  AssistantStep,
} from "@gopratle/contracts";
import type { StepId } from "../types/wizard";

const STEP_MAP: Record<StepId, AssistantStep> = {
  basics: "event-basics",
  requirements: "requirements",
  details: "details",
  review: "review",
};

export interface WizardSnapshot {
  step: StepId;
  category: Category | null;
  event: Partial<EventInput>;
  plannerDetails: Partial<PlannerDetails>;
  performerDetails: Partial<PerformerDetails>;
  crewDetails: Partial<CrewDetails>;
  errors: Record<string, string>;
  currentField?: string;
}

const EVENT_REQUIRED = ["name", "type", "startDate", "endDate", "location"];

const PLANNER_REQUIRED = ["guestCount", "servicesNeeded", "budget"];
const PERFORMER_REQUIRED = [
  "performanceType",
  "performerCount",
  "performanceDurationMinutes",
  "budget",
];
const CREW_REQUIRED = [
  "crewRole",
  "crewCount",
  "experienceLevel",
  "shiftStart",
  "shiftEnd",
  "budget",
];

function isFilled(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return value > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function buildAssistantContext(
  snapshot: WizardSnapshot
): RequirementAssistantContext {
  const details =
    snapshot.category === "planner"
      ? (snapshot.plannerDetails as Record<string, unknown>)
      : snapshot.category === "performer"
        ? (snapshot.performerDetails as Record<string, unknown>)
        : snapshot.category === "crew"
          ? (snapshot.crewDetails as Record<string, unknown>)
          : {};

  const requiredDetails =
    snapshot.category === "planner"
      ? PLANNER_REQUIRED
      : snapshot.category === "performer"
        ? PERFORMER_REQUIRED
        : snapshot.category === "crew"
          ? CREW_REQUIRED
          : [];

  const completedFields: string[] = [];
  const missingRequiredFields: string[] = [];

  for (const field of EVENT_REQUIRED) {
    if (isFilled((snapshot.event as Record<string, unknown>)[field])) {
      completedFields.push(field);
    } else {
      missingRequiredFields.push(field);
    }
  }

  if (!snapshot.category) {
    missingRequiredFields.push("category");
  } else {
    completedFields.push("category");
    for (const field of requiredDetails) {
      if (isFilled(details[field])) {
        completedFields.push(field);
      } else {
        missingRequiredFields.push(field);
      }
    }
  }

  const validationErrors = Object.entries(snapshot.errors).map(
    ([field, message]) => ({ field, message })
  );

  const nextStep =
    missingRequiredFields.length > 0
      ? `Complete ${missingRequiredFields[0]}`
      : snapshot.step === "review"
        ? "Submit the requirement"
        : "Continue to the next step";

  return {
    currentStep: STEP_MAP[snapshot.step],
    category: snapshot.category,
    currentField: snapshot.currentField,
    event: {
      name: snapshot.event.name,
      type: snapshot.event.type,
      startDate: snapshot.event.startDate,
      endDate: snapshot.event.endDate,
      location: snapshot.event.location,
      venue: snapshot.event.venue ?? undefined,
    },
    categoryDetails: details,
    validationErrors,
    completedFields,
    missingRequiredFields,
    nextStep,
  };
}
