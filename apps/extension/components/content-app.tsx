import { useEffect, useState, useRef } from 'react';
import { isJapaneseText } from '../lib/is-japanese-text';
import { getChipPosition } from '../lib/contextual-action-position';
import { ThemeProvider, useTheme } from './theme-provider';
import { SlideInPanel } from './slide-in-panel';

function ContentApp() {
  return (
    <ThemeProvider disableDocumentToggle={true}>
      <ContentRoot />
    </ThemeProvider>
  );
}

function ContentRoot() {
  const { resolvedTheme } = useTheme();
  const [selectedText, setSelectedText] = useState('');
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [chipPosition, setChipPosition] = useState<{ left: number; top: number } | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isChipVisible, setIsChipVisible] = useState(false);

  const chipRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const timeoutIdRef = useRef<number | null>(null);

  // 1. Observe text selection changes on the host page
  useEffect(() => {
    function handleSelectionChange() {
      // Do not display the action chip if the companion panel is already open
      if (isPanelOpen) return;

      const selection = window.getSelection();
      const text = selection?.toString().trim() ?? '';

      if (!selection || selection.rangeCount === 0 || !isJapaneseText(text)) {
        setIsChipVisible(false);
        setSelectionRect(null);
        setChipPosition(null);
        return;
      }

      const rect = selection.getRangeAt(0).getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        setIsChipVisible(false);
        setSelectionRect(null);
        setChipPosition(null);
        return;
      }

      setSelectedText(text);
      setSelectionRect(rect);
      setIsChipVisible(true);

      // Auto-hide the contextual chip after 8 seconds of inactivity
      if (timeoutIdRef.current) window.clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = window.setTimeout(() => {
        setIsChipVisible(false);
      }, 8000);
    }

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      if (timeoutIdRef.current) window.clearTimeout(timeoutIdRef.current);
    };
  }, [isPanelOpen]);

  // 2. Position the action chip near the selection coordinates
  useEffect(() => {
    if (isChipVisible && selectionRect && chipRef.current) {
      const chipRect = chipRef.current.getBoundingClientRect();
      const pos = getChipPosition(selectionRect, chipRect);
      setChipPosition(pos);
    }
  }, [isChipVisible, selectionRect]);

  // 3. Handle Esc key and outside clicks to close the chip/panel
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const path = event.composedPath();

      // Check if clicked inside shadow DOM elements (chip or panel)
      const host = document.querySelector('kotoba-compass-shadow-host');
      const clickedInside = host && path.includes(host);

      if (!clickedInside) {
        // Clicked outside our shadow DOM entirely
        setIsChipVisible(false);
        // Do not force-close panel here if we want animation, but since we handle it synchronously:
        setIsPanelOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsChipVisible(false);
        // Direct close of panel without transition (fallback for global escape)
        setIsPanelOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleChipClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsChipVisible(false);
    setIsPanelOpen(true);
  };

  const handlePanelClose = () => {
    setIsPanelOpen(false);
  };

  return (
    <div className={resolvedTheme === 'dark' ? 'dark' : ''}>
      {/* Contextual Action Chip */}
      {isChipVisible && (
        <button
          ref={chipRef}
          onClick={handleChipClick}
          style={{
            position: 'fixed',
            left: chipPosition?.left ?? 0,
            top: chipPosition?.top ?? 0,
            visibility: chipPosition ? 'visible' : 'hidden',
            opacity: chipPosition ? 1 : 0,
            transform: chipPosition ? 'scale(1)' : 'scale(0.95)',
          }}
          className="border border-zinc-700 rounded-full bg-zinc-800 text-zinc-100 hover:bg-zinc-700 shadow-md cursor-pointer font-medium text-xs px-3.5 py-2 transition-[opacity,transform] duration-[120ms] ease-out z-[2147483647] pointer-events-auto"
          type="button"
          aria-label="Open Kotoba Compass for selected text"
        >
          Kotoba Compass
        </button>
      )}

      {/* Slide-In Companion Panel */}
      {isPanelOpen && (
        <SlideInPanel selectedText={selectedText} onClose={handlePanelClose} />
      )}
    </div>
  );
}

export default ContentApp;
export { ContentApp };
