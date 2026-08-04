import { useState } from 'react';
import { RotateCw } from 'lucide-react';
import { GeneratedCard } from '../../lib/card-generator/types';
import { FrontPreview } from './front-preview';
import { BackPreview } from './back-preview';

type CardPreviewProps = {
  card: GeneratedCard;
};

export function CardPreview({ card }: CardPreviewProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="space-y-2">
      {/* Flip Card Action Button Header */}
      <div className="flex items-center justify-end px-1">
        <button
          type="button"
          onClick={() => setIsFlipped((prev) => !prev)}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-border/70 bg-card px-3 text-xs font-semibold text-foreground shadow-2xs transition-all hover:border-primary/50 hover:bg-accent focus:outline-none focus:ring-1 focus:ring-primary dark:border-border/40"
        >
          <RotateCw className="size-3.5 text-primary transition-transform duration-300" />
          <span>Flip Card</span>
        </button>
      </div>

      {/* Card Preview Container with Smooth Transition */}
      <div className="relative min-h-[220px] rounded-xl border border-border/60 bg-card/70 shadow-2xs transition-all duration-300 dark:border-border/30 dark:bg-card/40">
        {!isFlipped ? (
          <FrontPreview front={card.front} />
        ) : (
          <BackPreview back={card.back} />
        )}
      </div>
    </div>
  );
}
