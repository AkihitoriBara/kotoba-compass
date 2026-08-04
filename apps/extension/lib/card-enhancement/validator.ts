import { CardEnhancement, EnhancementValidationResult, EnhancementValidationError } from './types';

/**
 * CardEnhancementValidator validates CardEnhancement responses for completeness and output rules.
 */
export class CardEnhancementValidator {
  public static validate(enhancement: CardEnhancement): EnhancementValidationResult {
    const errors: EnhancementValidationError[] = [];

    if (!enhancement.exampleSentence || enhancement.exampleSentence.trim().length === 0) {
      errors.push({
        field: 'exampleSentence',
        message: 'Example sentence cannot be empty.',
      });
    }

    if (!enhancement.exampleTranslation || enhancement.exampleTranslation.trim().length === 0) {
      errors.push({
        field: 'exampleTranslation',
        message: 'Example sentence translation cannot be empty.',
      });
    }

    if (!enhancement.usageNote || enhancement.usageNote.trim().length === 0) {
      errors.push({
        field: 'usageNote',
        message: 'Usage note cannot be empty.',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
