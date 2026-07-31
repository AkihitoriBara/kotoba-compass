import { AlertCircle, BookOpen } from 'lucide-react';
import { DictionaryEntry } from '../lib/analysis/types';

type DictionaryResultProps = {
  entries: DictionaryEntry[];
  sourceText: string;
};

function DictionaryResult({ entries, sourceText }: DictionaryResultProps) {
  if (entries.length === 0) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <AlertCircle className="size-6" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-foreground">No dictionary entry was found</h3>
        <p className="mt-2 text-xs leading-5 text-muted-foreground max-w-[280px]">
          Try selecting a single word instead of an entire sentence.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col p-4 space-y-4">
      <div className="flex items-center space-x-2 pb-1 border-b border-border/40">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Selected:
        </span>
        <span className="text-sm font-bold font-mono text-foreground bg-muted/50 px-2 py-0.5 rounded">
          {sourceText}
        </span>
      </div>

      <div className="space-y-4 pb-6">
        {entries.map((entry, idx) => (
          <div
            key={`${entry.word}-${entry.reading}-${idx}`}
            className="group rounded-xl border border-border/80 bg-card p-4 shadow-sm transition-all hover:shadow-md dark:border-border/40"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-2">
              <div className="space-y-0.5">
                <h3 className="text-xl font-bold tracking-tight text-foreground" lang="ja">
                  {entry.word}
                </h3>
                <p className="text-sm font-medium text-muted-foreground" lang="ja">
                  {entry.reading}
                </p>
              </div>

              {/* Part of Speech Badges */}
              {entry.partOfSpeech.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {entry.partOfSpeech.map((pos) => (
                    <span
                      key={pos}
                      className="inline-flex items-center rounded-md bg-primary/5 px-2 py-0.5 text-[10px] font-semibold text-primary ring-1 ring-inset ring-primary/10 dark:bg-primary/20 dark:text-primary-foreground dark:ring-0"
                    >
                      {pos}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Meanings */}
            <div className="mt-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                Definitions
              </p>
              <ol className="list-decimal pl-4 space-y-1.5 text-sm text-foreground/90">
                {entry.meanings.map((meaning, mIdx) => (
                  <li key={mIdx} className="leading-relaxed">
                    {meaning}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export { DictionaryResult };
