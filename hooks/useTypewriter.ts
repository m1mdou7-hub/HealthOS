import { useState, useEffect, useRef } from 'react';

export function useTypewriter(text: string | null, speed: number = 10) {
  const [displayedText, setDisplayedText] = useState('');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const textRef = useRef(text || '');
  const currentIndex = useRef(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      textRef.current = '';
      currentIndex.current = 0;
      return;
    }

    if (prefersReducedMotion) {
      setDisplayedText(text);
      return;
    }

    // If text was replaced entirely (not just appended)
    if (!text.startsWith(textRef.current) && textRef.current !== '') {
      setDisplayedText('');
      currentIndex.current = 0;
    }

    textRef.current = text;

    let rafId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      if (currentIndex.current < textRef.current.length) {
        if (time - lastTime >= speed) {
          // Calculate how many characters we should advance based on elapsed time
          // to ensure we keep up if there's a lag or a large chunk arrives
          const elapsed = time - lastTime;
          const charsToAdvance = Math.max(1, Math.floor(elapsed / speed));

          currentIndex.current = Math.min(textRef.current.length, currentIndex.current + charsToAdvance);
          setDisplayedText(textRef.current.substring(0, currentIndex.current));
          lastTime = time;
        }
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [text, speed, prefersReducedMotion]);

  return displayedText;
}
