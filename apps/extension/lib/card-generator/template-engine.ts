import {
  CardFront,
  CardBack,
  CardMetadata,
  CardTemplate,
  GeneratedCard,
  CardGenerationRequest,
} from './types';

/**
 * TemplateEngine constructs deterministic GeneratedCard instances
 * for Word, Sentence, and Cloze templates.
 * Operates purely on analysis data and settings with zero UI or network dependencies.
 */
export class TemplateEngine {
  public static buildCard(request: CardGenerationRequest): GeneratedCard {
    const { analysis, settings, overrideTemplate } = request;
    const template: CardTemplate =
      overrideTemplate || settings.mining?.frontCardFormat || 'word';

    const showFurigana = Boolean(settings.mining?.furiganaOnFront);

    // Extract primary target word from dictionary or fallback to source text
    const primaryEntry = analysis.dictionary[0];
    const primaryWord = primaryEntry ? primaryEntry.word : analysis.sourceText;
    const reading = primaryEntry ? primaryEntry.reading : analysis.sourceText;
    const meanings = primaryEntry
      ? primaryEntry.meanings
      : ['No direct dictionary definition available'];
    const partOfSpeech = primaryEntry ? primaryEntry.partOfSpeech : ['other'];

    // Extract kanji info
    const kanjiInfo = analysis.kanji.slice(0, 3).map((k) => ({
      character: k.kanji,
      meanings: k.meanings,
      onyomi: k.onyomi,
      kunyomi: k.kunyomi,
    }));

    // Extract grammar summary
    let grammarSummary: string | undefined;
    if (analysis.grammar?.primary) {
      const g = analysis.grammar.primary;
      grammarSummary = `${g.dictionaryForm} (${g.partOfSpeech}${
        g.politeness ? `, ${g.politeness}` : ''
      }${g.tense ? `, ${g.tense}` : ''})`;
    }

    // Build Front and Back according to template
    const front = TemplateEngine.buildFront(
      template,
      analysis.sourceText,
      primaryWord,
      reading,
      showFurigana
    );

    const back: CardBack = {
      primaryWord,
      reading,
      meanings,
      partOfSpeech,
      grammarSummary,
      kanjiInfo: kanjiInfo.length > 0 ? kanjiInfo : undefined,
      translation: analysis.translation?.translatedText,
      aiExamplePlaceholder: '[AI Example Sentence - Available in Milestone 9.1]',
      aiExplanationPlaceholder: '[AI Explanation - Available in Milestone 9.1]',
      audioPlaceholder: '[Audio - Available in Future Milestone]',
    };

    // Metadata tags
    const tags: string[] = ['kotoba-compass', `template:${template}`];
    if (primaryEntry?.jlpt) {
      tags.push(`jlpt:${primaryEntry.jlpt.toLowerCase()}`);
    }

    const metadata: CardMetadata = {
      tags,
      jlpt: primaryEntry?.jlpt,
      sourceText: analysis.sourceText,
      template,
      generatedAt: Date.now(),
    };

    const id = `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return {
      id,
      front,
      back,
      metadata,
    };
  }

  private static buildFront(
    template: CardTemplate,
    sourceText: string,
    primaryWord: string,
    reading: string,
    showFurigana: boolean
  ): CardFront {
    const furiganaText =
      reading && reading !== primaryWord ? `${primaryWord} [${reading}]` : undefined;

    switch (template) {
      case 'sentence':
        return {
          japanese: sourceText,
          furigana: showFurigana ? furiganaText : undefined,
          showFurigana,
          imagePlaceholder: '[Image - Optional]',
        };

      case 'cloze': {
        const clozeText = sourceText.includes(primaryWord)
          ? sourceText.replace(primaryWord, `[${primaryWord}]`)
          : `[...] ${sourceText}`;

        return {
          japanese: clozeText,
          furigana: showFurigana ? furiganaText : undefined,
          showFurigana,
          imagePlaceholder: '[Image - Optional]',
        };
      }

      case 'word':
      default:
        return {
          japanese: primaryWord,
          furigana: showFurigana ? furiganaText : undefined,
          showFurigana,
          imagePlaceholder: '[Image - Optional]',
        };
    }
  }
}
