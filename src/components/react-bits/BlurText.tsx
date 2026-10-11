import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  onAnimationComplete?: () => void;
}

export const BlurText: React.FC<BlurTextProps> = ({
  text,
  delay = 0,
  className = '',
  animateBy = 'words',
  direction = 'top',
  onAnimationComplete,
}) => {
  const containerRef = useRef<HTMLParagraphElement>(null);

  const elements = animateBy === 'words' ? text.split(' ') : text.split('');

  useEffect(() => {
    if (!containerRef.current) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (onAnimationComplete) onAnimationComplete();
      return;
    }

    const items = containerRef.current.querySelectorAll('.blur-item');
    if (!items.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        {
          filter: 'blur(10px)',
          opacity: 0,
          y: direction === 'top' ? -12 : 12,
        },
        {
          filter: 'blur(0px)',
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: animateBy === 'words' ? 0.05 : 0.02,
          ease: 'power3.out',
          delay: delay / 1000,
          onComplete: onAnimationComplete,
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [text, delay, animateBy, direction, onAnimationComplete]);

  return (
    <p ref={containerRef} className={`inline-flex flex-wrap ${className}`}>
      {elements.map((el, i) => (
        <span
          key={`${el}-${i}`}
          className="blur-item inline-block will-change-[transform,filter,opacity]"
          style={{ marginRight: animateBy === 'words' ? '0.28em' : '0' }}
        >
          {el === ' ' ? '\u00A0' : el}
        </span>
      ))}
    </p>
  );
};
