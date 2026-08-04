import {
  DictionaryEntry,
  KanjiEntry,
  ProcessedName,
  ProcessedGrammarSection,
  TranslationResult,
} from '../analysis/types';

export interface PromptMessages {
  system: string;
  context: string;
  user: string;
}

export interface ProviderCapabilities {
  supportsStreaming: boolean;
  supportsExamples: boolean;
  supportsImages: boolean;
  supportsAudio: boolean;
}

export interface AiTutorExample {
  japanese: string;
  english: string;
  explanation?: string;
}

export interface AiTutorResponse {
  summary: string;
  grammar?: string;
  nuance?: string;
  example?: AiTutorExample;
  commonMistake?: string;
  learningTip?: string;
  needsMoreContext?: boolean;
  providerName: string;
  model?: string;
  cached?: boolean;
  responseTimeMs?: number;
}

export enum TutorAction {
  Explain = 'explain',
  Grammar = 'grammar',
  Nuance = 'nuance',
  Example = 'example',
  Mistakes = 'mistakes',
}

export interface AiTutorRequest {
  sourceText: string;
  userQuestion?: string;
  action?: TutorAction;
  context?: {
    dictionary?: DictionaryEntry[];
    kanji?: KanjiEntry[];
    names?: ProcessedName[];
    grammar?: ProcessedGrammarSection;
    translation?: TranslationResult;
  };
}

export interface AiTutorProvider {
  readonly name: string;
  readonly capabilities: ProviderCapabilities;
  isConfigured(): boolean;
  explain(messages: PromptMessages): Promise<AiTutorResponse>;
}
