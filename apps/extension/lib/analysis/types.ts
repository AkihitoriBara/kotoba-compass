export interface DictionaryEntry {
  word: string;           // Base/dictionary form (e.g., "食べる")
  reading: string;        // Kana reading (e.g., "たべる")
  meanings: string[];     // English definition glosses
  partOfSpeech: string[]; // Grammatical tags (e.g., ["v1", "vt"])
  jlpt?: string;          // JLPT level (e.g., "N5")
  frequency?: number;     // Word frequency rank (optional)
  tags?: string[];        // Additional tags (e.g., "common")
}

export interface DeinflectionCandidate {
  text: string;           // The deinflected word form
  rulesApplied: string[]; // List of grammar rules applied in reverse (e.g. ["polite", "past"])
}

export interface KanjiEntry {
  kanji: string;        // The kanji character (e.g. "猫")
  onyomi: string[];     // Onyomi readings in katakana (e.g. ["ビョウ"])
  kunyomi: string[];    // Kunyomi readings in hiragana (e.g. ["ねこ"])
  meanings: string[];   // English meanings/glosses (e.g. ["cat"])
  strokeCount: number;  // Number of strokes (e.g. 11)
  radical?: string;     // Radical representation/tag (e.g. "犬")
  jlptLevel?: number;   // JLPT level
  frequency?: number;   // Frequency rank
  grade?: number;       // School grade level
}

export type NameType =
  | 'person'
  | 'surname'
  | 'given'
  | 'place'
  | 'company'
  | 'organization'
  | 'station'
  | 'fiction'
  | 'other';

export interface NameEntry {
  written: string;     // The proper noun (e.g. "東京")
  reading: string;     // Kana reading (e.g. "とうきょう")
  meanings: string[];  // English meanings (e.g. ["Tokyo"])
  type: NameType;      // Proper name classification category
  tags?: string[];     // Optional tag identifiers
  priority?: number;   // Optional priority rank for sorting/scoring
}

// --- GRAMMAR PROVIDER DATA MODELS ---
export type PartOfSpeech = 'verb' | 'adjective' | 'noun' | 'particle' | 'auxiliary' | 'other';
export type VerbClass = 'ichidan' | 'godan' | 'irregular' | 'adjective';
export type Tense = 'present' | 'past';
export type Polarity = 'positive' | 'negative';
export type Politeness = 'plain' | 'polite';
export type Voice = 'passive' | 'potential' | 'causative' | 'volitional' | 'imperative';
export type Aspect = 'progressive' | 'perfective';
export type GrammarForm = 'dictionary' | 'masu' | 'te' | 'ta' | 'nai' | 'other';
export type GrammarConfidence = 'high' | 'medium' | 'low';

export interface GrammarTransformation {
  from: string;
  to: string;
  reason: string;
}

export interface GrammarPoint {
  id: string;          // Stable identifier (e.g. "grammar-polite-past")
  name: string;        // Display name (e.g. "Polite Past Tense")
  jlptLevel?: string;  // Optional JLPT level (e.g. "N5")
}

export interface GrammarResult {
  sourceText: string;
  dictionaryForm: string;
  partOfSpeech: PartOfSpeech;
  verbClass?: VerbClass;
  tense?: Tense;
  polarity?: Polarity;
  politeness?: Politeness;
  voice?: Voice[];
  aspect?: Aspect;
  form?: GrammarForm;
  confidence: GrammarConfidence;
  transformations: GrammarTransformation[];
  grammarPoints: GrammarPoint[];
}

export interface LanguageAnalysisResult {
  sourceText: string;
  entries: DictionaryEntry[];
  kanji?: KanjiEntry[];
  names?: NameEntry[];
  grammar?: GrammarResult[];
}

export interface ProviderContext {
  vocabularyResults?: DictionaryEntry[];
}

export interface LanguageProvider<T> {
  name: string;
  lookup(candidates: DeinflectionCandidate[], context?: ProviderContext): Promise<T[]>;
}

// --- CHAPTER 7.5 RESULT PROCESSOR MODELS ---
export interface ProcessedName {
  written: string;
  readings: string[];
  meanings: string[];
  types: NameType[];
  tags?: string[];
  priority?: number;
}

export interface ProcessedGrammarSection {
  primary?: GrammarResult;
  alternatives: GrammarResult[];
}

export interface SectionVisibility {
  dictionary: boolean;
  kanji: boolean;
  names: boolean;
  grammar: boolean;
}

export interface AnalysisWarning {
  code: string;
  severity: 'warning' | 'info';
}

export interface ProcessedAnalysisResult {
  sourceText: string;
  dictionary: DictionaryEntry[];
  kanji: KanjiEntry[];
  names: ProcessedName[];
  grammar: ProcessedGrammarSection;
  sections: SectionVisibility;
  warnings: AnalysisWarning[];
}
