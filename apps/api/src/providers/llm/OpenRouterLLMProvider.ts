import type {
  LLMGenerateInput,
  LLMGenerateOutput,
  LLMProvider,
} from "./LLMProvider.js";
import { ACTION_INSTRUCTION, extractAction } from "./llm-action.js";
import { ApiError } from "../../utils/api-error.js";
import type { RequirementAssistantContext } from "@gopratle/contracts";

const SYSTEM_INSTRUCTION = `You are the GoPratle voice assistant. You help users complete an event requirement form.

You understand the user's current screen, category, existing form data, missing fields, validation errors and next step.

You are voice-first. Speak naturally and concisely: 1 to 4 sentences, optimized for listening. Do not behave like a customer-support chatbot. Do not invent information. Do not claim something is saved unless the application saved it.

When the user asks about the current field, explain that field specifically with one practical example. When information is missing, identify it. Categories: Event Planner, Performer, Crew. Prioritize helping the user complete the current step.

${ACTION_INSTRUCTION}`;

function contextSummary(ctx: RequirementAssistantContext): string {
  const lines = [
    `Current step: ${ctx.currentStep}`,
    `Category: ${ctx.category ?? "not selected yet"}`,
    ctx.currentField ? `Focused field: ${ctx.currentField}` : null,
    ctx.event.name ? `Event name: ${ctx.event.name}` : null,
    ctx.event.type ? `Event type: ${ctx.event.type}` : null,
    ctx.event.startDate ? `Start: ${ctx.event.startDate}` : null,
    ctx.event.endDate ? `End: ${ctx.event.endDate}` : null,
    ctx.event.location ? `Location: ${ctx.event.location}` : null,
    ctx.event.venue ? `Venue: ${ctx.event.venue}` : null,
    Object.keys(ctx.categoryDetails).length > 0
      ? `Category details: ${JSON.stringify(ctx.categoryDetails)}`
      : null,
    ctx.missingRequiredFields.length > 0
      ? `Missing required fields: ${ctx.missingRequiredFields.join(", ")}`
      : "All required fields complete",
    ctx.validationErrors.length > 0
      ? `Validation errors: ${ctx.validationErrors.map((e) => `${e.field}: ${e.message}`).join("; ")}`
      : null,
    ctx.nextStep ? `Next step: ${ctx.nextStep}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

// Fallback LLM provider backed by OpenRouter. Keys stay server-side.
// Used when the primary provider hits quota or outage.
export class OpenRouterLLMProvider implements LLMProvider {
  readonly name = "openrouter";

  constructor(
    private readonly apiKey: string,
    private readonly model = "inclusionai/ling-3.0-flash-sante:free"
  ) {}

  async generate(input: LLMGenerateInput): Promise<LLMGenerateOutput> {
    const language = input.language ?? "en";
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": "https://gopratle.app",
          "X-Title": "GoPratle Voice Assistant",
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 300,
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content: `${SYSTEM_INSTRUCTION}${
                language === "hi"
                  ? " Respond in natural spoken Hindi (Devanagari script is fine). Keep it to 1-4 short sentences."
                  : ""
              }`,
            },
            {
              role: "user",
              content: `Form context:\n${contextSummary(input.context)}\n\nUser said: ${input.message}`,
            },
          ],
        }),
      });
      if (!res.ok) {
        if (res.status === 429) {
          throw new ApiError(429, "Assistant quota reached. Please try again shortly.", "QUOTA_EXHAUSTED");
        }
        throw new ApiError(500, "Assistant is temporarily unavailable", "ASSISTANT_ERROR");
      }
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = data.choices?.[0]?.message?.content?.trim();
      if (!text) {
        throw new ApiError(500, "Assistant returned an empty response", "ASSISTANT_ERROR");
      }
      const { response, action } = extractAction(text);
      return { response, suggestedAction: action };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(500, "Assistant is temporarily unavailable", "ASSISTANT_ERROR");
    } finally {
      clearTimeout(timer);
    }
  }
}
