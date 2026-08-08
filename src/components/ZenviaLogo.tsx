import React from "react";

interface ZenviaLogoProps {
  variant?: "gold" | "dark" | "white";
  className?: string;
  showTagline?: boolean;
  taglineText?: string;
  height?: number | string;
}

export const ZenviaLogo: React.FC<ZenviaLogoProps> = ({
  variant = "gold",
  className = "h-10 w-auto",
  showTagline = false,
  taglineText = "Smart Finds • India",
}) => {
  // Color configuration according to variant
  const isWhite = variant === "white";
  const isDark = variant === "dark";

  const primaryFill = isWhite
    ? "#FFFFFF"
    : isDark
    ? "#171717"
    : "url(#zenviaGoldGrad)";

  const strokeColor = isWhite
    ? "#FFFFFF"
    : isDark
    ? "#171717"
    : "url(#zenviaGoldGrad)";

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 280 100"
        className="w-full h-full max-h-full object-contain"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Zenvia Official Logo"
      >
        <defs>
          <linearGradient id="zenviaGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5D061" />
            <stop offset="40%" stopColor="#D4AF37" />
            <stop offset="75%" stopColor="#B38B1B" />
            <stop offset="100%" stopColor="#E6C86E" />
          </linearGradient>
        </defs>

        {/* Outer Circular Emblem */}
        <circle
          cx="140"
          cy="36"
          r="24"
          stroke={strokeColor}
          strokeWidth="2.2"
          fill="none"
        />

        {/* Calligraphic 'Z' Emblem with Leaf Detail */}
        <g fill={primaryFill}>
          {/* Top Bar of Z */}
          <path d="M 125 25 C 128 23, 137 23, 148 24.5 C 151 22, 154 19, 156.5 16 C 158 19, 156 23, 152 25.5 M 148 24.5 C 142 25.5, 131 26, 127 28.5 Z" />
          {/* Leaf Motif */}
          <path d="M 148 24 C 152 20.5, 157.5 16.5, 160.5 16 C 161 18, 158.5 22.5, 152 25.5 Z" />
          {/* Diagonal Body & Base of Z */}
          <path d="M 148 25 L 129 46.5 C 134 46.5, 146 46, 152 46.5 C 154 47, 152 49, 147 49 L 126 49 C 124 49, 123 47.7, 124.5 46.5 C 127 43.5, 143 26.5, 148 25 Z" />
        </g>

        {/* Official Brand Name Typography - ZENVIA */}
        <text
          x="140"
          y="84"
          textAnchor="middle"
          fill={primaryFill}
          fontFamily="'Cinzel', 'Playfair Display', 'Bodoni MT', 'Didot', serif"
          fontSize="22"
          fontWeight="700"
          letterSpacing="0.32em"
        >
          ZENVIA
        </text>
      </svg>

      {showTagline && (
        <span className="text-[10px] tracking-widest text-neutral-500 uppercase font-semibold -mt-1 block text-center">
          {taglineText}
        </span>
      )}
    </div>
  );
};
