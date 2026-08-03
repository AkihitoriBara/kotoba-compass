import { DictionaryEntry, GrammarResult, ProcessedGrammarSection } from '../types';

/**
 * Stage 4: Ranks grammar results and splits them into primary and alternative listings.
 */
export class GrammarRanker {
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
