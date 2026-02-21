import { useEffect } from 'react';

/**
 * Attaches a material-design-style ripple effect to all button/a clicks.
 * Drop into any top-level component.
 */
export function useRippleEffect() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button, a.btn-primary, a.btn-secondary, [role="button"]') as HTMLElement | null;
      if (!button) return;

      // Don't ripple on tiny elements
      const rect = button.getBoundingClientRect();
      if (rect.width < 30 || rect.height < 30) return;

      // Ensure relative positioning for the ripple
      const computed = getComputedStyle(button);
      if (computed.position === 'static') {
        button.style.position = 'relative';
      }
      button.style.overflow = 'hidden';

      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      button.appendChild(ripple);

      ripple.addEventListener('animationend', () => {
        ripple.remove();
      });
    };

    document.addEventListener('click', handleClick, { passive: true });
    return () => document.removeEventListener('click', handleClick);
  }, []);
}
