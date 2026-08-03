import { Deinflector } from './deinflector';
import { 
  LanguageAnalysisResult, 
  LanguageProvider, 
  DictionaryEntry, 
  KanjiEntry, 
  NameEntry,
  GrammarResult,
  AnalysisContext,
  TranslationResult
} from './types';
import { DictionaryRanker } from './ranking/dictionary-ranker';

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
  public async analyze(text: string, context?: AnalysisContext): Promise<LanguageAnalysisResult> {
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

    // 3. Locate vocabulary provider and run it first to establish context
    const vocabularyProvider = this.providers.find(p => p.name === 'vocabulary');
    let vocabularyResult: DictionaryEntry[] = [];
    if (vocabularyProvider) {
      try {
        vocabularyResult = await vocabularyProvider.lookup(candidates);
      } catch (e) {
        console.error('[LanguageAnalysisEngine] VocabularyProvider lookup failed:', e);
      }
    }

    // Rank vocabulary entries using DictionaryRanker
    const sortedVocabulary = DictionaryRanker.rank(vocabularyResult, normalized);

    // Build the analysis context to distribute to remaining providers
    const runContext: AnalysisContext = {
      ...context,
      dictionaryEntries: sortedVocabulary,
    };

    // 4. Query remaining providers in parallel with the lookup context
    const remainingProviders = this.providers.filter(p => {
      if (p.name === 'vocabulary') return false;
      if (p.name === 'translation') {
        // Do not execute if translation is disabled
        return !!context?.settings?.translationEnabled;
      }
      return true;
    });

    const lookups = await Promise.all(
      remainingProviders.map(async (provider) => {
        try {
          const results = await provider.lookup(candidates, runContext);
          return { name: provider.name, results };
        } catch (e) {
          console.error(`[LanguageAnalysisEngine] Provider "${provider.name}" lookup failed:`, e);
          return { name: provider.name, results: [] };
        }
      })
    );

    // 5. Merge results from providers
    const kanjiResult = lookups.find(l => l.name === 'kanji')?.results as KanjiEntry[] || [];
    const nameResult = lookups.find(l => l.name === 'names')?.results as NameEntry[] || [];
    const grammarResult = lookups.find(l => l.name === 'grammar')?.results as GrammarResult[] || [];
    const translationResult = lookups.find(l => l.name === 'translation')?.results as TranslationResult[] || [];

    return {
      sourceText: text,
      entries: sortedVocabulary,
      kanji: kanjiResult,
      names: nameResult,
      grammar: grammarResult,
      translation: translationResult[0],
    };
  }
}
