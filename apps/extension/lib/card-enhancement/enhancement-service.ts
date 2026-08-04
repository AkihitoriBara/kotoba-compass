import {
  CardEnhancementProvider,
  CardEnhancementRequest,
  CardEnhancement,
  PromptMessages,
} from './types';
import { MockCardEnhancementProvider } from './mock-provider';
import { GeminiCardEnhancementProvider } from './gemini-provider';
import { PromptBuilder } from './prompt-builder';
import { CardEnhancementValidator } from './validator';
import { CardEnhancementCache } from './cache';

export interface EnhanceOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

const isDev = process.env.NODE_ENV !== 'production';

/**
 * CardEnhancementService is the single orchestration layer for card enhancement.
 * Manages provider selection (Gemini priority -> Mock fallback), LRU caching,
 * timeouts, request cancellation, and error normalization.
 */
export class CardEnhancementService {
  private static instance: CardEnhancementService;
  private geminiProvider: GeminiCardEnhancementProvider;
  private mockProvider: MockCardEnhancementProvider;
  private cache: CardEnhancementCache;
  private activeAbortController: AbortController | null = null;

  private constructor() {
    this.geminiProvider = new GeminiCardEnhancementProvider();
    this.mockProvider = new MockCardEnhancementProvider();
    this.cache = CardEnhancementCache.getInstance();
  }

  public static getInstance(): CardEnhancementService {
    if (!CardEnhancementService.instance) {
      CardEnhancementService.instance = new CardEnhancementService();
    }
    return CardEnhancementService.instance;
  }

  public getActiveProviderName(): string {
    return this.geminiProvider.isConfigured() ? 'gemini' : 'mock-enhancer';
  }

  public async enhanceCard(
    request: CardEnhancementRequest,
    options: EnhanceOptions = {}
  ): Promise<CardEnhancement> {
    const { timeoutMs = 10000 } = options;

    if (this.activeAbortController) {
      this.activeAbortController.abort();
    }
    this.activeAbortController = new AbortController();
    const currentSignal = this.activeAbortController.signal;

    if (options.signal) {
      options.signal.addEventListener('abort', () => {
        this.activeAbortController?.abort();
      });
    }

    // 1. Build provider-agnostic PromptMessages
    const promptMessages: PromptMessages = PromptBuilder.build(request);

    // 2. Compute Cache Key (SHA-256 hash of PromptMessages)
    const cacheKey = await this.cache.generateKey(promptMessages);

    // 3. Cache Lookup
    const cachedEntry = this.cache.get(cacheKey);
    if (cachedEntry) {
      if (isDev) {
        console.log(`[CardEnhancementService] Cache HIT for key: ${cacheKey.substring(0, 8)}...`);
      }
      return cachedEntry;
    }

    if (isDev) {
      console.log(`[CardEnhancementService] Cache MISS for key: ${cacheKey.substring(0, 8)}...`);
    }

    // 4. Determine primary provider (Gemini if configured, else Mock)
    const primaryProvider: CardEnhancementProvider = this.geminiProvider.isConfigured()
      ? this.geminiProvider
      : this.mockProvider;

    if (isDev) {
      console.log(
        `[CardEnhancementService] Requesting enhancement via provider: ${primaryProvider.name}`
      );
    }

    try {
      const enhancement = await this.executeProviderWithTimeout(
        primaryProvider,
        promptMessages,
        timeoutMs,
        currentSignal
      );

      // Validate enhancement
      const validation = CardEnhancementValidator.validate(enhancement);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.map((e) => e.message).join(', ')}`);
      }

      // Store in cache
      this.cache.set(cacheKey, enhancement);

      if (isDev) {
        console.log(
          `[CardEnhancementService] Successfully enhanced via ${primaryProvider.name} (${enhancement.responseTimeMs}ms)`
        );
      }

      return enhancement;
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message === 'Enhancement request cancelled.') {
        throw err;
      }

      if (isDev) {
        console.warn(
          `[CardEnhancementService] Primary provider '${primaryProvider.name}' failed (${err.message}). Falling back to Mock provider.`
        );
      }

      // Fallback to Mock provider on any failure
      try {
        const mockResult = await this.mockProvider.enhance(promptMessages);
        this.cache.set(cacheKey, mockResult);
        return mockResult;
      } catch (fallbackErr: any) {
        // Last-resort fallback object to guarantee UI never breaks
        return {
          exampleSentence: `毎日${request.card.back.primaryWord}を練習しましょう。`,
          exampleTranslation: `Let's practice ${request.card.back.primaryWord} every day.`,
          usageNote: `Standard usage of ${request.card.back.primaryWord}.`,
          providerName: 'mock-fallback',
          model: 'fallback',
          cached: false,
          responseTimeMs: 0,
        };
      }
    } finally {
      if (this.activeAbortController?.signal === currentSignal) {
        this.activeAbortController = null;
      }
    }
  }

  private async executeProviderWithTimeout(
    provider: CardEnhancementProvider,
    messages: PromptMessages,
    timeoutMs: number,
    signal: AbortSignal
  ): Promise<CardEnhancement> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Provider '${provider.name}' timed out after ${timeoutMs}ms.`));
      }, timeoutMs);

      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new Error('Enhancement request cancelled.'));
      });
    });

    const providerPromise = provider.enhance(messages);
    return Promise.race([providerPromise, timeoutPromise]);
  }
}
