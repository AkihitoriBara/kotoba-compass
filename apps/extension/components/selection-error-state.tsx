import { AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

type SelectionErrorStateProps = { error: string; onRetry: () => void };

function SelectionErrorState({ error, onRetry }: SelectionErrorStateProps) {
  return (
    <section
      className="flex min-h-64 flex-1 flex-col items-center justify-center px-8 text-center"
      role="alert"
    >
      <div className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <AlertCircle aria-hidden="true" className="size-5" />
      </div>
      <h1 className="mt-4 text-base font-semibold">
        Unable to retrieve selection
      </h1>
      <p className="mt-2 max-w-64 text-sm leading-6 text-muted-foreground">
        {error}
      </p>
      <Button
        className="mt-5"
        onClick={onRetry}
        type="button"
        variant="secondary"
      >
        Try again
      </Button>
    </section>
  );
}

export { SelectionErrorState };
