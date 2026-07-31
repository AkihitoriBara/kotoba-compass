import { DeinflectionCandidate, KanjiEntry, LanguageProvider } from './types';

interface RawKanji {
  k: string;    // kanji
  on: string[]; // onyomi
  kun: string[];// kunyomi
  m: string[];  // meanings
  s: number;    // strokes
  r?: string;   // radical
  jlpt?: number;// jlpt level
  freq?: number;// frequency rank
  g?: number;   // grade
}

export class KanjiProvider implements LanguageProvider<KanjiEntry> {
  public name = 'kanji';
  private bucketCache = new Map<number, RawKanji[]>();

  /**
   * Identifies all unique kanji in search candidates and loads their metadata details.
   */
  public async lookup(candidates: DeinflectionCandidate[]): Promise<KanjiEntry[]> {
    const kanjiSet = new Set<string>();

    for (const candidate of candidates) {
      const matches = candidate.text.match(/[\u4e00-\u9faf]/g);
      if (matches) {
        for (const char of matches) {
          kanjiSet.add(char);
        }
      }
    }

    const uniqueKanji = Array.from(kanjiSet);
    if (uniqueKanji.length === 0) {
      return [];
    }

    const results: KanjiEntry[] = [];

    for (const kanjiChar of uniqueKanji) {
      const bucketIndex = kanjiChar.charCodeAt(0) % 100;

      try {
        const entries = await this.loadBucket(bucketIndex);
        const match = entries.find((e) => e.k === kanjiChar);
        
        if (match) {
          results.push({
            kanji: match.k,
            onyomi: match.on,
            kunyomi: match.kun,
            meanings: match.m,
            strokeCount: match.s,
            radical: match.r,
            jlptLevel: match.jlpt,
            frequency: match.freq,
            grade: match.g,
          });
        }
      } catch (e) {
        console.error(`[KanjiProvider] Failed to search bucket ${bucketIndex} for character "${kanjiChar}":`, e);
      }
    }

    return results;
  }

  /**
   * Fetches a kanji hash bucket and caches its contents in memory.
   */
  private async loadBucket(bucketIndex: number): Promise<RawKanji[]> {
    if (this.bucketCache.has(bucketIndex)) {
      return this.bucketCache.get(bucketIndex)!;
    }

    const url = browser.runtime.getURL(`dictionaries/kanji/bucket_${bucketIndex}.json` as any);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch kanji bucket asset: status ${response.status}`);
    }

    const data = (await response.json()) as RawKanji[];
    this.bucketCache.set(bucketIndex, data);
    return data;
  }
}
