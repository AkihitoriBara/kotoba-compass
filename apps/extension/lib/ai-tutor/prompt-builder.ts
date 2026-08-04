import { AiTutorRequest, PromptMessages, TutorAction } from './types';

/**
 * PromptBuilder generates provider-agnostic PromptMessages.
 * It is completely unaware of provider-specific APIs or payloads.
 */
export class PromptBuilder {
  private static readonly SYSTEM_INSTRUCTIONS = `You are the Kotoba Compass AI Tutor, a specialized Japanese language assistant.
Your SOLE purpose is to explain the user's currently selected Japanese text during reading.

MANDATORY RESPONSE CONSTRAINTS:
1. Explain ONLY the currently selected Japanese text.
2. Never answer unrelated questions or act as a general-purpose chatbot.
3. PRECEDENCE: Always prioritize pre-analyzed dictionary, grammar, and analysis context over internal model inference.
4. Never contradict supplied dictionary results or grammar analysis.
5. Never introduce new grammar concepts unless directly required to explain the selected text.
6. Keep responses concise, clear, and educational.
7. Admit uncertainty whenever appropriate.
8. Request more surrounding context if an isolated particle or character cannot be reliably explained.
9. Never fabricate grammar rules, meanings, or conjugations.`;

  public static build(request: AiTutorRequest): PromptMessages {
    const contextLines: string[] = [];

    contextLines.push(`Selected Text: ${request.sourceText}`);

    if (request.context) {
      const { dictionary, grammar, kanji, names, translation } = request.context;

      if (dictionary && dictionary.length > 0) {
        const dictSummaries = dictionary
          .slice(0, 3)
          .map((entry) => {
            const head = entry.word || entry.reading || '';
            const glosses = entry.meanings.slice(0, 3).join('; ');
            return `${head} [${entry.reading || ''}]: ${glosses}`;
          })
          .join('\n');
        contextLines.push(`\nDictionary Context:\n${dictSummaries}`);
      }

      if (grammar && grammar.primary) {
        const p = grammar.primary;
        contextLines.push(
          `\nGrammar Context:\nDictionary Form: ${p.dictionaryForm}\nPart of Speech: ${p.partOfSpeech}${
            p.politeness ? `\nPoliteness: ${p.politeness}` : ''
          }${p.tense ? `\nTense: ${p.tense}` : ''}`
        );
      }

      if (kanji && kanji.length > 0) {
        const kanjiSummaries = kanji
          .slice(0, 3)
          .map(
            (k) =>
              `${k.kanji}: ${k.meanings.slice(0, 2).join(', ')} (On: ${k.onyomi.join(', ')}, Kun: ${k.kunyomi.join(', ')})`
          )
          .join('\n');
        contextLines.push(`\nKanji Context:\n${kanjiSummaries}`);
      }

      if (names && names.length > 0) {
        const nameSummaries = names
          .slice(0, 2)
          .map(
            (n) =>
              `${n.written} [${n.readings.join(', ')}]: ${n.types.join(', ')} (${n.meanings.join('; ')})`
          )
          .join('\n');
        contextLines.push(`\nName Context:\n${nameSummaries}`);
      }

      if (translation && translation.translatedText) {
        contextLines.push(`\nContext Translation: ${translation.translatedText}`);
      }
    }

    let userPrompt = request.userQuestion || '';
    if (!userPrompt && request.action) {
      userPrompt = PromptBuilder.mapActionToPrompt(request.action);
    } else if (!userPrompt) {
      userPrompt = 'Please explain this Japanese text.';
    }

    return {
      system: PromptBuilder.SYSTEM_INSTRUCTIONS,
      context: contextLines.join('\n'),
      user: userPrompt,
    };
  }

  private static mapActionToPrompt(action: TutorAction): string {
    switch (action) {
      case TutorAction.Explain:
        return 'Explain this Japanese text.';
      case TutorAction.Grammar:
        return 'Provide a detailed grammar breakdown for this selection.';
      case TutorAction.Nuance:
        return 'Explain the formality, style, and usage nuance of this selection.';
      case TutorAction.Example:
        return 'Give a natural example sentence using this selection.';
      case TutorAction.Mistakes:
        return 'What are common learner mistakes when using this selection?';
      default:
        return 'Explain this Japanese text.';
    }
  }
}
