import { GeneratedCard } from '../card-generator/types';

export interface PromptMessages {
  system: string;
  context: string;
  user: string;
}

export interface CardEnhancement {
  exampleSentence: string;
  exampleTranslation: string;
  usageNote: string;
  providerName: string;
  model?: string;
  cached?: boolean;
  responseTimeMs?: number;
}

export interface EnhancedGeneratedCard extends GeneratedCard {
  enhancement?: CardEnhancement;
}

export interface CardEnhancementRequest {
  card: GeneratedCard;
}

export interface CardEnhancementProvider {
  readonly name: string;
  isConfigured(): boolean;
  enhance(messages: PromptMessages): Promise<CardEnhancement>;
}

export interface EnhancementValidationError {
  field: string;
  message: string;
}

export interface EnhancementValidationResult {
  valid: boolean;
  errors: EnhancementValidationError[];
}
