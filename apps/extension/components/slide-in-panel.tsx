import { useEffect, useState } from 'react';
import { CompanionPanel } from './companion-panel';

type SlideInPanelProps = {
  selectedText: string;
  onClose: () => void;
};

export function SlideInPanel({ selectedText, onClose }: SlideInPanelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Force a small delay to trigger the transition after initial mount
    const raf = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = () => {
    setMounted(false);
    setTimeout(onClose, 300); // Allow animation to finish before unmounting
  };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handleClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className={`fixed top-0 right-0 h-screen w-[420px] bg-background text-foreground border-l border-border shadow-2xl z-[2147483646] flex flex-col transition-transform duration-300 ease-in-out ${
        mounted ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex-1 min-h-0">
        <CompanionPanel initialSelectedText={selectedText} onClose={handleClose} />
      </div>
    </div>
  );
}
