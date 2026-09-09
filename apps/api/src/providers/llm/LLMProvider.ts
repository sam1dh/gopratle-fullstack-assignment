import type {
  AssistantAction,
  AssistantLanguage,
  RequirementAssistantContext,
} from "@gopratle/contracts";

export interface LLMGenerateInput {
  message: string;
  language?: AssistantLanguage;
  context: RequirementAssistantContext;
}

export interface LLMGenerateOutput {
  response: string;
  suggestedAction: AssistantAction;
}

export interface LLMProvider {
  readonly name: string;
  generate(input: LLMGenerateInput): Promise<LLMGenerateOutput>;
}
