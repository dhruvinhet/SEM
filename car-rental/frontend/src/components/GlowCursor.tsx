import React, { useEffect, useRef } from 'react';

/**
 * Custom glowing cursor — a neon dot + trailing afterglow circle.
 * Pure DOM manipulation — zero React state / zero re-renders.
 */
export default function GlowCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const glowPos = useRef({ x: -100, y: -100 });
  const raf = useRef<number>(0);

  useEffect(() => {
    if ('ontouchstart' in window) return;

    const dot = dotRef.current;
    const glow = glowRef.current;
    if (!dot || !glow) return;

    const onMove = (e: MouseEvent) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
      dot.style.opacity = '1';
      glow.style.opacity = '1';
      dot.style.transform = `translate(${e.clientX - 5}px, ${e.clientY - 5}px)`;
    };

    const onDown = () => {
      dot.style.width = dot.style.height = '14px';
      glow.style.width = glow.style.height = '50px';
    };
    const onUp = () => {
      dot.style.width = dot.style.height = '10px';
      glow.style.width = glow.style.height = '40px';
    };
    const hide = () => { dot.style.opacity = '0'; glow.style.opacity = '0'; };
    const show = () => { dot.style.opacity = '1'; glow.style.opacity = '1'; };

    const animate = () => {
      glowPos.current.x += (pos.current.x - glowPos.current.x) * 0.12;
      glowPos.current.y += (pos.current.y - glowPos.current.y) * 0.12;
      glow.style.transform = `translate(${glowPos.current.x - 20}px, ${glowPos.current.y - 20}px)`;
      raf.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.addEventListener('mouseleave', hide);
    document.addEventListener('mouseenter', show);
    raf.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', hide);
      document.removeEventListener('mouseenter', show);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  if (typeof window !== 'undefined' && 'ontouchstart' in window) return null;

  return (
    <>
      <div ref={dotRef} className="glow-cursor-dot" style={{ opacity: 0 }} />
      <div ref={glowRef} className="glow-cursor-ring" style={{ opacity: 0 }} />
    </>
  );
}
