import { useState, useEffect, useRef } from 'react';

interface TypewriterOptions {
  speed?: number;        // ms per character
  startDelay?: number;   // ms before typing starts
  cursor?: boolean;      // show blinking cursor
}

/**
 * Typewriter effect hook — types text character-by-character.
 * Returns { displayText, isTyping, cursorVisible }
 */
export function useTypewriter(
  fullText: string,
  { speed = 50, startDelay = 600, cursor = true }: TypewriterOptions = {}
) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayText('');
    setIsTyping(false);

    const startTimer = setTimeout(() => {
      setIsTyping(true);
    }, startDelay);

    return () => clearTimeout(startTimer);
  }, [fullText, startDelay]);

  useEffect(() => {
    if (!isTyping) return;

    if (indexRef.current >= fullText.length) {
      setIsTyping(false);
      return;
    }

    const timer = setTimeout(() => {
      indexRef.current += 1;
      setDisplayText(fullText.slice(0, indexRef.current));
    }, speed + Math.random() * 30); // slight randomness for human feel

    return () => clearTimeout(timer);
  }, [isTyping, displayText, fullText, speed]);

  // Blinking cursor
  useEffect(() => {
    if (!cursor) return;
    const interval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(interval);
  }, [cursor]);

  return { displayText, isTyping, cursorVisible: cursor ? cursorVisible : false };
}
