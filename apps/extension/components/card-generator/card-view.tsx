import { useState, useMemo } from 'react';
import { NotebookPen, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { ProcessedAnalysisResult, KotobaSettings } from '../../lib/analysis/types';
import { CardTemplate } from '../../lib/card-generator/types';
import { CardGenerator } from '../../lib/card-generator/card-generator';
import { TemplateSelector } from './template-selector';
import { CardPreview } from './card-preview';

type CardViewProps = {
  analysisResult?: ProcessedAnalysisResult | null;
  settings: KotobaSettings;
};

export function CardView({ analysisResult, settings }: CardViewProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate>(
    settings.mining?.frontCardFormat || 'word'
  );

  const cardData = useMemo(() => {
    if (!analysisResult) return null;

    return CardGenerator.generateCard({
      analysis: analysisResult,
      settings,
      overrideTemplate: selectedTemplate,
    });
  }, [analysisResult, settings, selectedTemplate]);

  if (!analysisResult) {
    return (
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center p-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <NotebookPen className="size-6" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-foreground">Card Generator</h3>
        <p className="mt-1 max-w-[240px] text-xs text-muted-foreground">
          Select any Japanese text on the page to preview and generate flashcards for Anki.
        </p>
      </div>
    );
  }

  const { card, validation } = cardData!;

  return (
    <div className="space-y-4 p-3.5">
      {/* Template Format Selector Header */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground">Card Format Template</span>
          <span className="text-[11px] text-muted-foreground">
            Furigana: {card.front.showFurigana ? 'On' : 'Off'}
          </span>
        </div>
        <TemplateSelector
          selected={selectedTemplate}
          onChange={setSelectedTemplate}
        />
      </div>

      {/* Card Preview Component */}
      <CardPreview card={card} />

      {/* User-Oriented Card Summary Metadata */}
      <div className="rounded-xl border border-border/60 bg-card/70 p-3 text-xs space-y-2 dark:border-border/30 dark:bg-card/40 shadow-2xs">
        <span className="font-semibold text-foreground">Card Details</span>

        <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
          <div className="rounded-lg border border-border/40 bg-muted/30 p-1.5">
            <span className="block text-[10px] text-muted-foreground">Template</span>
            <span className="font-semibold text-foreground capitalize">{card.metadata.template}</span>
          </div>

          <div className="rounded-lg border border-border/40 bg-muted/30 p-1.5">
            <span className="block text-[10px] text-muted-foreground">Furigana</span>
            <span className="font-semibold text-foreground">
              {card.front.showFurigana ? 'On' : 'Off'}
            </span>
          </div>

          <div className="rounded-lg border border-border/40 bg-muted/30 p-1.5">
            <span className="block text-[10px] text-muted-foreground">Status</span>
            {validation.valid ? (
              <span className="flex items-center justify-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3" /> Ready
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                <AlertCircle className="size-3" /> Issues
              </span>
            )}
          </div>
        </div>

        {!validation.valid && (
          <div className="space-y-0.5 pt-1 text-[11px] text-destructive">
            {validation.errors.map((err) => (
              <p key={err.field}>• {err.message}</p>
            ))}
          </div>
        )}
      </div>

      {/* Export Action Area */}
      <div className="space-y-1.5 pt-1 text-center">
        <button
          type="button"
          disabled={true}
          className="flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-muted px-4 text-xs font-semibold text-muted-foreground cursor-not-allowed border border-border/50 opacity-70"
        >
          <Download className="size-3.5" />
          <span>Export to Anki</span>
        </button>
        <p className="text-[10px] text-muted-foreground/75">
          AnkiConnect integration available in Milestone 9.2
        </p>
      </div>
    </div>
  );
}
