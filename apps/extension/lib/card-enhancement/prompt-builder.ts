import { CardEnhancementRequest, PromptMessages } from './types';

/**
 * PromptBuilder constructs provider-agnostic PromptMessages for card enhancement.
 * Output: { system, context, user }
 */
export class PromptBuilder {
  private static readonly SYSTEM_INSTRUCTIONS = `You are an AI assistant for Kotoba Compass specializing in Japanese flashcard enhancement.
Your sole job is to generate contextual learning material for a study card.

STRICT CONSTRAINTS:
1. Generate ONLY:
   - One natural Japanese example sentence using the target vocabulary.
   - A concise English translation of that example sentence.
   - A short usage note (formality, nuance, common collocation, or pitfall - max 2 sentences).
2. DO NOT alter or attempt to redefine the target word, reading, dictionary meaning, or kanji data.
3. Keep output concise, educational, and accurate.`;

  public static build(request: CardEnhancementRequest): PromptMessages {
    const { card } = request;
    const contextLines: string[] = [
      `Target Word: ${card.back.primaryWord}`,
      `Reading: ${card.back.reading}`,
      `Meanings: ${card.back.meanings.join('; ')}`,
      `Part of Speech: ${card.back.partOfSpeech.join(', ')}`,
      `Original Context Sentence: ${card.metadata.sourceText}`,
    ];

    if (card.back.grammarSummary) {
      contextLines.push(`Grammar Summary: ${card.back.grammarSummary}`);
    }
    if (card.back.translation) {
      contextLines.push(`Sentence Translation: ${card.back.translation}`);
    }

    return {
      system: PromptBuilder.SYSTEM_INSTRUCTIONS,
      context: contextLines.join('\n'),
      user: `Please generate a natural example sentence, English translation, and short usage note for "${card.back.primaryWord}".`,
    };
  }
}
