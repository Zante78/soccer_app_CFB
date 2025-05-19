/**
 * Hook für Keyboard Navigation
 * Ermöglicht einfache Tastatursteuerung in Listen und Menüs
 */
import { useEffect, useRef } from 'react';

interface KeyboardNavigationOptions {
  /** Selektoren für fokussierbare Elemente */
  selectors?: string[];
  /** Callback wenn ein Element ausgewählt wird */
  onSelect?: (element: HTMLElement) => void;
  /** Aktiviert Loop-Navigation (von letztem zu erstem Element) */
  loop?: boolean;
}

export function useKeyboardNavigation({
  selectors = ['button', 'a', '[role="button"]', '[tabindex="0"]'],
  onSelect,
  loop = true
}: KeyboardNavigationOptions = {}) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const elements = Array.from(
        container.querySelectorAll<HTMLElement>(selectors.join(','))
      ).filter(el => !el.hasAttribute('disabled'));

      const currentIndex = elements.findIndex(el => el === document.activeElement);

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          const nextIndex = currentIndex + 1;
          const nextElement = elements[loop ? nextIndex % elements.length : nextIndex];
          if (nextElement) nextElement.focus();
          break;

        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          const prevIndex = currentIndex - 1;
          const prevElement = elements[loop ? (prevIndex + elements.length) % elements.length : prevIndex];
          if (prevElement) prevElement.focus();
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          const current = document.activeElement as HTMLElement;
          if (current && elements.includes(current)) {
            onSelect?.(current);
            current.click();
          }
          break;
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [selectors, onSelect, loop]);

  return containerRef;
}