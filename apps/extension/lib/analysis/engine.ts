import { Deinflector } from './deinflector';
import { 
  LanguageAnalysisResult, 
  LanguageProvider, 
  DictionaryEntry, 
  KanjiEntry, 
  NameEntry 
} from './types';

export class LanguageAnalysisEngine {
  private providers: LanguageProvider<any>[] = [];
  private deinflector: Deinflector;

  constructor() {
    this.deinflector = new Deinflector();
  }

  /**
   * Registers a provider (Vocabulary, Kanji, Names) to plug into the engine pipeline.
   */
  public registerProvider(provider: LanguageProvider<any>): void {
    this.providers.push(provider);
  }

  /**
   * Runs the complete selection analysis pipeline.
   */
  public async analyze(text: string): Promise<LanguageAnalysisResult> {
    if (!text || !text.trim()) {
      return {
        sourceText: '',
        entries: [],
        kanji: [],
        names: [],
      };
    }

    // 1. Normalize selected text
    const normalized = text.trim().normalize('NFC');

    // 2. Generate deinflected candidates
    const candidates = this.deinflector.deinflect(normalized);

    // 3. Query all providers in parallel
    const lookups = await Promise.all(
      this.providers.map(async (provider) => {
        try {
          const results = await provider.lookup(candidates);
          return { name: provider.name, results };
        } catch (e) {
          console.error(`[LanguageAnalysisEngine] Provider "${provider.name}" lookup failed:`, e);
          return { name: provider.name, results: [] };
        }
      })
    );

    // 4. Merge results from providers
    const vocabularyResult = lookups.find(l => l.name === 'vocabulary')?.results as DictionaryEntry[] || [];
    const kanjiResult = lookups.find(l => l.name === 'kanji')?.results as KanjiEntry[] || [];
    const nameResult = lookups.find(l => l.name === 'names')?.results as NameEntry[] || [];

    // 5. Rank vocabulary entries:
    // Put entries matching the exact highlighted word form first, followed by deinflected forms.
    const sortedVocabulary = this.rankVocabulary(normalized, vocabularyResult);

    return {
      sourceText: text,
      entries: sortedVocabulary,
      kanji: kanjiResult,
      names: nameResult,
    };
  }

  /**
   * Sorts vocabulary matches to show original exact matches before deinflected candidates.
   */
  private rankVocabulary(sourceText: string, entries: DictionaryEntry[]): DictionaryEntry[] {
    return [...entries].sort((a, b) => {
      const aIsExact = a.word === sourceText || a.reading === sourceText;
      const bIsExact = b.word === sourceText || b.reading === sourceText;
      
      if (aIsExact && !bIsExact) return -1;
      if (!aIsExact && bIsExact) return 1;
      return 0;
    });
  }
}
