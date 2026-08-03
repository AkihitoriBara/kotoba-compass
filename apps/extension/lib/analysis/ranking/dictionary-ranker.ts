import { DictionaryEntry } from '../types';

/**
 * Stage 1: Ranks dictionary entries based on exact matching, priority, and frequency.
 */
export class DictionaryRanker {
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
