import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface Props {
  items: FAQItem[];
  className?: string;
}

function AccordionItem({ question, answer, isOpen, onToggle }: FAQItem & { isOpen: boolean; onToggle: () => void }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div className={`border border-white/[0.06] rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'bg-dark-800/60 border-white/[0.1]' : 'bg-dark-900/40 hover:bg-dark-800/30'}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left group"
        aria-expanded={isOpen}
      >
        <span className={`font-semibold text-sm transition-colors ${isOpen ? 'text-primary-400' : 'text-white group-hover:text-primary-300'}`}>
          {question}
        </span>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-300 flex-shrink-0 ml-4 ${isOpen ? 'rotate-180 text-primary-400' : 'text-dark-400'}`}
        />
      </button>
      <div
        style={{ height: `${height}px` }}
        className="overflow-hidden transition-[height] duration-300 ease-out"
      >
        <div ref={contentRef} className="px-5 pb-5 text-sm text-dark-300 leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
}

/**
 * Animated FAQ accordion — smooth expand/collapse with rotating chevrons.
 */
export default function FAQAccordion({ items, className = '' }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // first one open by default

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, idx) => (
        <AccordionItem
          key={idx}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === idx}
          onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
        />
      ))}
    </div>
  );
}
