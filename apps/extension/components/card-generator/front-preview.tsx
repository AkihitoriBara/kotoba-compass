import { CardFront } from '../../lib/card-generator/types';

type FrontPreviewProps = {
  front: CardFront;
};

export function FrontPreview({ front }: FrontPreviewProps) {
  return (
    <div className="flex min-h-[190px] flex-col items-center justify-center p-6 text-center space-y-2">
      <span className="text-[11px] font-medium tracking-wide text-muted-foreground/75">
        Front Preview
      </span>

      {/* Furigana Display */}
      {front.showFurigana && front.furigana ? (
        <div className="text-xs font-medium text-primary">
          {front.furigana}
        </div>
      ) : (
        <div className="h-4" /> // Spacing balance when furigana off
      )}

      {/* Primary Japanese Text */}
      <h2 className="font-japanese text-3xl font-bold tracking-tight text-foreground">
        {front.japanese}
      </h2>
    </div>
  );
}
