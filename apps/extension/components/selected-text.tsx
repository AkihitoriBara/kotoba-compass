type SelectedTextProps = { text: string };

function SelectedText({ text }: SelectedTextProps) {
  return (
    <section className="flex min-h-64 flex-1 flex-col px-4 py-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Selected text
      </p>
      <div className="mt-2 rounded-xl border bg-card p-4 shadow-sm">
        <p
          className="whitespace-pre-wrap break-words text-lg leading-8"
          lang="ja"
        >
          {text}
        </p>
      </div>
    </section>
  );
}

export { SelectedText };
