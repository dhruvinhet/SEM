import React, { useEffect, useRef, useState } from 'react';

interface SpeedometerGaugeProps {
  value: number;
  max: number;
  label: string;
  displayValue: string;
  color?: string;         // stroke color
  glowColor?: string;     // glow shadow color (rgba)
  size?: number;
  strokeWidth?: number;
}

export default function SpeedometerGauge({
  value,
  max,
  label,
  displayValue,
  color = '#ff4433',
  glowColor = 'rgba(255, 68, 51, 0.4)',
  size = 120,
  strokeWidth = 8,
}: SpeedometerGaugeProps) {
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const gaugeRef = useRef<HTMLDivElement>(null);

  const radius = (size - strokeWidth) / 2;
  // 270-degree arc (3/4 circle) — like a real speedometer
  const arcDeg = 270;
  const circumference = (arcDeg / 360) * 2 * Math.PI * radius;
  const percent = max > 0 ? Math.min(value / max, 1) : 0;
  const dashOffset = circumference - circumference * animatedPercent;

  // Rotation: start at 135° (bottom-left) for a 270° arc
  const startAngle = 135;

  useEffect(() => {
    const el = gaugeRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    // Animate from 0 to target
    let raf: number;
    const duration = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedPercent(eased * percent);
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [isVisible, percent]);

  // Tick marks
  const ticks = [];
  const tickCount = 12;
  for (let i = 0; i <= tickCount; i++) {
    const angle = startAngle + (arcDeg / tickCount) * i;
    const rad = (angle * Math.PI) / 180;
    const inner = radius - strokeWidth - 4;
    const outer = radius - strokeWidth + 1;
    const cx = size / 2;
    const cy = size / 2;
    ticks.push(
      <line
        key={i}
        x1={cx + inner * Math.cos(rad)}
        y1={cy + inner * Math.sin(rad)}
        x2={cx + outer * Math.cos(rad)}
        y2={cy + outer * Math.sin(rad)}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={i % 3 === 0 ? 2 : 1}
        strokeLinecap="round"
      />
    );
  }

  return (
    <div ref={gaugeRef} className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: `rotate(${startAngle}deg)`, filter: `drop-shadow(0 0 8px ${glowColor})` }}
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${2 * Math.PI * radius - circumference}`}
            strokeLinecap="round"
          />
          {/* Active arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${2 * Math.PI * radius - circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />
        </svg>
        {/* Tick marks overlay */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0"
        >
          {ticks}
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-xl font-bold text-white leading-none"
            style={{ animation: isVisible ? 'countUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards' : 'none' }}
          >
            {displayValue}
          </span>
        </div>
      </div>
      <span className="text-xs text-dark-400 mt-2 font-medium">{label}</span>
    </div>
  );
}
