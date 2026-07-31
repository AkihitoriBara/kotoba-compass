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
} from './types';

/**
 * Stage 1: Ranks dictionary entries based on exact matching, priority, and frequency.
 */
class DictionaryRanker {
  public static rank(entries: DictionaryEntry[], sourceText: string): DictionaryEntry[] {
    const normalized = sourceText.trim();
    
    // Assign score for sorting
    const scoredEntries = entries.map((entry) => {
      let score = 0;

      if (entry.word === normalized) {
        score = 100;
      } else if (entry.reading === normalized) {
        score = 90;
      } else {
        // Deinflected matches
        const isDeinflectedWord = entry.word !== normalized && normalized.startsWith(entry.word.slice(0, -1));
        const isDeinflectedReading = entry.reading !== normalized && normalized.startsWith(entry.reading.slice(0, -1));
        
        if (isDeinflectedWord) {
          score = 50;
        } else if (isDeinflectedReading) {
          score = 40;
        }
      }

      // Priority tag bonus
      const isCommon = entry.tags?.includes('common') || entry.partOfSpeech?.includes('common');
      if (isCommon) {
        score += 10;
      }

      return { entry, score };
    });

    // Sort entries:
    // 1. Score descending
    // 2. Frequency rank ascending (smaller rank = more common). Entries with no frequency rank are sorted last.
    // 3. String length ascending
    scoredEntries.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      const freqA = a.entry.frequency !== undefined ? a.entry.frequency : Infinity;
      const freqB = b.entry.frequency !== undefined ? b.entry.frequency : Infinity;

      if (freqA !== freqB) {
        return freqA - freqB;
      }

      return a.entry.word.length - b.entry.word.length;
    });

    return scoredEntries.map((se) => se.entry);
  }
}

/**
 * Stage 2: Ranks Kanji entries preserving their appearance sequence in the selected text.
 */
class KanjiRanker {
  public static rank(kanji: KanjiEntry[], sourceText: string): KanjiEntry[] {
    const norm = sourceText.trim();

    return [...kanji].sort((a, b) => {
      const indexA = norm.indexOf(a.kanji);
      const indexB = norm.indexOf(b.kanji);

      const hasA = indexA !== -1;
      const hasB = indexB !== -1;

      // Group exact matches (characters that exist in selected text) first
      if (hasA && !hasB) return -1;
      if (!hasA && hasB) return 1;

      // If both appear in source text, sort by position of appearance
      if (hasA && hasB) {
        if (indexA !== indexB) {
          return indexA - indexB;
        }
      }

      // Tie-breaker: sort by frequency ascending (smaller rank number = higher frequency)
      const freqA = a.frequency !== undefined ? a.frequency : Infinity;
      const freqB = b.frequency !== undefined ? b.frequency : Infinity;

      return freqA - freqB;
    });
  }
}

/**
 * Stage 3: Groups and merges name cards with identical written forms.
 */
class NameMerger {
  public static process(names: NameEntry[], sourceText: string): ProcessedName[] {
    const groups = new Map<string, NameEntry[]>();

    // Group names by written form
    for (const name of names) {
      const key = name.written;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(name);
    }

    const mergedNames: ProcessedName[] = [];

    // Merge properties for each group
    for (const [written, entries] of groups.entries()) {
      const readings = Array.from(new Set(entries.map((e) => e.reading)));
      const meanings = Array.from(new Set(entries.flatMap((e) => e.meanings)));
      const types = Array.from(new Set(entries.map((e) => e.type)));
      const tags = Array.from(new Set(entries.flatMap((e) => e.tags || [])));
      
      // Determine priority: lowest priority value (best rank) wins
      const priorities = entries
        .map((e) => e.priority)
        .filter((p): p is number => p !== undefined);
      const priority = priorities.length > 0 ? Math.min(...priorities) : undefined;

      mergedNames.push({
        written,
        readings,
        meanings,
        types,
        tags: tags.length > 0 ? tags : undefined,
        priority,
      });
    }

    // Sort Processed Names:
    // 1. Exact match with sourceText first
    // 2. Priority ascending (smaller value = higher priority)
    const norm = sourceText.trim();
    mergedNames.sort((a, b) => {
      const exactA = a.written === norm;
      const exactB = b.written === norm;

      if (exactA && !exactB) return -1;
      if (!exactA && exactB) return 1;

      const prioA = a.priority !== undefined ? a.priority : Infinity;
      const prioB = b.priority !== undefined ? b.priority : Infinity;

      return prioA - prioB;
    });

    return mergedNames;
  }
}

