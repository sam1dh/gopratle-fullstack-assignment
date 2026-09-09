import type {
  AssistantAction,
  AssistantLanguage,
  RequirementAssistantContext,
} from "@gopratle/contracts";

export interface ParsedCommand {
  action: AssistantAction;
  confirmation: string;
}

type FieldType = "text" | "number" | "date" | "time" | "select" | "list";

interface FieldDef {
  path: string;
  label: string;
  type: FieldType;
  keywords: string[];
  options?: string[];
}

const EVENT_FIELDS: FieldDef[] = [
  { path: "event.name", label: "event name", type: "text", keywords: ["event name", "event ka naam", "naam"] },
  { path: "event.type", label: "event type", type: "select", keywords: ["event type", "event ka type", "type"], options: ["Corporate Event", "Wedding", "Concert", "Product Launch", "Conference", "College Fest", "Private Party", "Other"] },
  { path: "event.location", label: "location", type: "text", keywords: ["location", "city", "jagah", "sthan"] },
  { path: "event.venue", label: "venue", type: "text", keywords: ["venue"] },
  { path: "event.startDate", label: "start date", type: "date", keywords: ["start date", "shuru"] },
  { path: "event.endDate", label: "end date", type: "date", keywords: ["end date", "khatm", "samapt"] },
];

const PERFORMER_FIELDS: FieldDef[] = [
  { path: "details.performanceType", label: "performance type", type: "text", keywords: ["performance type", "performance", "act"] },
  { path: "details.genre", label: "genre", type: "text", keywords: ["genre"] },
  { path: "details.performerCount", label: "performer count", type: "number", keywords: ["performer count", "performers", "artists", "kalakar"] },
  { path: "details.performanceDurationMinutes", label: "duration", type: "number", keywords: ["duration", "minutes", "hours", "hour", "samay", "avdhi"] },
  { path: "details.budget", label: "budget", type: "number", keywords: ["budget", "keemat", "daam", "paisa"] },
];

const PLANNER_FIELDS: FieldDef[] = [
  { path: "details.guestCount", label: "guest count", type: "number", keywords: ["guest count", "guests", "mehmaan", "people", "attendees"] },
  { path: "details.servicesNeeded", label: "services needed", type: "list", keywords: ["services", "service", "seva"] },
  { path: "details.budget", label: "budget", type: "number", keywords: ["budget", "keemat", "daam", "paisa"] },
];

const CREW_FIELDS: FieldDef[] = [
  { path: "details.crewRole", label: "crew role", type: "text", keywords: ["crew role", "role", "bhoomika"] },
  { path: "details.crewCount", label: "headcount", type: "number", keywords: ["headcount", "crew count", "count", "people", "log"] },
  { path: "details.experienceLevel", label: "experience level", type: "select", keywords: ["experience", "experience level", "anubhav"], options: ["entry", "intermediate", "expert"] },
  { path: "details.shiftStart", label: "shift start", type: "time", keywords: ["shift start", "start time"] },
  { path: "details.shiftEnd", label: "shift end", type: "time", keywords: ["shift end", "end time"] },
  { path: "details.budget", label: "budget", type: "number", keywords: ["budget", "keemat", "daam", "paisa"] },
];

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
  fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
  eighty: 80, ninety: 90, hundred: 100, ek: 1, do: 2, teen: 3, char: 4, paanch: 5,
};

function wordsToNumber(text: string): number | null {
  let total = 0;
  let current = 0;
  let found = false;
  for (const word of text.toLowerCase().split(/[\s-]+/)) {
    if (word === "and") continue;
    const n = NUMBER_WORDS[word];
    if (n === undefined) return null;
    found = true;
    if (n === 100) {
      current = (current || 1) * 100;
    } else {
      current += n;
    }
    total += 0;
  }
  if (!found) return null;
  return total + current;
}

function parseMoney(text: string): number | null {
  const lower = text.toLowerCase().replace(/rupees?/g, "").trim();
  const nospace = lower.replace(/[₹$,\s]/g, "");
  const digit = (re: RegExp, mult: number): number | null => {
    const m = nospace.match(re);
    return m ? Math.round(parseFloat(m[1]) * mult) : null;
  };
  return (
    digit(/^([\d.]+)lakh?s?$/, 100000) ??
    digit(/^([\d.]+)lacs?$/, 100000) ??
    digit(/^([\d.]+)crores?$/, 10000000) ??
    digit(/^([\d.]+)(k|thousand)$/, 1000) ??
    (/^[\d.]+$/.test(nospace) ? Math.round(parseFloat(nospace)) : null) ??
    wordMoney(lower)
  );
}

