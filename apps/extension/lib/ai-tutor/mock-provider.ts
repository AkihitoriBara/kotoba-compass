import { AiTutorProvider, ProviderCapabilities, PromptMessages, AiTutorResponse } from './types';

/**
 * Deterministic Mock AI Tutor Provider.
 * Used for automated testing, offline development, and architecture validation.
 * Exposes ProviderCapabilities with all optional capabilities set to false.
 */
export class MockAiTutorProvider implements AiTutorProvider {
  public readonly name = 'mock';
  public readonly capabilities: ProviderCapabilities = {
    supportsStreaming: false,
    supportsExamples: false,
    supportsImages: false,
    supportsAudio: false,
  };

  public isConfigured(): boolean {
    return true;
  }

  public async explain(messages: PromptMessages): Promise<AiTutorResponse> {
    const startTime = performance.now();

    // Check for isolated particle / insufficient context indicator
    const userText = messages.user.toLowerCase();
    const contextText = messages.context;

    const isSingleParticle = /selected text:\s*(は|を|が|に|で|へ|と|から|より|だけ|しか|も)\s*$/i.test(contextText) ||
      /^(は|を|が|に|で|へ|と|から|より|だけ|しか|も)$/.test(messages.user.trim());

    if (isSingleParticle) {
      const elapsed = Math.round(performance.now() - startTime);
      return {
        summary: 'The selected text is an isolated particle. Surrounding sentence context is required to explain its specific grammatical function accurately.',
        needsMoreContext: true,
        providerName: this.name,
        model: 'mock-v1',
        responseTimeMs: elapsed,
      };
    }

    // Extract target word/phrase from context text for deterministic responses
    const targetMatch = contextText.match(/Selected Text:\s*([^\n]+)/i);
    const targetText = targetMatch ? targetMatch[1].trim() : 'this selection';

    const elapsed = Math.round(performance.now() - startTime);

    if (userText.includes('grammar') || userText.includes('breakdown')) {
      return {
        summary: `Grammar breakdown for "${targetText}".`,
        grammar: `"${targetText}" demonstrates standard Japanese inflection and structural form. Detailed particle and verb class mappings are derived from the pre-analyzed grammar context.`,
        example: {
          japanese: `毎日${targetText}を練習しています。`,
          english: `I practice ${targetText} every day.`,
          explanation: `Demonstrates "${targetText}" in a natural daily context.`,
        },
        learningTip: `Pay attention to the particle that follows "${targetText}" in full sentences.`,
        providerName: this.name,
        model: 'mock-v1',
        responseTimeMs: elapsed,
      };
    }

    if (userText.includes('nuance') || userText.includes('why')) {
      return {
        summary: `Usage and nuance breakdown for "${targetText}".`,
        nuance: `"${targetText}" carries a standard formal/polite nuance appropriate for general conversation. In casual speech, contractions may be used.`,
        commonMistake: `Avoid confusing "${targetText}" with similar sounding homophones or improper politeness levels.`,
        example: {
          japanese: `この${targetText}はとても使いやすいです。`,
          english: `This ${targetText} is very easy to use.`,
        },
        providerName: this.name,
        model: 'mock-v1',
        responseTimeMs: elapsed,
      };
    }

    if (userText.includes('example')) {
      return {
        summary: `Natural usage examples for "${targetText}".`,
        example: {
          japanese: `田中さんは${targetText}について話しました。`,
          english: `Mr. Tanaka spoke about ${targetText}.`,
          explanation: `Example sentence illustrating topic marker usage.`,
        },
        learningTip: `Try replacing nouns around "${targetText}" to practice sentence building.`,
        providerName: this.name,
        model: 'mock-v1',
        responseTimeMs: elapsed,
      };
    }

    if (userText.includes('mistake')) {
      return {
        summary: `Common learner mistakes related to "${targetText}".`,
        commonMistake: `Learners often mismatch particles or apply incorrect conjugation rules when combining "${targetText}" with auxiliary verbs.`,
        learningTip: `Verify the dictionary form before appending tense suffixes.`,
        providerName: this.name,
        model: 'mock-v1',
        responseTimeMs: elapsed,
      };
    }

    // Default general explanation response
    return {
      summary: `Contextual explanation for "${targetText}".`,
      grammar: `Analysis indicates standard usage of "${targetText}".`,
      nuance: `Commonly used in both spoken and written Japanese.`,
      example: {
        japanese: `${targetText}の正しい使い方を理解しましょう。`,
        english: `Let's understand the correct usage of ${targetText}.`,
      },
      learningTip: `Cross-reference this entry with the Dictionary tab for detailed definitions.`,
      providerName: this.name,
      model: 'mock-v1',
      responseTimeMs: elapsed,
    };
  }
}
