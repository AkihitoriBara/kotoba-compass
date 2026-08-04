import { GeneratedCard, CardValidationResult, CardValidationError } from './types';

/**
 * CardValidator validates GeneratedCard instances for completeness and consistency.
 * Returns structured validation results without throwing exceptions.
 */
export class CardValidator {
  public static validate(card: GeneratedCard): CardValidationResult {
    const errors: CardValidationError[] = [];

    if (!card.front.japanese || card.front.japanese.trim().length === 0) {
      errors.push({
        field: 'front.japanese',
        message: 'Card front Japanese text cannot be empty.',
      });
    }

    if (!card.back.primaryWord || card.back.primaryWord.trim().length === 0) {
      errors.push({
        field: 'back.primaryWord',
        message: 'Primary target word cannot be empty.',
      });
    }

    if (!card.back.meanings || card.back.meanings.length === 0) {
      errors.push({
        field: 'back.meanings',
        message: 'Card back must contain at least one definition meaning.',
      });
    }

    if (!card.back.reading || card.back.reading.trim().length === 0) {
      errors.push({
        field: 'back.reading',
        message: 'Kana reading is missing.',
      });
    }

    if (!card.metadata.sourceText || card.metadata.sourceText.trim().length === 0) {
      errors.push({
        field: 'metadata.sourceText',
        message: 'Source text metadata is missing.',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
