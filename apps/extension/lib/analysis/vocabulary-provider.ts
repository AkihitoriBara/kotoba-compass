import { DeinflectionCandidate, DictionaryEntry, LanguageProvider } from './types';

interface RawEntry {
  w: string;   // word
  r: string;   // reading
  m: string[]; // meanings
  p: string[]; // partOfSpeech
}

export class VocabularyProvider implements LanguageProvider<DictionaryEntry> {
  public name = 'vocabulary';
  private bucketCache = new Map<number, RawEntry[]>();

  /**
   * Looks up candidate word forms inside the split JSON database buckets.
   */
  public async lookup(candidates: DeinflectionCandidate[]): Promise<DictionaryEntry[]> {
    const results: DictionaryEntry[] = [];
    const seenKeys = new Set<string>();

    for (const candidate of candidates) {
      const term = candidate.text;
      if (!term) continue;

      // Hashing: first character determines the bucket
      const bucketIndex = term.charCodeAt(0) % 100;
      
      try {
        const entries = await this.loadBucket(bucketIndex);
        
        // Find matching entries for the current candidate term
        const matches = entries.filter(
          (entry) => entry.w === term || entry.r === term
        );

        for (const match of matches) {
          const key = `${match.w}-${match.r}`;
          if (seenKeys.has(key)) continue;
          seenKeys.add(key);

          results.push({
            word: match.w,
            reading: match.r,
            meanings: match.m,
            partOfSpeech: match.p,
            tags: candidate.rulesApplied.length > 0 ? ['deinflected'] : [],
          });
        }
      } catch (e) {
        console.error(`[VocabularyProvider] Failed to search bucket ${bucketIndex} for term "${term}":`, e);
      }
    }

    return results;
  }

  /**
   * Loads a dictionary hash bucket and caches its contents in memory.
   */
  private async loadBucket(bucketIndex: number): Promise<RawEntry[]> {
    if (this.bucketCache.has(bucketIndex)) {
      return this.bucketCache.get(bucketIndex)!;
    }

    const url = browser.runtime.getURL(`dictionaries/vocabulary/bucket_${bucketIndex}.json` as any);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch bucket asset: status ${response.status}`);
    }

    const data = (await response.json()) as RawEntry[];
    this.bucketCache.set(bucketIndex, data);
    return data;
  }
}
