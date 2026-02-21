import React, { useCallback, useRef } from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
  size?: number;       // px radius of the glow
  intensity?: number;  // 0-1
  color?: string;      // e.g. '255, 68, 51'
}

/**
 * Wraps a section and adds a radial spotlight that follows the mouse.
 * Uses direct DOM manipulation — zero React re-renders.
 */
export default function MouseSpotlight({
  children,
  className = '',
  size = 350,
  intensity = 0.08,
  color = '255, 68, 51',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || !overlayRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    overlayRef.current.style.background = `radial-gradient(${size}px circle at ${x}px ${y}px, rgba(${color}, ${intensity}), transparent 60%)`;
  }, [size, color, intensity]);

  const handleEnter = useCallback(() => {
    if (overlayRef.current) overlayRef.current.style.opacity = '1';
  }, []);

  const handleLeave = useCallback(() => {
    if (overlayRef.current) overlayRef.current.style.opacity = '0';
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* Spotlight overlay */}
      <div
        ref={overlayRef}
        className="pointer-events-none absolute inset-0 z-[1] transition-opacity duration-500"
        style={{ opacity: 0 }}
      />
      <div className="relative z-[2]">{children}</div>
    </div>
  );
}
