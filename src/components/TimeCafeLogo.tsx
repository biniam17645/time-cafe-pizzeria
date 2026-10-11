import React from 'react';

interface TimeCafeLogoProps {
  className?: string;
  size?: number;
}

export const TimeCafeLogo: React.FC<TimeCafeLogoProps> = ({ className = '', size = 56 }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-full shrink-0 select-none overflow-hidden shadow-lg ${className}`}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Circular Dark Coffee Background & Gold Ring */}
        <circle cx="100" cy="100" r="98" fill="#2b1408" stroke="#f59e0b" strokeWidth="4" />
        <circle cx="100" cy="100" r="93" fill="#241006" />

        {/* Fork & Knife Clock Hands */}
        <g stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="#ffffff">
          {/* Clock Pivot Center */}
          <circle cx="104" cy="56" r="3" fill="#ffffff" />

          {/* Fork Hand (pointing up-left to 10 o'clock) */}
          <path d="M104 56 L72 16" strokeWidth="4" />
          <path d="M72 16 L68 11 M72 16 L72 10 M72 16 L76 11 M68 11 L68 6 M72 10 L72 5 M76 11 L76 6" strokeWidth="2.5" />

          {/* Knife Hand (pointing up-right to 2 o'clock) */}
          <path d="M104 56 L138 28" strokeWidth="4" />
          <path d="M138 28 C144 22, 142 16, 136 22 Z" fill="#ffffff" />
        </g>

        {/* Coffee Cup Body & Handle */}
        <g fill="#ffffff">
          {/* Cup Handle */}
          <path d="M52 82 C38 82 38 106 52 106" fill="none" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" />

          {/* Cup Outer Bowl */}
          <path d="M54 75 C60 114 136 122 152 75 Z" />

          {/* Cup Saucer Base */}
          <path d="M60 120 C85 130 125 130 148 120 C136 126 74 126 60 120 Z" />

          {/* Latte Top Oval Rim */}
          <ellipse cx="104" cy="74" rx="46" ry="14" fill="#ffffff" />
          <ellipse cx="104" cy="74" rx="42" ry="11" fill="#451e0f" />

          {/* Latte Art Swirl */}
          <path
            d="M84 74 C86 70 120 70 122 74 C120 77 92 78 94 74 C96 72 110 72 111 74"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Coffee Beans Next to Cup */}
          <g fill="#f59e0b" stroke="#241006" strokeWidth="1.5">
            <ellipse cx="128" cy="88" rx="8" ry="11" transform="rotate(25 128 88)" fill="#ffffff" />
            <path d="M125 80 Q129 88 125 96" stroke="#241006" strokeWidth="1.5" fill="none" />

            <ellipse cx="140" cy="94" rx="7" ry="9" transform="rotate(65 140 94)" fill="#ffffff" />
            <path d="M135 93 Q142 94 147 92" stroke="#241006" strokeWidth="1.5" fill="none" />
          </g>
        </g>

        {/* Text: Time */}
        <text
          x="100"
          y="146"
          textAnchor="middle"
          fill="#f59e0b"
          fontSize="30"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="4"
        >
          Time
        </text>

        {/* Text: Cafe & Pizzeria */}
        <text
          x="100"
          y="166"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="15"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="1"
        >
          Cafe &amp; Pizzeria
        </text>

        {/* Text: Burger, Pizza, Cake */}
        <text
          x="100"
          y="183"
          textAnchor="middle"
          fill="#f97316"
          fontSize="11"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="0.8"
        >
          Burger, Pizza, Cake
        </text>
      </svg>
    </div>
  );
};
