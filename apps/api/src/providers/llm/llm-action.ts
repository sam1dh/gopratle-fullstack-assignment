import type { AssistantAction } from "@gopratle/contracts";
import { assistantActionSchema } from "@gopratle/contracts";

export const NONE_ACTION: AssistantAction = { type: "NONE" };

function tryParseAction(raw: string): AssistantAction {
  try {
    const parsed = assistantActionSchema.safeParse(JSON.parse(raw.trim()));
    return parsed.success ? parsed.data : NONE_ACTION;
  } catch {
    return NONE_ACTION;
  }
}

// Models misbehave in predictable ways: <think> reasoning blocks, ```json
// fences, cut-off fences (max tokens hit mid-block), or bare JSON with keys
// in any order. All of it must be stripped from spoken text — never read
// aloud — while still salvaging a valid action when possible.
export function extractAction(text: string): { response: string; action: AssistantAction } {
  let cleaned = text.replace(/<think>[\s\S]*?(<\/think>|$)/gi, "");

  const fence = cleaned.match(/```(?:action|json)?\s*([\s\S]*?)(```|$)/i);
  if (fence) {
    const action = tryParseAction(fence[1]);
    cleaned = cleaned.replace(fence[0], "");
    return { response: sanitizeSpoken(cleaned), action };
  }

  // Bare JSON in any key order: {"field": ..., "type": "SUGGEST_FIELD_VALUE", ...}
  const bare = cleaned.match(
    /\{[^{}]*"(SUGGEST_FIELD_VALUE|FOCUS_FIELD|GO_TO_STEP)"[^{}]*\}/
  );
  if (bare) {
    const action = tryParseAction(bare[0]);
    cleaned = cleaned.replace(bare[0], "");
    return { response: sanitizeSpoken(cleaned), action };
  }

  return { response: sanitizeSpoken(cleaned), action: NONE_ACTION };
}

// Last line of defense before text reaches TTS: no JSON, fences, markdown
// crashes, or URLs-as-code should ever be spoken.
export function sanitizeSpoken(text: string): string {
  return text
    .replace(/<think>[\s\S]*?(<\/think>|$)/gi, "")
    .replace(/```[\s\S]*?(```|$)/g, "")
    .replace(/\{[^{}]*"(SUGGEST_FIELD_VALUE|FOCUS_FIELD|GO_TO_STEP)"[^{}]*\}/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export const ACTION_INSTRUCTION = `If the user asks to change the form (set a field, choose a category, go to a step, focus a field), append a machine-readable action block AFTER your spoken reply, exactly in this format:

\`\`\`action
{"type": "SUGGEST_FIELD_VALUE", "field": "event.name", "value": "Hyderabad Launch"}
\`\`\`

Action types: SUGGEST_FIELD_VALUE (field paths like event.name, event.type, event.location, event.venue, event.startDate, event.endDate, category, details.budget, details.performanceType, details.guestCount), FOCUS_FIELD (field is a DOM id like eventName), GO_TO_STEP (value is basics, requirements, details, review, next or back), SUBMIT_REQUIREMENT (no field/value; only when the user explicitly asks to submit, post, or send the requirement). If no form change is requested, omit the block entirely.

Strict value rules: event.type must be exactly one of Corporate Event, Wedding, Concert, Product Launch, Conference, College Fest, Private Party, Other. details.experienceLevel must be exactly entry, intermediate or expert. category must be exactly planner, performer or crew. Dates must be YYYY-MM-DD, times HH:MM, budgets plain numbers. Never emit reasoning or thinking blocks. Never speak JSON.`;
