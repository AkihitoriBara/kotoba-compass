import { useState, KeyboardEvent } from 'react';
import {
  Sparkles,
  Send,
  BookOpen,
  HelpCircle,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  FileQuestion,
  Loader2,
} from 'lucide-react';
import { ProcessedAnalysisResult } from '../../lib/analysis/types';
import { AiTutorResponse, TutorAction } from '../../lib/ai-tutor/types';
import { AiTutorService } from '../../lib/ai-tutor/ai-tutor-service';

type TutorViewProps = {
  analysisResult?: ProcessedAnalysisResult | null;
};

const PRESET_ACTIONS = [
  { action: TutorAction.Explain, label: 'Explain this', icon: Sparkles },
  { action: TutorAction.Grammar, label: 'Grammar Breakdown', icon: BookOpen },
  { action: TutorAction.Nuance, label: 'Nuance & Style', icon: HelpCircle },
  { action: TutorAction.Example, label: 'Another Example', icon: Lightbulb },
  { action: TutorAction.Mistakes, label: 'Common Mistakes', icon: AlertCircle },
];

export function TutorView({ analysisResult }: TutorViewProps) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AiTutorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sourceText = analysisResult?.sourceText || '';

  const handleExecute = async (inputQuestion?: string, actionPreset?: TutorAction) => {
    if (!sourceText) return;

    setLoading(true);
    setError(null);

    try {
      const tutorService = AiTutorService.getInstance();
      const res = await tutorService.explain(sourceText, {
        userQuestion: inputQuestion !== undefined ? inputQuestion : question,
        action: actionPreset,
        context: {
          dictionary: analysisResult?.dictionary,
          kanji: analysisResult?.kanji,
          names: analysisResult?.names,
          grammar: analysisResult?.grammar,
          translation: analysisResult?.translation,
        },
      });

      setResponse(res);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to get AI Tutor response.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault();
      handleExecute();
    }
  };

  if (!sourceText) {
    return (
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center p-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="size-6" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-foreground">AI Tutor Foundation</h3>
        <p className="mt-1 max-w-[240px] text-xs text-muted-foreground">
          Select any Japanese text on the page to analyze grammar, nuances, and natural usage examples.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 p-3">
      {/* Selected Target Header */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs">
        <div className="flex items-center justify-between font-medium text-primary">
          <span className="flex items-center gap-1.5 font-semibold">
            <Sparkles className="size-3.5" /> Selected Target
          </span>
          <span className="text-[10px] text-muted-foreground">Context Included</span>
        </div>
        <p className="mt-1 font-japanese text-sm font-medium text-foreground">{sourceText}</p>
      </div>

      {/* Suggested Action Chips */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-medium text-muted-foreground">Suggested Questions</span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_ACTIONS.map(({ action, label, icon: Icon }) => (
            <button
              key={action}
              type="button"
              disabled={loading}
              onClick={() => {
                setQuestion('');
                handleExecute('', action);
              }}
              className="flex h-7 items-center gap-1.5 rounded-lg border border-border/70 bg-card px-2.5 text-xs font-medium text-foreground transition-all hover:border-primary/50 hover:bg-accent focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 dark:border-border/40"
            >
              <Icon className="size-3 text-primary" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Question Input Box */}
      <div className="flex gap-1.5">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="Ask a question about this Japanese selection..."
          className="flex h-8 flex-1 rounded-lg border border-border/70 bg-card px-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 dark:border-border/40"
        />
        <button
          type="button"
          disabled={loading || (!question.trim() && !response)}
          onClick={() => handleExecute()}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-2xs transition-opacity hover:opacity-90 disabled:opacity-40"
          aria-label="Submit Question"
        >
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
        </button>
      </div>

      {/* Error Alert State */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Response Cards */}
      {response && !loading && (
        <div className="space-y-2.5 pt-1">
          {/* Needs More Context Alert */}
          {response.needsMoreContext ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                <FileQuestion className="size-4" /> Additional Context Required
              </div>
              <p className="mt-1 text-muted-foreground">{response.summary}</p>
            </div>
          ) : (
            <>
              {/* Summary Card */}
              {response.summary && (
                <div className="rounded-xl border border-border/60 bg-card/70 p-3 text-xs shadow-2xs dark:border-border/30 dark:bg-card/40">
                  <h4 className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Sparkles className="size-3.5 text-primary" /> Summary
                  </h4>
                  <p className="mt-1 text-muted-foreground leading-relaxed">{response.summary}</p>
                </div>
              )}

              {/* Grammar Card */}
              {response.grammar && (
                <div className="rounded-xl border border-border/60 bg-card/70 p-3 text-xs shadow-2xs dark:border-border/30 dark:bg-card/40">
                  <h4 className="flex items-center gap-1.5 font-semibold text-foreground">
                    <BookOpen className="size-3.5 text-primary" /> Grammar & Structure
                  </h4>
                  <p className="mt-1 text-muted-foreground leading-relaxed">{response.grammar}</p>
                </div>
              )}

              {/* Nuance Card */}
              {response.nuance && (
                <div className="rounded-xl border border-border/60 bg-card/70 p-3 text-xs shadow-2xs dark:border-border/30 dark:bg-card/40">
                  <h4 className="flex items-center gap-1.5 font-semibold text-foreground">
                    <HelpCircle className="size-3.5 text-primary" /> Nuance & Formality
                  </h4>
                  <p className="mt-1 text-muted-foreground leading-relaxed">{response.nuance}</p>
                </div>
              )}

              {/* Natural Example Card */}
              {response.example && (
                <div className="rounded-xl border border-border/60 bg-card/70 p-3 text-xs shadow-2xs dark:border-border/30 dark:bg-card/40">
                  <h4 className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Lightbulb className="size-3.5 text-primary" /> Natural Example
                  </h4>
                  <div className="mt-1.5 rounded-lg border border-border/40 bg-muted/40 p-2.5">
                    <p className="font-japanese text-xs font-semibold text-foreground">
                      {response.example.japanese}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {response.example.english}
                    </p>
                    {response.example.explanation && (
                      <p className="mt-1 text-[10px] text-muted-foreground/80 italic">
                        {response.example.explanation}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Common Mistakes Card */}
              {response.commonMistake && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs shadow-2xs">
                  <h4 className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                    <AlertCircle className="size-3.5" /> Common Mistake
                  </h4>
                  <p className="mt-1 text-muted-foreground leading-relaxed">{response.commonMistake}</p>
                </div>
              )}

              {/* Learning Tip Card */}
              {response.learningTip && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs shadow-2xs">
                  <h4 className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3.5" /> Study Tip
                  </h4>
                  <p className="mt-1 text-muted-foreground leading-relaxed">{response.learningTip}</p>
                </div>
              )}
            </>
          )}

          {/* Response Footer Metadata */}
          <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground/60">
            <span>Provider: {response.providerName}</span>
            {response.responseTimeMs !== undefined && (
              <span>{response.responseTimeMs}ms</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
