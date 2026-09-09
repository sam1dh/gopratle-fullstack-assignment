import type {
  AssistantAction,
  AssistantMessageRequest,
  SpeakRequest,
  TranscribeRequest,
} from "@gopratle/contracts";
import type { LLMProvider } from "../providers/llm/LLMProvider.js";
import { GroqLLMProvider } from "../providers/llm/GroqLLMProvider.js";
import { OpenRouterLLMProvider } from "../providers/llm/OpenRouterLLMProvider.js";
import type { STTProvider } from "../providers/stt/STTProvider.js";
import { MockSTTProvider } from "../providers/stt/MockSTTProvider.js";
import type { TTSProvider } from "../providers/tts/TTSProvider.js";
import { MockTTSProvider } from "../providers/tts/MockTTSProvider.js";
import { CartesiaTTSProvider } from "../providers/tts/CartesiaTTSProvider.js";
import { getEnv } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";
import { parseVoiceCommand } from "./voice-commands.js";
import { sanitizeSpoken } from "../providers/llm/llm-action.js";

function resolveLLM(): LLMProvider | null {
  // getEnv() throws when required vars are missing (tests mock it instead).
  try {
    const env = getEnv();
    if (env.GROQ_API_KEY) {
      return new GroqLLMProvider(env.GROQ_API_KEY, env.GROQ_MODEL);
    }
    if (env.OPENROUTER_API_KEY) {
      return new OpenRouterLLMProvider(env.OPENROUTER_API_KEY, env.OPENROUTER_MODEL);
    }
  } catch {
    // no LLM configured
  }
  return null;
}

function resolveFallbackLLM(primary: LLMProvider | null): LLMProvider | null {
  try {
    const env = getEnv();
    if (primary?.name !== "openrouter" && env.OPENROUTER_API_KEY) {
      return new OpenRouterLLMProvider(env.OPENROUTER_API_KEY, env.OPENROUTER_MODEL);
    }
  } catch {
    // no fallback configured
  }
  return null;
}

function resolveTTS(): TTSProvider {
  try {
    const env = getEnv();
    if (env.CARTESIA_API_KEY) {
      return new CartesiaTTSProvider(env.CARTESIA_API_KEY, {
        en: env.CARTESIA_VOICE_ID,
        hi: env.CARTESIA_VOICE_ID_HI,
      });
    }
  } catch {
    // fall through to mock
  }
  return new MockTTSProvider();
}

export class AssistantService {
  private readonly llm: LLMProvider | null;
  private readonly fallbackLLM: LLMProvider | null;
  private readonly stt: STTProvider;
  private readonly tts: TTSProvider;

  constructor(
    llm: LLMProvider | null = null,
    stt: STTProvider | null = null,
    tts: TTSProvider | null = null,
    fallbackLLM: LLMProvider | null | undefined = undefined
  ) {
    // Browser SpeechRecognition is the real STT (no vendor key needed);
    // backend STT stays mock until a server-side provider is configured.
    const primary = llm ?? resolveLLM();
    this.llm = primary;
    this.fallbackLLM = fallbackLLM === undefined ? resolveFallbackLLM(primary) : fallbackLLM;
    this.stt = stt ?? new MockSTTProvider();
    this.tts = tts ?? resolveTTS();
  }

  providerNames(): { llm: string | null; stt: string; tts: string; fallbackLLM: string | null } {
    return {
      llm: this.llm?.name ?? null,
      stt: this.stt.name,
      tts: this.tts.name,
      fallbackLLM: this.fallbackLLM?.name ?? null,
    };
  }

  async answer(input: AssistantMessageRequest) {
    // Guard against prompt-injection style oversized contexts
    const totalMissing =
      input.context.missingRequiredFields.length +
      input.context.completedFields.length;
    if (totalMissing > 100) {
      throw new ApiError(400, "Assistant context is too large", "VALIDATION_ERROR");
    }
    const language = input.language ?? "en";

    // Direct commands are handled locally: deterministic, instant, and
    // quota-free. The LLM is only consulted for open questions.
    const command = parseVoiceCommand(input.message, input.context, language);
    if (command) {
      return { response: sanitizeSpoken(command.confirmation), suggestedAction: command.action };
    }

    const ask = async () => {
      if (!this.llm) {
        throw new ApiError(
          503,
          "Assistant is not configured. Please try again later.",
          "ASSISTANT_UNAVAILABLE"
        );
      }
      return this.llm.generate({
        message: input.message,
        language,
        context: input.context,
      });
    };

    const sanitizeReply = (reply: { response: string; suggestedAction: AssistantAction }) => ({
      ...reply,
      response: sanitizeSpoken(reply.response),
    });

    try {
      return sanitizeReply(await ask());
    } catch (err) {
      // Quota exhaustion or vendor outage: try the OpenRouter fallback.
      // No mock in the chain: without a provider the assistant reports
      // honestly instead of inventing rule-based answers.
      if (
        err instanceof ApiError &&
        (err.statusCode === 429 || err.statusCode >= 500)
      ) {
        console.error(
          `[assistant] LLM ${this.llm?.name ?? "none"} unavailable (${err.code}), trying fallback`
        );
        if (this.fallbackLLM) {
          return sanitizeReply(
            await this.fallbackLLM.generate({
              message: input.message,
              language,
              context: input.context,
            })
          );
        }
      }
      throw err;
    }
  }

  async transcribe(input: TranscribeRequest, mockText?: string) {
    if (input.sizeBytes !== undefined && input.sizeBytes > 5 * 1024 * 1024) {
      throw new ApiError(400, "Audio is too large (max 5MB)", "VALIDATION_ERROR");
    }
    if (mockText) return { text: mockText };
    return this.stt.transcribe(input);
  }

  async speak(input: SpeakRequest) {
    const result = await this.tts.synthesize(input.text, input.language ?? "en");
    return { ...result, text: input.text };
  }
}

export const assistantService = new AssistantService();
