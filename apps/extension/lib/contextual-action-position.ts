type ChipPosition = { left: number; top: number };
const viewportMargin = 12;
const selectionGap = 8;
function getChipPosition(
  selectionRect: DOMRect,
  chipRect: Pick<DOMRect, 'height' | 'width'>,
): ChipPosition {
  const maxLeft = window.innerWidth - chipRect.width - viewportMargin;
  const left = Math.min(
    Math.max(viewportMargin, selectionRect.left),
    Math.max(viewportMargin, maxLeft),
  );
  const preferredTop = selectionRect.bottom + selectionGap;
  const top =
    preferredTop + chipRect.height + viewportMargin <= window.innerHeight
      ? preferredTop
      : Math.max(
          viewportMargin,
          selectionRect.top - chipRect.height - selectionGap,
        );
  return { left, top };
}
export { getChipPosition };
