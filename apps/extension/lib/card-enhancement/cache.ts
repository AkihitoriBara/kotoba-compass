import { CardEnhancement, PromptMessages } from './types';

export interface CacheEntry {
  key: string;
  enhancement: CardEnhancement;
  createdAt: number;
}

/**
 * CardEnhancementCache manages in-memory LRU caching with SHA-256 keys and 24h TTL.
 * Max entries: 250. Expired entries automatically evicted on access.
 */
export class CardEnhancementCache {
  private static instance: CardEnhancementCache;
  private cache: Map<string, CacheEntry> = new Map();
  private readonly maxEntries: number = 250;
  private readonly ttlMs: number = 24 * 60 * 60 * 1000; // 24 Hours

  private constructor() {}

  public static getInstance(): CardEnhancementCache {
    if (!CardEnhancementCache.instance) {
      CardEnhancementCache.instance = new CardEnhancementCache();
    }
    return CardEnhancementCache.instance;
  }

  /**
   * Generates SHA-256 hash key based on system, context, and user prompt messages.
   */
  public async generateKey(messages: PromptMessages): Promise<string> {
    const raw = `${messages.system}||${messages.context}||${messages.user}`;
    try {
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        const msgUint8 = new TextEncoder().encode(raw);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      }
    } catch {
      // Fallback if crypto.subtle is unavailable
    }

    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `fallback_${Math.abs(hash)}_${raw.length}`;
  }

  public get(key: string): CardEnhancement | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check 24h TTL expiration
    if (Date.now() - entry.createdAt > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    // Refresh LRU position
    this.cache.delete(key);
    this.cache.set(key, entry);

    return {
      ...entry.enhancement,
      cached: true,
    };
  }

  public set(key: string, enhancement: CardEnhancement): void {
    // LRU Eviction when capacity reached
    if (this.cache.size >= this.maxEntries) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      key,
      enhancement: {
        ...enhancement,
        cached: false,
      },
      createdAt: Date.now(),
    });
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}
