import type { ReactNode } from 'react';

type EmptyStateProps = {
  description: string;
  icon: ReactNode;
  title: string;
};

function EmptyState({ description, icon, title }: EmptyStateProps) {
  return (
    <section className="flex min-h-64 flex-1 flex-col items-center justify-center px-8 text-center">
      <div className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        {icon}
      </div>
      <h1 className="mt-4 text-base font-semibold">{title}</h1>
      <p className="mt-2 max-w-64 text-sm leading-6 text-muted-foreground">{description}</p>
    </section>
  );
}

export { EmptyState };