import {
  GeneratedCard,
  CardValidationResult,
  CardGenerationRequest,
} from './types';
import { TemplateEngine } from './template-engine';
import { CardValidator } from './card-validator';

/**
 * CardGenerator is the main entry point for constructing study cards.
 * Orchestrates TemplateEngine and CardValidator cleanly with zero UI/Anki dependencies.
 */
export class CardGenerator {
  public static generateCard(request: CardGenerationRequest): {
    card: GeneratedCard;
    validation: CardValidationResult;
  } {
    const card = TemplateEngine.buildCard(request);
    const validation = CardValidator.validate(card);

    return {
      card,
      validation,
    };
  }
}
