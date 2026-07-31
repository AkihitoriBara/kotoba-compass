import { DeinflectionCandidate, NameEntry, LanguageProvider } from './types';

interface RawName {
  w: string;   // written
  r: string;   // reading
  m: string[]; // meanings
  t: string;   // type
  tags?: string[]; // extra tags
  p?: number;  // priority score
}

export class NameProvider implements LanguageProvider<NameEntry> {
  public name = 'names';
  private bucketCache = new Map<number, RawName[]>();

  /**
   * Looks up candidate terms within the split proper name database.
   */
  public async lookup(candidates: DeinflectionCandidate[]): Promise<NameEntry[]> {
    const results: NameEntry[] = [];
    const queriedTexts = new Set<string>();

    for (const candidate of candidates) {
      const text = candidate.text.trim();
      if (!text || queriedTexts.has(text)) {
        continue;
      }
      queriedTexts.add(text);

      const bucketIndex = text.charCodeAt(0) % 100;
      if (isNaN(bucketIndex)) {
        continue;
      }

      try {
        const entries = await this.loadBucket(bucketIndex);
        const matches = entries.filter((e) => e.w === text);
        
        for (const match of matches) {
          results.push({
            written: match.w,
            reading: match.r,
            meanings: match.m,
            type: match.t as any,
            tags: match.tags,
            priority: match.p,
          });
        }
      } catch (e) {
        console.error(`[NameProvider] Failed to query name bucket ${bucketIndex} for "${text}":`, e);
      }
    }

    return results;
  }

  /**
   * Loads a proper name bucket asset and caches it in memory.
   */
  private async loadBucket(bucketIndex: number): Promise<RawName[]> {
    if (this.bucketCache.has(bucketIndex)) {
      return this.bucketCache.get(bucketIndex)!;
    }

    const url = browser.runtime.getURL(`dictionaries/names/bucket_${bucketIndex}.json` as any);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch proper name bucket asset: status ${response.status}`);
    }

    const data = (await response.json()) as RawName[];
    this.bucketCache.set(bucketIndex, data);
    return data;
  }
}
