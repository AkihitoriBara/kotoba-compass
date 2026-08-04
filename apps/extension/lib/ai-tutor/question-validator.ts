export interface ValidationResult {
  valid: boolean;
  redirectionMessage?: string;
}

/**
 * QuestionValidator evaluates whether a user's prompt is relevant
 * to explaining the currently selected Japanese text.
 * Rejects unrelated prompts (coding, math, general trivia, essays) with a polite redirection message.
 */
export class QuestionValidator {
  private static readonly REDIRECTION_MESSAGE =
    'I am designed specifically to help explain the currently selected Japanese text.';

  private static readonly REJECTED_PATTERNS = [
    /\b(python|javascript|typescript|c\+\+|java|html|css|sql|react|vue|angular)\b/i,
    /\b(write|create|generate|fix|debug)\s+(code|script|program|function|class)\b/i,
    /\b(calculus|derivative|integral|equation|algebra|math|theorem)\b/i,
    /\b(tell|say|joke|riddle|poem|essay|story|funny)\b/i,
    /\b(football|soccer|basketball|baseball|match|world cup|olympics|score)\b/i,
    /\b(who won|today's news|weather|stock market)\b/i,
  ];

  public static validate(userQuestion: string, sourceText: string): ValidationResult {
    const trimmedQuestion = userQuestion.trim();

    // Empty user question is valid (uses default action preset)
    if (!trimmedQuestion) {
      return { valid: true };
    }

    // Check against forbidden / unrelated patterns
    for (const pattern of QuestionValidator.REJECTED_PATTERNS) {
      if (pattern.test(trimmedQuestion)) {
        return {
          valid: false,
          redirectionMessage: QuestionValidator.REDIRECTION_MESSAGE,
        };
      }
    }

    return { valid: true };
  }
}
