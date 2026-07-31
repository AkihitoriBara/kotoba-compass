import { AlertCircle } from 'lucide-react';
import { DictionaryEntry, KanjiEntry } from '../lib/analysis/types';

type DictionaryResultProps = {
  entries: DictionaryEntry[];
  kanji?: KanjiEntry[];
  sourceText: string;
};

function DictionaryResult({ entries, kanji, sourceText }: DictionaryResultProps) {
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
      {/* Search Header */}
      <div className="flex items-center space-x-2 pb-1 border-b border-border/40">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Selected:
        </span>
        <span className="text-sm font-bold font-mono text-foreground bg-muted/50 px-2 py-0.5 rounded">
          {sourceText}
        </span>
      </div>

      {/* Vocabulary Results */}
      <div className="space-y-4">
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

      {/* Kanji Details Section */}
      {kanji && kanji.length > 0 && (
        <div className="mt-6 space-y-4 pt-4 border-t border-border/40">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
            Kanji Characters
          </h4>
          <div className="space-y-4 pb-6">
            {kanji.map((kEntry, kIdx) => (
              <div
                key={`${kEntry.kanji}-${kIdx}`}
                className="rounded-xl border border-border/60 bg-muted/20 p-4 dark:border-border/30"
              >
                <div className="flex gap-4">
                  {/* Big Kanji Display */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-card text-3xl font-bold shadow-sm dark:border-border/40" lang="ja">
                    {kEntry.kanji}
                  </div>

                  {/* Kanji Metadata Block */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
                      <span className="bg-muted px-2 py-0.5 rounded">
                        Strokes: <span className="font-bold text-foreground">{kEntry.strokeCount}</span>
                      </span>
                      {kEntry.radical && (
                        <span className="bg-muted px-2 py-0.5 rounded">
                          Radical: <span className="font-bold text-foreground">{kEntry.radical}</span>
                        </span>
                      )}
                      {kEntry.jlptLevel && (
                        <span className="bg-muted px-2 py-0.5 rounded">
                          JLPT: <span className="font-bold text-foreground">N{kEntry.jlptLevel}</span>
                        </span>
                      )}
                      {kEntry.grade && (
                        <span className="bg-muted px-2 py-0.5 rounded">
                          Grade: <span className="font-bold text-foreground">{kEntry.grade}</span>
                        </span>
                      )}
                    </div>

                    {/* Readings */}
                    <div className="space-y-1 text-xs">
                      {kEntry.onyomi.length > 0 && (
                        <div className="flex items-center gap-x-2">
                          <span className="w-8 font-bold text-muted-foreground">On:</span>
                          <div className="flex flex-wrap gap-1">
                            {kEntry.onyomi.map((on) => (
                              <span key={on} className="bg-sky-500/10 text-sky-700 dark:text-sky-400 px-1.5 py-0.5 rounded font-bold" lang="ja">
                                {on}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {kEntry.kunyomi.length > 0 && (
                        <div className="flex items-center gap-x-2">
                          <span className="w-8 font-bold text-muted-foreground">Kun:</span>
                          <div className="flex flex-wrap gap-1">
                            {kEntry.kunyomi.map((kun) => (
                              <span key={kun} className="bg-amber-500/10 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold" lang="ja">
                                {kun}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Meanings */}
                <div className="mt-4 pt-3 border-t border-border/20">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1">
                    Meanings
                  </p>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {kEntry.meanings.join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export { DictionaryResult };
