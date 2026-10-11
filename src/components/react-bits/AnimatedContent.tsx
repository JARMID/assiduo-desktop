import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface AnimatedContentProps {
  children: React.ReactNode;
  distance?: number;
  direction?: 'vertical' | 'horizontal';
  reverse?: boolean;
  duration?: number;
  ease?: string;
  delay?: number;
  stagger?: number;
  className?: string;
}

export const AnimatedContent: React.FC<AnimatedContentProps> = ({
  children,
  distance = 24,
  direction = 'vertical',
  reverse = false,
  duration = 0.6,
  ease = 'power3.out',
  delay = 0,
  stagger = 0.08,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const targets = containerRef.current.children;
    if (!targets.length) return;

    const offset = reverse ? -distance : distance;
    const fromVars: gsap.TweenVars = {
      opacity: 0,
      duration,
      ease,
      delay,
      stagger: targets.length > 1 ? stagger : 0,
    };

    if (direction === 'vertical') {
      fromVars.y = offset;
    } else {
      fromVars.x = offset;
    }

    const ctx = gsap.context(() => {
      gsap.from(targets, fromVars);
    }, containerRef);

    return () => ctx.revert();
  }, [distance, direction, reverse, duration, ease, delay, stagger]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};
