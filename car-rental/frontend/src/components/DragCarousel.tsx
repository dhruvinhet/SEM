import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

/**
 * Drag-to-scroll horizontal carousel with mouse/touch support
 * and optional arrow navigation.
 */
export default function DragCarousel({ children, className = '', title, subtitle }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft: sl, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(sl > 5);
    setCanScrollRight(sl < scrollWidth - clientWidth - 5);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const onMouseUp = () => setIsDragging(false);

  const scrollTo = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <div className={className}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="flex items-end justify-between mb-6">
          <div>
            {subtitle && <span className="section-label mb-3 inline-block">{subtitle}</span>}
            {title && <h2 className="text-white">{title}</h2>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scrollTo('left')}
              disabled={!canScrollLeft}
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/5 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollTo('right')}
              disabled={!canScrollRight}
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/5 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Scrollable track */}
      <div className="relative group">
        {/* Gradient fade edges */}
        <div className={`absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-dark-950 to-transparent z-10 pointer-events-none transition-opacity ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-dark-950 to-transparent z-10 pointer-events-none transition-opacity ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} />

        <div
          ref={scrollRef}
          className={`flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
