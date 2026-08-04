import { CardBack } from '../../lib/card-generator/types';
import { BookOpen, Sparkles, Volume2 } from 'lucide-react';

type BackPreviewProps = {
  back: CardBack;
};

function formatPartOfSpeech(tag: string): string {
  const lower = tag.toLowerCase().trim();
  if (lower === 'n' || lower === 'noun') return 'Noun';
  if (lower.startsWith('v') || lower === 'verb') return 'Verb';
  if (lower.startsWith('adj') || lower === 'adjective') return 'Adjective';
  if (lower.startsWith('prt') || lower === 'particle') return 'Particle';
  if (lower.startsWith('aux') || lower === 'auxiliary') return 'Auxiliary';
  if (lower.startsWith('adv') || lower === 'adverb') return 'Adverb';
  if (lower.startsWith('pn') || lower === 'name') return 'Proper Noun';
  if (lower === 'other') return 'Other';
  return tag.charAt(0).toUpperCase() + tag.slice(1);
}

export function BackPreview({ back }: BackPreviewProps) {
  const primaryMeaning = back.meanings[0] || 'No definition available';
  const additionalMeanings = back.meanings.slice(1);

  return (
    <div className="space-y-3.5 p-4 text-left">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/15 pb-2 dark:border-border/10">
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground/75">
          Back Preview
        </span>
        <span className="font-japanese text-sm font-semibold text-primary">
          {back.reading}
        </span>
      </div>

      {/* Primary Target & Main Meaning */}
      <div className="space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-japanese text-xl font-bold text-foreground">
            {back.primaryWord}
          </h3>
          <span className="text-xs font-medium text-muted-foreground">{back.reading}</span>
        </div>

        {/* Primary English Meaning */}
        <p className="text-sm font-semibold text-foreground leading-snug">
          {primaryMeaning}
        </p>

        {/* Part of Speech Badges */}
        {back.partOfSpeech.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {back.partOfSpeech.map((pos) => (
              <span
                key={pos}
                className="rounded-md border border-border/40 bg-secondary/60 px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
              >
                {formatPartOfSpeech(pos)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-b border-border/15 dark:border-border/10" />

      {/* Additional Definitions */}
      {additionalMeanings.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-muted-foreground">Definitions</span>
          <ol className="list-decimal pl-4 text-xs text-foreground/90 space-y-1 leading-relaxed">
            {additionalMeanings.map((meaning, i) => (
              <li key={i}>{meaning}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Grammar Breakdown (if present) */}
      {back.grammarSummary && (
        <div className="rounded-xl border border-border/60 bg-muted/30 p-2.5 text-xs dark:border-border/30">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <BookOpen className="size-3.5 text-primary" /> Grammar & Form
          </div>
          <p className="mt-1 text-muted-foreground leading-relaxed">{back.grammarSummary}</p>
        </div>
      )}

      {/* Kanji Information */}
      {back.kanjiInfo && back.kanjiInfo.length > 0 && (
        <>
          <div className="border-b border-border/15 dark:border-border/10" />
          <div className="space-y-2">
            <span className="text-[11px] font-medium text-muted-foreground">Kanji Information</span>
            <div className="grid grid-cols-1 gap-1.5">
              {back.kanjiInfo.map((k) => (
                <div
                  key={k.character}
                  className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/60 p-2.5 text-xs dark:border-border/30 dark:bg-card/30"
                >
                  <span className="font-japanese text-xl font-bold text-primary shrink-0">
                    {k.character}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{k.meanings.join(', ')}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      On: {k.onyomi.join(', ') || '—'} | Kun: {k.kunyomi.join(', ') || '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Context Translation */}
      {back.translation && (
        <div className="rounded-xl border border-border/60 bg-card/60 p-2.5 text-xs dark:border-border/30">
          <span className="font-semibold text-foreground">Sentence Translation: </span>
          <span className="text-muted-foreground">{back.translation}</span>
        </div>
      )}

      {/* Future Feature Placeholders */}
      <div className="border-b border-border/15 dark:border-border/10" />
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 p-2.5 text-xs text-muted-foreground/80">
          <div className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-primary/70" />
            <span className="font-medium">AI Example Sentence</span>
          </div>
          <span className="text-[10px] italic">Available in next milestone</span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 p-2.5 text-xs text-muted-foreground/80">
          <div className="flex items-center gap-2">
            <Volume2 className="size-3.5 text-primary/70" />
            <span className="font-medium">Pronunciation Audio</span>
          </div>
          <span className="text-[10px] italic">Coming soon</span>
        </div>
      </div>
    </div>
  );
}
