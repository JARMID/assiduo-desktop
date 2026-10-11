import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface UseGsapStaggerOptions {
  selector?: string;
  y?: number;
  duration?: number;
  stagger?: number;
  delay?: number;
}

export function useGsapStagger<T extends HTMLElement = HTMLDivElement>(
  options: UseGsapStaggerOptions = {},
  triggerKey?: any
) {
  const containerRef = useRef<T>(null);
  const {
    selector = '.gsap-card',
    y = 20,
    duration = 0.5,
    stagger = 0.06,
    delay = 0.05,
  } = options;

  useEffect(() => {
    if (!containerRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        selector,
        {
          opacity: 0,
          y,
          scale: 0.98,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration,
          stagger,
          delay,
          ease: 'power2.out',
          clearProps: 'transform',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [selector, y, duration, stagger, delay, triggerKey]);

  return containerRef;
}
