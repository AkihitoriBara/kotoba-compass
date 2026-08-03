import { KanjiEntry } from '../types';

/**
 * Stage 2: Ranks Kanji entries preserving their appearance sequence in the selected text.
 */
export class KanjiRanker {
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
