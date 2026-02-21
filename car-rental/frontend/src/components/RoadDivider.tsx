import React from 'react';

interface RoadDividerProps {
  className?: string;
  variant?: 'highway' | 'tracks';
}

export default function RoadDivider({ className = '', variant = 'highway' }: RoadDividerProps) {
  if (variant === 'tracks') {
    return <div className={`road-tracks ${className}`} />;
  }

  return (
    <div className={`road-divider ${className}`}>
      {/* Animated dashed center line is handled by CSS */}
    </div>
  );
}
