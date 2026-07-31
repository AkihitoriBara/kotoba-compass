import { createOpenCompanionMessage } from '../lib/contextual-action-messages';
import { getChipPosition } from '../lib/contextual-action-position';
type ContextualActionChip = {
  hide: () => void;
  show: (selectionRect: DOMRect, selectedText: string) => void;
};
const chipTimeoutMs = 8_000;
function createContextualActionChip(): ContextualActionChip {
  const chip = document.createElement('button');
  chip.type = 'button';
  chip.textContent = 'Kotoba Compass';
  chip.setAttribute('aria-label', 'Open Kotoba Compass for selected text');
  chip.className = 'kotoba-compass-action-chip';
  chip.hidden = true;
  const style = document.createElement('style');
  style.textContent = `.kotoba-compass-action-chip{position:fixed;z-index:2147483647;border:1px solid #3f3f46;border-radius:999px;background:#27272a;color:#fafafa;box-shadow:0 4px 14px rgba(0,0,0,.16);cursor:pointer;font:500 13px/1.2 system-ui,-apple-system,"Segoe UI",sans-serif;padding:8px 12px;opacity:0;transform:translateY(-4px);transition:opacity 140ms ease,transform 140ms ease}.kotoba-compass-action-chip[data-visible="true"]{opacity:1;transform:translateY(0)}.kotoba-compass-action-chip:focus-visible{outline:2px solid #2563eb;outline-offset:2px}.kotoba-compass-action-chip:hover{background:#3f3f46}@media (prefers-reduced-motion:reduce){.kotoba-compass-action-chip{transition:none}}`;
  document.documentElement.append(style, chip);
  let selectedText = '';
  let timeoutId: number | undefined;
  function hide() {
    window.clearTimeout(timeoutId);
    chip.dataset.visible = 'false';
    window.setTimeout(() => {
      if (chip.dataset.visible === 'false') chip.hidden = true;
    }, 140);
  }
  function show(selectionRect: DOMRect, nextSelectedText: string) {
    selectedText = nextSelectedText;
    chip.hidden = false;
    const position = getChipPosition(
      selectionRect,
      chip.getBoundingClientRect(),
    );
    chip.style.left = `${position.left}px`;
    chip.style.top = `${position.top}px`;
    requestAnimationFrame(() => {
      chip.dataset.visible = 'true';
    });
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(hide, chipTimeoutMs);
  }
  chip.addEventListener('pointerdown', (event) => event.preventDefault());
  chip.addEventListener('click', () => {
    void browser.runtime.sendMessage(createOpenCompanionMessage(selectedText));
    hide();
  });
  return { hide, show };
}
export { createContextualActionChip };
