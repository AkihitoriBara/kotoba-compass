import {
  LanguageAnalysisResult,
  ProcessedAnalysisResult,
  DictionaryEntry,
  KanjiEntry,
  NameEntry,
  ProcessedName,
  GrammarResult,
  ProcessedGrammarSection,
  SectionVisibility,
  AnalysisWarning,
  TranslationResult,
  KotobaSettings,
} from './types';
import { DictionaryRanker } from './ranking/dictionary-ranker';
import { KanjiRanker } from './ranking/kanji-ranker';
import { NameMerger } from './ranking/name-merger';
import { GrammarRanker } from './ranking/grammar-ranker';

export { DictionaryRanker };


/**
 * Stage 5: Evaluates section visibility flags and generates status warnings.
 */
class SectionBuilder {
  public static build(
    dictionary: DictionaryEntry[],
    kanji: KanjiEntry[],
    names: ProcessedName[],
    grammar: ProcessedGrammarSection,
    translation?: TranslationResult,
    settings?: KotobaSettings
  ): { sections: SectionVisibility; warnings: AnalysisWarning[] } {
    const dictSettings = settings?.dictionary;
    const transSettings = settings?.translation;

    const sections: SectionVisibility = {
      dictionary: (dictSettings?.vocabulary ?? true) && dictionary.length > 0,
      kanji: (dictSettings?.kanji ?? true) && kanji.length > 0,
      names: (dictSettings?.names ?? true) && names.length > 0,
      grammar: (dictSettings?.grammar ?? true) && grammar.primary !== undefined,
      translation: (transSettings?.enabled ?? settings?.translationEnabled ?? false) && translation !== undefined,
    };

    const warnings: AnalysisWarning[] = [];

    // Detect warnings
    if (!sections.dictionary && !sections.kanji && !sections.names) {
      warnings.push({
        code: 'NO_ENTRIES_FOUND',
        severity: 'warning',
      });
    }

    const hasAmbiguousAlternatives = grammar.alternatives.some(
      (alt) => alt.confidence === 'high' || alt.confidence === 'medium'
    );
    if (hasAmbiguousAlternatives) {
      warnings.push({
        code: 'AMBIGUOUS_GRAMMAR',
        severity: 'info',
      });
    }

    return { sections, warnings };
  }
}

/**
 * Centralized post-processor that pipelines raw analysis output into ranked and merged results.
 */
export class ResultProcessor {
  public process(result: LanguageAnalysisResult, settings?: KotobaSettings): ProcessedAnalysisResult {
    const rawVocab = result.entries || [];
    const rawKanji = result.kanji || [];
    const rawNames = result.names || [];
    const rawGrammar = result.grammar || [];

    // Stage execution pipeline
    const dictionary = DictionaryRanker.rank(rawVocab, result.sourceText);
    const kanji = KanjiRanker.rank(rawKanji, result.sourceText);
    const names = NameMerger.process(rawNames, result.sourceText);
    const grammar = GrammarRanker.process(rawGrammar, dictionary);
    const { sections, warnings } = SectionBuilder.build(dictionary, kanji, names, grammar, result.translation, settings);

    // Architectural Decision:
    // Translation results are for quick comprehension assistance and do not participate in ranking.
    // There is at most one TranslationResult, which is forwarded unchanged to the UI layer.
    return {
      sourceText: result.sourceText,
      dictionary,
      kanji,
      names,
      grammar,
      sections,
      warnings,
      translation: result.translation,
    };
  }
}
