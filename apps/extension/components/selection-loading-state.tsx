function SelectionLoadingState() {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className="flex min-h-64 flex-1 flex-col justify-center px-8"
    >
      <p className="sr-only">Retrieving selected text.</p>
      <div className="mx-auto w-full max-w-64 space-y-3">
        <div className="h-5 w-28 animate-pulse rounded bg-muted" />
        <div className="h-20 animate-pulse rounded-xl bg-muted" />
      </div>
    </section>
  );
}

export { SelectionLoadingState };
