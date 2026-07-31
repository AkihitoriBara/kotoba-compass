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

export interface NameEntry {
  // Placeholder for future JMnedict integration
}

export interface LanguageAnalysisResult {
  sourceText: string;
  entries: DictionaryEntry[];
  kanji?: KanjiEntry[];
  names?: NameEntry[];
}

export interface LanguageProvider<T> {
  name: string;
  lookup(candidates: DeinflectionCandidate[]): Promise<T[]>;
}
