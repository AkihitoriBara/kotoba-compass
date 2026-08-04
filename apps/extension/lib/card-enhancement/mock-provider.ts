import { CardEnhancementProvider, PromptMessages, CardEnhancement } from './types';

/**
 * Deterministic Mock Provider for AI Card Enhancement.
 * Always returns repeatable canned outputs for testing and architecture verification.
 */
export class MockCardEnhancementProvider implements CardEnhancementProvider {
  public readonly name = 'mock-enhancer';

  public isConfigured(): boolean {
    return true;
  }

  public async enhance(messages: PromptMessages): Promise<CardEnhancement> {
    const startTime = performance.now();

    // Extract target word from context for deterministic response
    const targetMatch = messages.context.match(/Target Word:\s*([^\n]+)/i);
    const targetWord = targetMatch ? targetMatch[1].trim() : 'この言葉';

    const elapsed = Math.round(performance.now() - startTime);

    return {
      exampleSentence: `毎日${targetWord}を練習すると、自然に身につきます。`,
      exampleTranslation: `If you practice ${targetWord} every day, you will master it naturally.`,
      usageNote: `"${targetWord}" is commonly used in both polite and neutral contexts. Pay attention to preceding particles in written Japanese.`,
      providerName: this.name,
      model: 'mock-enhancer-v1',
      cached: true,
      responseTimeMs: elapsed + 100,
    };
  }
}
