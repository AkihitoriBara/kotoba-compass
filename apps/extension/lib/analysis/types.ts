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
  // Placeholder for future KANJIDIC integration
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
