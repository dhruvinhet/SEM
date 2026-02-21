import { useRef, useCallback } from 'react';

interface MagneticOptions {
  strength?: number;  // 0-1, how much the element follows cursor
  ease?: number;      // transition speed ms
}

export function useMagnetic<T extends HTMLElement = HTMLButtonElement>(
  options: MagneticOptions = {}
) {
  const { strength = 0.3, ease = 300 } = options;
  const ref = useRef<T>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    },
    [strength]
  );

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'translate(0px, 0px)';
  }, []);

  const magneticProps = {
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    style: {
      transition: `transform ${ease}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
      willChange: 'transform' as const,
    },
  };

  return { ref, magneticProps };
}