/**
 * Stage 4: Ranks grammar results and splits them into primary and alternative listings.
 */
class GrammarRanker {
  public static process(grammar: GrammarResult[], rankedVocab: DictionaryEntry[]): ProcessedGrammarSection {
    if (grammar.length === 0) {
      return { alternatives: [] };
    }

    // Sort Grammar Results:
    // 1. Confidence level (high > medium > low)
    // 2. Dictionary Confirmation (dictionaryForm matches a verified vocab entry)
    // 3. Simplicity (fewer transformation steps first)
    const sortedGrammar = [...grammar].sort((a, b) => {
      // 1. Confidence Sort
      const confidenceWeight = { high: 3, medium: 2, low: 1 };
      const weightA = confidenceWeight[a.confidence] || 0;
      const weightB = confidenceWeight[b.confidence] || 0;
      if (weightA !== weightB) {
        return weightB - weightA;
      }

      // 2. Dictionary Confirmation Sort
      const confirmedA = rankedVocab.some((v) => v.word === a.dictionaryForm || v.reading === a.dictionaryForm);
      const confirmedB = rankedVocab.some((v) => v.word === b.dictionaryForm || v.reading === b.dictionaryForm);
      if (confirmedA !== confirmedB) {
        return confirmedA ? -1 : 1;
      }

      // 3. Simplicity Sort (fewer transitions = simpler)
      return a.transformations.length - b.transformations.length;
    });

    // Deduplicate identical analyses (same dictionaryForm, partOfSpeech, transformations list length)
    const uniqueGrammar: GrammarResult[] = [];
    const seen = new Set<string>();

    for (const g of sortedGrammar) {
      const key = `${g.dictionaryForm}-${g.partOfSpeech}-${g.transformations.map(t => t.to).join(',')}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueGrammar.push(g);
      }
    }

    const primary = uniqueGrammar[0];
    const alternatives = uniqueGrammar.slice(1);

    return { primary, alternatives };
  }
}

/**
 * Stage 5: Evaluates section visibility flags and generates status warnings.
 */
class SectionBuilder {
  public static build(
    dictionary: DictionaryEntry[],
    kanji: KanjiEntry[],
    names: ProcessedName[],
    grammar: ProcessedGrammarSection
  ): { sections: SectionVisibility; warnings: AnalysisWarning[] } {
    
    const sections: SectionVisibility = {
      dictionary: dictionary.length > 0,
      kanji: kanji.length > 0,
      names: names.length > 0,
      grammar: grammar.primary !== undefined,
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
  public process(result: LanguageAnalysisResult): ProcessedAnalysisResult {
    const rawVocab = result.entries || [];
    const rawKanji = result.kanji || [];
    const rawNames = result.names || [];
    const rawGrammar = result.grammar || [];

    // Stage execution pipeline
    const dictionary = DictionaryRanker.rank(rawVocab, result.sourceText);
    const kanji = KanjiRanker.rank(rawKanji, result.sourceText);
    const names = NameMerger.process(rawNames, result.sourceText);
    const grammar = GrammarRanker.process(rawGrammar, dictionary);
    const { sections, warnings } = SectionBuilder.build(dictionary, kanji, names, grammar);

    return {
      sourceText: result.sourceText,
      dictionary,
      kanji,
      names,
      grammar,
      sections,
      warnings,
    };
  }
}
