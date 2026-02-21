import React from 'react';

interface AnimatedCarProps {
  className?: string;
}

export default function AnimatedCar({ className = '' }: AnimatedCarProps) {
  return (
    <div className={`relative ${className}`} style={{ animation: 'carBounce 3s ease-in-out infinite' }}>
      <svg
        width="340"
        height="160"
        viewBox="0 0 340 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Headlight glow */}
        <defs>
          <radialGradient id="headlightGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#ffe066" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ffe066" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="taillightGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#ff4433" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ff4433" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="340" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff4433" />
            <stop offset="50%" stopColor="#ff6b5b" />
            <stop offset="100%" stopColor="#ff4433" />
          </linearGradient>
          <linearGradient id="windowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0d0e14" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="roofGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#cc3322" />
            <stop offset="100%" stopColor="#ff4433" />
          </linearGradient>
        </defs>

        {/* Shadow under car */}
        <ellipse cx="170" cy="148" rx="120" ry="8" fill="rgba(0,0,0,0.3)" />

        {/* Car body - lower */}
        <path
          d="M30 100 Q30 85 50 80 L290 80 Q310 85 310 100 L310 115 Q310 120 305 120 L35 120 Q30 120 30 115 Z"
          fill="url(#bodyGrad)"
        />
        {/* Car body highlight */}
        <path
          d="M50 82 L290 82 L280 88 L60 88 Z"
          fill="rgba(255,255,255,0.15)"
        />

        {/* Roof / cabin */}
        <path
          d="M90 80 L120 42 Q125 36 135 36 L215 36 Q225 36 228 42 L255 80 Z"
          fill="url(#roofGrad)"
        />

        {/* Windows */}
        <path
          d="M100 78 L125 48 Q128 43 134 43 L168 43 L168 78 Z"
          fill="url(#windowGrad)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="0.5"
        />
        <path
          d="M175 43 L216 43 Q222 43 225 48 L248 78 L175 78 Z"
          fill="url(#windowGrad)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="0.5"
        />

        {/* Window divider */}
        <line x1="170" y1="43" x2="170" y2="78" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />

        {/* Door handle */}
        <rect x="185" y="90" width="18" height="3" rx="1.5" fill="rgba(255,255,255,0.25)" />

        {/* Front bumper detail */}
        <path d="M35 105 L55 105 L55 112 L35 112 Z" fill="rgba(255,255,255,0.1)" rx="2" />
        
        {/* Rear bumper detail */}
        <path d="M285 105 L305 105 L305 112 L285 112 Z" fill="rgba(255,255,255,0.1)" rx="2" />

        {/* Headlight beams */}
        <circle cx="30" cy="100" r="16" fill="url(#headlightGlow)">
          <animate attributeName="r" values="14;18;14" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" repeatCount="indefinite" />
        </circle>
        
        {/* Headlight */}
        <rect x="22" y="93" width="12" height="14" rx="3" fill="#ffe066" opacity="0.9">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
        </rect>

        {/* Taillight */}
        <rect x="306" y="95" width="8" height="10" rx="2" fill="#ff4433" opacity="0.8" />
        <circle cx="314" cy="100" r="12" fill="url(#taillightGlow)">
          <animate attributeName="r" values="10;14;10" dur="1.8s" repeatCount="indefinite" />
        </circle>

        {/* Front wheel */}
        <g>
          <circle cx="100" cy="125" r="22" fill="#1a1b24" stroke="#333" strokeWidth="3" />
          <circle cx="100" cy="125" r="14" fill="#2a2b34" />
          <circle cx="100" cy="125" r="4" fill="#555" />
          {/* Spokes */}
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <line
              key={angle}
              x1={100 + 6 * Math.cos((angle * Math.PI) / 180)}
              y1={125 + 6 * Math.sin((angle * Math.PI) / 180)}
              x2={100 + 13 * Math.cos((angle * Math.PI) / 180)}
              y2={125 + 13 * Math.sin((angle * Math.PI) / 180)}
              stroke="#666"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`0 100 125`}
                to={`360 100 125`}
                dur="1.5s"
                repeatCount="indefinite"
              />
            </line>
          ))}
          {/* Rim highlight */}
          <circle cx="100" cy="125" r="14" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        </g>

        {/* Rear wheel */}
        <g>
          <circle cx="250" cy="125" r="22" fill="#1a1b24" stroke="#333" strokeWidth="3" />
          <circle cx="250" cy="125" r="14" fill="#2a2b34" />
          <circle cx="250" cy="125" r="4" fill="#555" />
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <line
              key={angle}
              x1={250 + 6 * Math.cos((angle * Math.PI) / 180)}
              y1={125 + 6 * Math.sin((angle * Math.PI) / 180)}
              x2={250 + 13 * Math.cos((angle * Math.PI) / 180)}
              y2={125 + 13 * Math.sin((angle * Math.PI) / 180)}
              stroke="#666"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`0 250 125`}
                to={`360 250 125`}
                dur="1.5s"
                repeatCount="indefinite"
              />
            </line>
          ))}
          <circle cx="250" cy="125" r="14" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        </g>

        {/* Ground line */}
        <line x1="60" y1="147" x2="280" y2="147" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

        {/* Speed lines */}
        <line x1="320" y1="90" x2="338" y2="90" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round">
          <animate attributeName="x2" values="335;342;335" dur="0.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.1;0.3;0.1" dur="0.8s" repeatCount="indefinite" />
        </line>
        <line x1="318" y1="100" x2="340" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeLinecap="round">
          <animate attributeName="x2" values="336;344;336" dur="1s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.05;0.2;0.05" dur="1s" repeatCount="indefinite" />
        </line>
        <line x1="322" y1="110" x2="336" y2="110" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeLinecap="round">
          <animate attributeName="x2" values="334;340;334" dur="0.9s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.08;0.25;0.08" dur="0.9s" repeatCount="indefinite" />
        </line>
      </svg>
    </div>
  );
}