function wordMoney(lower: string): number | null {
  const forms: Array<[RegExp, number]> = [
    [/^(.+?)\s+lakh?s?$/, 100000],
    [/^(.+?)\s+lacs?$/, 100000],
    [/^(.+?)\s+crores?$/, 10000000],
    [/^(.+?)\s+(k|thousand)$/, 1000],
  ];
  for (const [re, mult] of forms) {
    const m = lower.match(re);
    if (m) {
      const n = wordsToNumber(m[1].trim());
      return n === null ? null : Math.round(n * mult);
    }
  }
  return wordsToNumber(lower);
}

function parseCount(text: string): number | null {
  const digits = text.replace(/,/g, "").match(/[\d.]+/);
  if (digits) {
    const n = Math.round(parseFloat(digits[0]));
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  const w = wordsToNumber(text);
  return w && w > 0 ? Math.round(w) : null;
}

function parseDurationMinutes(text: string): number | null {
  const lower = text.toLowerCase();
  const digits = lower.replace(/,/g, "").match(/[\d.]+/);
  const hours = /\b(hours?|hrs?|ghanta)\b/.test(lower);
  if (digits) {
    const n = parseFloat(digits[0]);
    return Math.round(hours ? n * 60 : n);
  }
  const w = wordsToNumber(lower.replace(/\b(minutes?|hours?|hrs?|ghanta|min)\b/g, "").trim());
  if (w === null) return null;
  return Math.round(hours ? w * 60 : w);
}

function parseDateISO(text: string): string | null {
  const trimmed = text.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  // Require a month name or separators so bare numbers are not misread.
  if (!/[a-z]{3,}|\//i.test(trimmed) && !/\d{1,2}[-.]\d{1,2}[-.]\d{2,4}/.test(trimmed)) {
    return null;
  }
  const withYear = /\d{4}/.test(trimmed)
    ? trimmed
    : `${trimmed} ${new Date().getFullYear()}`;
  const d = new Date(withYear);
  if (Number.isNaN(d.getTime())) return null;
  // Events are in the future: a month-day that already passed this year
  // rolls to next year ("December 20" said in January).
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!/\d{4}/.test(trimmed) && d < today) {
    d.setFullYear(d.getFullYear() + 1);
  }
  const y = d.getFullYear();
  if (y < 2020 || y > 2100) return null;
  return `${y}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseTimeHM(text: string): string | null {
  const lower = text.toLowerCase().trim().replace(/\./g, "");
  const baje = lower.match(/^(\d{1,2})(?::(\d{2}))?\s*baje$/);
  if (baje) {
    const h = parseInt(baje[1], 10);
    if (h < 1 || h > 23) return null;
    return `${String(h).padStart(2, "0")}:${baje[2] ?? "00"}`;
  }
  const m = lower.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2] ?? "00";
  if (m[3] === "pm" && h < 12) h += 12;
  if (m[3] === "am" && h === 12) h = 0;
  if (h > 23 || parseInt(min, 10) > 59) return null;
  return `${String(h).padStart(2, "0")}:${min}`;
}

function matchOption(value: string, options: string[]): string | null {
  const lower = value.toLowerCase();
  for (const opt of options) {
    if (lower.includes(opt.toLowerCase())) return opt;
  }
  return null;
}

// Longest-keyword-first: "performance type" must beat "type", otherwise the
// generic event-type field swallows performer/crew specifics and valid
// values fail option validation.
function findField(fragment: string, fields: FieldDef[]): FieldDef | null {
  const lower = fragment.toLowerCase();
  let best: FieldDef | null = null;
  let bestLen = -1;
  for (const def of fields) {
    for (const k of def.keywords) {
      if (lower.includes(k) && k.length > bestLen) {
        best = def;
        bestLen = k.length;
      }
    }
  }
  return best;
}

function coerceValue(raw: string, def: FieldDef): unknown {
  const value = raw.replace(/^["'“”]+|["'“”]+$/g, "").trim();
  switch (def.type) {
    case "number": {
      if (def.path.endsWith("budget")) return parseMoney(value);
      if (def.path.endsWith("performanceDurationMinutes")) return parseDurationMinutes(value);
      return parseCount(value);
    }
    case "date":
      return parseDateISO(value);
    case "time":
      return parseTimeHM(value);
    case "select": {
      if (def.path.endsWith("experienceLevel")) {
        const l = value.toLowerCase();
        if (/beginner|fresher|entry|naive|naya/.test(l)) return "entry";
        if (/intermediate|medium|mid/.test(l)) return "intermediate";
        if (/expert|professional|experienced|senior|pro\b/.test(l)) return "expert";
        return null;
      }
      return matchOption(value, def.options ?? []);
    }
    case "list":
      return value.split(/,|\band\b|\baur\b/).map((s) => s.trim()).filter(Boolean);
    default:
      return value || null;
  }
}

function cleanSpoken(raw: string): string {
  return raw
    .replace(/\s+(please|thanks|thank you)\.?$/i, "")
    .replace(/^["'“”]+|["'“”.,]+$/g, "")
    .trim();
}

function confirm(
  language: AssistantLanguage,
  label: string,
  display: string,
  extra?: string
): string {
  if (language === "hi") {
    return `${label} ${display} rakha gaya.${extra ? ` ${extra}` : ""}`;
  }
  return `Done. ${label} set to ${display}.${extra ? ` ${extra}` : ""}`;
}

function displayValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "number") return value.toLocaleString("en-IN");
  return String(value);
}

// Spoken confirmations must sound natural: ISO dates and 24h times are
// read as digits, so humanize them ("2026-12-20" -> "20 December 2026").
function speakValue(value: unknown): string {
  if (typeof value === "string") {
    const date = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (date) {
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];
      const mi = parseInt(date[2], 10);
      if (mi >= 1 && mi <= 12) {
        return `${parseInt(date[3], 10)} ${months[mi - 1]} ${date[1]}`;
      }
    }
    const time = value.match(/^(\d{2}):(\d{2})$/);
    if (time) {
      let h = parseInt(time[1], 10);
      const suffix = h >= 12 ? "PM" : "AM";
      h = h % 12 === 0 ? 12 : h % 12;
      return time[2] === "00" ? `${h} ${suffix}` : `${h}:${time[2]} ${suffix}`;
    }
  }
  return displayValue(value);
}

const STEP_ALIASES: { step: string; patterns: RegExp }[] = [
  { step: "basics", patterns: /event basics|basics|first|step 1|step one|pehla/ },
  { step: "requirements", patterns: /requirements?|needs|second|step 2|step two|doosra|dusra/ },
  { step: "details", patterns: /details|extra|third|step 3|step three|teesra/ },
  { step: "review", patterns: /review|summary|last|step 4|step four|submit|final|chautha|antim/ },
];

const CATEGORY_ALIASES: { category: "planner" | "performer" | "crew"; patterns: RegExp }[] = [
  { category: "planner", patterns: /event planner|planner|organizer|organiser|ayojak/ },
  { category: "performer", patterns: /performer|artist|band|dj|singer|musician|dancer|comic|kalakar/ },
  { category: "crew", patterns: /crew|staff|stage crew|team/ },
];

export function parseVoiceCommand(
  message: string,
  context: RequirementAssistantContext,
  language: AssistantLanguage = "en"
): ParsedCommand | null {
  const raw = message.trim();
  // Structural matching is case-insensitive on the original so values keep
  // their case; keyword matching lowercases the captured fragment only.
  const lower = (s: string) => s.toLowerCase();
  const text = raw.toLowerCase().trim();

  // --- Navigation: next / back ---
  if (/^(go to |move to |continue|next|proceed|aage( badho)?|next step)$/.test(text)) {
    return {
      action: { type: "GO_TO_STEP", value: "next" },
      confirmation: language === "hi" ? "Agla step khola gaya." : "Moved to the next step.",
    };
  }
  if (/^(go back|back|previous|peeche|pichhe)$/.test(text)) {
    return {
      action: { type: "GO_TO_STEP", value: "back" },
      confirmation: language === "hi" ? "Pichhle step par wapas." : "Went back a step.",
    };
  }
  const goTo = text.match(/^(?:go to|open|show|take me to|kholo|dikhao)\s+(?:the\s+)?(.+)$/);
  if (goTo) {
    const target = STEP_ALIASES.find((s) => s.patterns.test(goTo[1]));
    if (target) {
      return {
        action: { type: "GO_TO_STEP", value: target.step },
        confirmation:
          language === "hi" ? "Wahan le ja rahe hain." : `Jumped to the ${target.step} step.`,
      };
    }
  }

  // --- Category select ---
  const select = raw.match(/^(?:select|choose|pick|chuno|select karo|choose karo)\s+(?:the\s+)?(.+)$/i);
  if (select) {
    const cat = CATEGORY_ALIASES.find((c) => c.patterns.test(lower(select[1])));
    if (cat) {
      return {
        action: { type: "SUGGEST_FIELD_VALUE", field: "category", value: cat.category },
        confirmation:
          language === "hi"
            ? `Category ${cat.category} chuni gayi.`
            : `Category set to ${cat.category}. Now tell me the requirements.`,
      };
    }
  }

  // --- Submit the form ---
  if (/^(submit|submit (the form|my requirement|it|this)|post (it|this|the requirement|my requirement)|send (it|the requirement)|jama karo|submit karo|bhej do)$/.test(text)) {
    return {
      action: { type: "SUBMIT_REQUIREMENT" },
      confirmation:
        language === "hi" ? "Requirement submit ki ja rahi hai." : "Submitting your requirement now.",
    };
  }

  const fields =
    context.category === "planner"
      ? [...EVENT_FIELDS, ...PLANNER_FIELDS]
      : context.category === "performer"
        ? [...EVENT_FIELDS, ...PERFORMER_FIELDS]
        : context.category === "crew"
          ? [...EVENT_FIELDS, ...CREW_FIELDS]
          : EVENT_FIELDS;

  // --- Focus field ---
  const focus = raw.match(/^(?:focus|click|tap|select the field|field)\s+(?:the\s+)?(.+)$/i);
  if (focus && !/^(category|planner|performer|crew)/i.test(focus[1])) {
    const def = findField(focus[1], fields);
    if (def) {
      return {
        action: { type: "FOCUS_FIELD", field: domIdFor(def.path) },
        confirmation:
          language === "hi" ? `${def.label} par focus kiya.` : `Focused the ${def.label} field.`,
      };
    }
  }

  // --- Set field: "set X to Y" ---
  const set = raw.match(/^(?:please\s+)?set\s+(?:the\s+)?(.+?)\s+to\s+(.+)$/i);
  if (set) {
    const def = findField(set[1], fields);
    if (!def) return null;
    const value = coerceValue(cleanSpoken(set[2]), def);
    if (value === null || value === undefined || value === "") return null;
    return {
      action: { type: "SUGGEST_FIELD_VALUE", field: def.path, value },
      confirmation: confirm(language, capitalize(def.label), speakValue(value)),
    };
  }

  // --- Hindi set patterns: "<field> <value> rakho/kar do" ---
  const hindiSet = raw.match(/^(.+?)\s+(rakho|rakh do|kar do|set karo|bhar do)$/i);
  if (hindiSet) {
    const rest = lower(hindiSet[1]);
    const def = findField(rest, fields);
    if (!def) return null;
    // Strip the field mention (case-insensitive) to isolate the value.
    let rawValue = hindiSet[1];
    for (const k of def.keywords.sort((a, b) => b.length - a.length)) {
      rawValue = rawValue.replace(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), " ");
    }
    const value = coerceValue(cleanSpoken(rawValue), def);
    if (value === null || value === undefined || value === "") return null;
    return {
      action: { type: "SUGGEST_FIELD_VALUE", field: def.path, value },
      confirmation: confirm(language, def.label, speakValue(value)),
    };
  }

  return null;
}

function domIdFor(path: string): string {
  const map: Record<string, string> = {
    "event.name": "eventName",
    "event.type": "eventType",
    "event.location": "location",
    "event.venue": "venue",
    "event.startDate": "startDate",
    "event.endDate": "endDate",
  };
  return map[path] ?? path;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
