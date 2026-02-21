import React, { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

/**
 * Wraps page content in a smooth fade+slide transition on route change.
 */
export default function PageTransition({ children }: Props) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitioning, setTransitioning] = useState(false);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevPath.current) {
      setTransitioning(true);
      // Wait for exit animation
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        prevPath.current = location.pathname;
        // Force reflow then enter
        requestAnimationFrame(() => {
          setTransitioning(false);
          window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
        });
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setDisplayChildren(children);
    }
  }, [children, location.pathname]);

  return (
    <div
      className={`page-transition ${transitioning ? 'page-exit' : 'page-enter-active'}`}
    >
      {displayChildren}
    </div>
  );
}
