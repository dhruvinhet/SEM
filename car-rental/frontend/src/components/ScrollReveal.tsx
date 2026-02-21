import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'left' | 'right' | 'scale';
  delay?: number;
  once?: boolean;
}

export default function ScrollReveal({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  once = true,
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal({ once });

  const dirClass = {
    up: 'reveal',
    left: 'reveal-left',
    right: 'reveal-right',
    scale: 'reveal-scale',
  }[direction];

  return (
    <div
      ref={ref}
      className={`${dirClass} ${isVisible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
