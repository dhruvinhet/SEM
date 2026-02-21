import React, { useRef, useEffect, useState, useCallback } from 'react';

interface Tab {
  key: string;
  label: string;
  icon?: React.ElementType;
}

interface AnimatedTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  className?: string;
}

export default function AnimatedTabs({ tabs, activeTab, onTabChange, className = '' }: AnimatedTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });

  const updatePill = useCallback(() => {
    const btn = tabRefs.current.get(activeTab);
    const container = containerRef.current;
    if (!btn || !container) return;

    const containerRect = container.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    setPillStyle({
      left: btnRect.left - containerRect.left,
      width: btnRect.width,
    });
  }, [activeTab]);

  useEffect(() => {
    updatePill();
    window.addEventListener('resize', updatePill);
    return () => window.removeEventListener('resize', updatePill);
  }, [updatePill]);

  return (
    <div
      ref={containerRef}
      className={`tab-pill-container flex gap-1 overflow-x-auto border-b border-white/[0.06] ${className}`}
    >
      {/* Animated pill */}
      <div
        className="tab-pill"
        style={{
          left: pillStyle.left,
          width: pillStyle.width,
        }}
      />

      {tabs.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          ref={(el) => {
            if (el) tabRefs.current.set(key, el);
          }}
          onClick={() => onTabChange(key)}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
            activeTab === key
              ? 'text-primary-400 border-transparent'
              : 'text-dark-400 border-transparent hover:text-dark-200'
          }`}
        >
          {Icon && <Icon className="w-4 h-4" />}
          {label}
        </button>
      ))}
    </div>
  );
}
