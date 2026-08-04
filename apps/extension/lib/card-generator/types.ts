import { FrontCardFormat, ProcessedAnalysisResult, KotobaSettings } from '../analysis/types';

export type CardTemplate = FrontCardFormat; // 'word' | 'sentence' | 'cloze'

export interface CardFront {
  japanese: string;
  furigana?: string;
  showFurigana: boolean;
  imagePlaceholder?: string;
}

export interface CardBack {
  primaryWord: string;
  reading: string;
  meanings: string[];
  partOfSpeech: string[];
  grammarSummary?: string;
  kanjiInfo?: {
    character: string;
    meanings: string[];
    onyomi: string[];
    kunyomi: string[];
  }[];
  translation?: string;
  aiExamplePlaceholder?: string;
  aiExplanationPlaceholder?: string;
  audioPlaceholder?: string;
}

export interface CardMetadata {
  tags: string[];
  jlpt?: string;
  sourceText: string;
  template: CardTemplate;
  generatedAt: number;
}

export interface GeneratedCard {
  id: string;
  front: CardFront;
  back: CardBack;
  metadata: CardMetadata;
}

export interface CardValidationError {
  field: string;
  message: string;
}

export interface CardValidationResult {
  valid: boolean;
  errors: CardValidationError[];
}

export interface CardGenerationRequest {
  analysis: ProcessedAnalysisResult;
  settings: KotobaSettings;
  overrideTemplate?: CardTemplate;
}
