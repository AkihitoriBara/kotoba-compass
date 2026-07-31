import { isJapaneseText } from '../lib/is-japanese-text';
import { createContextualActionChip } from './contextual-action-chip';
function startSelectionObserver() {
  const chip = createContextualActionChip();
  function updateSelection() {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() ?? '';
    if (
      !selection ||
      selection.rangeCount === 0 ||
      !isJapaneseText(selectedText)
    ) {
      chip.hide();
      return;
    }
    const selectionRect = selection.getRangeAt(0).getBoundingClientRect();
    if (selectionRect.width === 0 && selectionRect.height === 0) {
      chip.hide();
      return;
    }
    chip.show(selectionRect, selectedText);
  }
  document.addEventListener('selectionchange', updateSelection);
  document.addEventListener(
    'pointerdown',
    (event) => {
      if (
        !(event.target instanceof Element) ||
        !event.target.closest('.kotoba-compass-action-chip')
      )
        chip.hide();
    },
    true,
  );
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') chip.hide();
  });
  window.addEventListener('resize', updateSelection);
  window.addEventListener('scroll', updateSelection, true);
  window.addEventListener('pagehide', chip.hide);
  window.addEventListener('popstate', chip.hide);
  window.addEventListener('hashchange', chip.hide);
}
export { startSelectionObserver };
