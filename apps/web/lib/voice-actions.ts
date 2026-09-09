import type {
  AssistantAction,
  Category,
  CrewDetails,
  EventInput,
  PerformerDetails,
  PlannerDetails,
} from "@gopratle/contracts";
import type { StepId } from "../types/wizard";

export interface WizardControls {
  category: Category | null;
  setCategory: (category: Category) => void;
  updateEvent: (data: Partial<EventInput>) => void;
  updatePlannerDetails: (data: Partial<PlannerDetails>) => void;
  updatePerformerDetails: (data: Partial<PerformerDetails>) => void;
  updateCrewDetails: (data: Partial<CrewDetails>) => void;
  goNext: () => void;
  goBack: () => void;
  goToStep: (step: StepId, opts?: { force?: boolean }) => void;
  submit: () => void;
}

const FIELD_LABELS: Record<string, string> = {
  "event.name": "Event name",
  "event.type": "Event type",
  "event.location": "Location",
  "event.venue": "Venue",
  "event.startDate": "Start date",
  "event.endDate": "End date",
  category: "Category",
  "details.performanceType": "Performance type",
  "details.genre": "Genre",
  "details.performerCount": "Performer count",
  "details.performanceDurationMinutes": "Duration",
  "details.budget": "Budget",
  "details.guestCount": "Guest count",
  "details.servicesNeeded": "Services needed",
  "details.crewRole": "Crew role",
  "details.crewCount": "Headcount",
  "details.experienceLevel": "Experience level",
  "details.shiftStart": "Shift start",
  "details.shiftEnd": "Shift end",
};

const EVENT_KEYS = ["name", "type", "location", "venue", "startDate", "endDate"];

const DETAIL_KEYS: Record<Category, string[]> = {
  planner: ["guestCount", "servicesNeeded", "budget", "themeOrStyle", "specialRequirements"],
  performer: ["performanceType", "genre", "performerCount", "performanceDurationMinutes", "budget", "technicalRequirements", "portfolioUrl"],
  crew: ["crewRole", "crewCount", "experienceLevel", "shiftStart", "shiftEnd", "budget", "equipmentRequired", "specialRequirements"],
};

const NUMBER_FIELDS = new Set([
  "details.budget",
  "details.guestCount",
  "details.performerCount",
  "details.performanceDurationMinutes",
  "details.crewCount",
]);

const EVENT_TYPE_OPTIONS = [
  "Corporate Event",
  "Wedding",
  "Concert",
  "Product Launch",
  "Conference",
  "College Fest",
  "Private Party",
  "Other",
];

// Models invent path variants (requirements.budget, budget). Normalize to
// canonical event.* / details.* paths using the live category.
export function normalizeActionField(
  rawField: unknown,
  category: Category | null
): string | null {
  if (typeof rawField !== "string") return null;
  const field = rawField.trim();
  if (field === "category" || field === "event.category") return "category";
  if (field.startsWith("event.") && EVENT_KEYS.includes(field.slice(6))) {
    return field;
  }
  if (field.startsWith("details.")) {
    const key = field.slice(8);
    if (category && DETAIL_KEYS[category].includes(key)) return field;
    // Unknown category yet: accept syntactically valid detail keys.
    if (Object.values(DETAIL_KEYS).some((keys) => keys.includes(key))) return field;
    return null;
  }
  // Strip requirement(s). prefixes: requirements.budget -> details.budget
  const reqPrefix = field.match(/^requirements?\.([^.]+)$/i);
  if (reqPrefix) {
    const key = reqPrefix[1];
    if (category && DETAIL_KEYS[category].includes(key)) return `details.${key}`;
    return null;
  }
  // Bare detail names: budget -> details.budget (only when unambiguous)
  if (category && DETAIL_KEYS[category].includes(field)) {
    return `details.${field}`;
  }
  return null;
}

function coerceValue(path: string, value: unknown): unknown {
  if (path === "details.servicesNeeded") {
    if (Array.isArray(value)) {
      const list = value.map((v) => String(v).trim()).filter(Boolean);
      return list.length > 0 ? list : null;
    }
    if (typeof value === "string") {
      const list = value.split(/,|\band\b/).map((s) => s.trim()).filter(Boolean);
      return list.length > 0 ? list : null;
    }
    return null;
  }
  if (NUMBER_FIELDS.has(path)) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const n = Number(value.replace(/[₹,\s]/g, ""));
      if (Number.isFinite(n) && n >= 0) return n;
    }
    return null;
  }
  if (path === "event.startDate" || path === "event.endDate") {
    if (typeof value !== "string") return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return iso;
  }
  if (path === "details.shiftStart" || path === "details.shiftEnd") {
    if (typeof value !== "string") return null;
    if (/^\d{2}:\d{2}$/.test(value)) return value;
    return null;
  }
  if (path === "details.experienceLevel") {
    if (value === "entry" || value === "intermediate" || value === "expert") return value;
    return null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }
  return value ?? null;
}

function displayValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "number") return value.toLocaleString("en-IN");
  return String(value);
}

function scrollTop() {
  try {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch {
    // noop
  }
}

/**
 * Applies a voice assistant action to the live form.
 * Returns a toast message to show, or null when silent.
 */
export function applyVoiceAction(
  wizard: WizardControls,
  action: AssistantAction
): string | null {
  if (!action || action.type === "NONE") return null;

  if (action.type === "SUBMIT_REQUIREMENT") {
    wizard.submit();
    return null;
  }

  if (action.type === "FOCUS_FIELD" && typeof action.field === "string") {
    const el = document.getElementById(action.field);
    if (el) {
      el.focus({ preventScroll: true });
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      return null;
    }
    return null;
  }

  if (action.type === "GO_TO_STEP") {
    const target = action.value;
    if (target === "next") {
      wizard.goNext();
      scrollTop();
      return "Moved to the next step.";
    }
    if (target === "back") {
      wizard.goBack();
      scrollTop();
      return "Went back a step.";
    }
    if (target === "basics" || target === "requirements" || target === "details" || target === "review") {
      wizard.goToStep(target, { force: true });
      scrollTop();
      return null;
    }
    return null;
  }

  if (action.type === "SUGGEST_FIELD_VALUE" && typeof action.field === "string") {
    const field = normalizeActionField(action.field, wizard.category);
    if (!field) return null;
    const label = FIELD_LABELS[field] ?? field;
    const value = coerceValue(field, action.value);
    if (value === null || value === undefined || value === "") return null;

    if (field === "category") {
      if (value === "planner" || value === "performer" || value === "crew") {
        wizard.setCategory(value);
        return `Category set to ${value}.`;
      }
      return null;
    }

    if (field.startsWith("event.")) {
      const key = field.slice("event.".length);
      if (key === "type") {
        if (typeof value !== "string" || !EVENT_TYPE_OPTIONS.includes(value)) return null;
      }
      wizard.updateEvent({ [key]: value } as Partial<EventInput>);
      return `Voice set ${label} to ${displayValue(value)}.`;
    }

    if (field.startsWith("details.")) {
      const key = field.slice("details.".length);
      const category = wizard.category;
      if (!category) return null;
      if (category === "planner") {
        wizard.updatePlannerDetails({ [key]: value } as Partial<PlannerDetails>);
      } else if (category === "performer") {
        wizard.updatePerformerDetails({ [key]: value } as Partial<PerformerDetails>);
      } else {
        wizard.updateCrewDetails({ [key]: value } as Partial<CrewDetails>);
      }
      return `Voice set ${label} to ${displayValue(value)}.`;
    }
  }

  return null;
}
