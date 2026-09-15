import React from 'react';

export interface JustClubIconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  isDarkMode?: boolean;
  variant?: 'auto' | 'light' | 'dark';
  withContainer?: boolean;
}

export interface JustClubLogoProps {
  isDarkMode?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  className?: string;
}

/**
 * JustClub Standalone Emblem Icon Mark
 * Faithfully matches the exact reference geometry:
 * Outer circular ring, stylized lowercase 'd' / musical note stem,
 * and nested negative-space 3-leaf club (clover) cutout.
 */
export const JustClubIcon: React.FC<JustClubIconProps> = ({
  size = 'md',
  className = '',
  isDarkMode = true,
  variant = 'auto',
  withContainer = true,
}) => {
  const isDark = variant === 'auto' ? isDarkMode : variant === 'dark';

  const sizeClasses = {
    xs: 'w-5 h-5 rounded-md',
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-16 h-16 rounded-2xl',
    '2xl': 'w-20 h-20 rounded-3xl',
  }[size];

  // Colors based on technical brand specs:
  // Light mode: deep rich purple (#4A154B)
  // Dark mode: pure white (#FFFFFF) with violet glow (#A855F7)
  const emblemColor = '#FFFFFF';
  const containerBg = isDark 
    ? 'bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 border border-slate-800 shadow-md' 
    : 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 border border-indigo-500/30 shadow-md';

  const svgContent = (
    <svg
      viewBox="0 0 128 128"
      className="w-full h-full select-none pointer-events-none p-0.5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Club / Clover Negative Space Cutout Mask */}
        <mask id={`jcClubMask_${isDark ? 'dark' : 'light'}`}>
          <rect width="128" height="128" fill="white" />
          {/* Top lobe */}
          <circle cx="53" cy="66.5" r="6.8" fill="black" />
          {/* Left lobe */}
          <circle cx="45.5" cy="75" r="6.8" fill="black" />
          {/* Right lobe */}
          <circle cx="60.5" cy="75" r="6.8" fill="black" />
          {/* Center core */}
          <circle cx="53" cy="72.5" r="5.2" fill="black" />
          {/* Flared stem */}
          <path d="M 53 72.5 L 47.8 84 L 58.2 84 Z" fill="black" />
        </mask>
      </defs>

      <g mask={`url(#jcClubMask_${isDark ? 'dark' : 'light'})`}>
        {/* Outer Circular Ring with opening for vertical stem */}
        <path
          d="M 64.5 26 A 46 46 0 1 0 100 66"
          fill="none"
          stroke={emblemColor}
          strokeWidth="9.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Lower loop of the lowercase 'd' / musical note */}
        <circle cx="53" cy="73.5" r="21.5" fill={emblemColor} />

        {/* Musical note stem with beveled angled apex */}
        <path
          d="M 64.5 73.5 L 64.5 27 L 75.5 18 L 75.5 73.5 Z"
          fill={emblemColor}
        />
      </g>
    </svg>
  );

  if (!withContainer) {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${sizeClasses} ${className}`}>
        {svgContent}
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden transition-transform duration-200 hover:scale-105 select-none ${containerBg} ${sizeClasses} ${className}`}
      style={{
        boxShadow: isDark 
          ? '0 4px 16px -2px rgba(147, 51, 234, 0.35), 0 2px 6px -1px rgba(0, 0, 0, 0.4)' 
          : '0 2px 8px -1px rgba(74, 21, 75, 0.2)',
      }}
    >
      {svgContent}
    </div>
  );
};

/**
 * Unified JustClub Logo with Icon and Brand Typography
 */
export const JustClubLogo: React.FC<JustClubLogoProps> = ({
  isDarkMode = true,
  size = 'md',
  showText = true,
  className = '',
}) => {
  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-4xl',
  }[size];

  const badgeSizes = {
    xs: 'text-[7px] px-1 py-0.2',
    sm: 'text-[8px] px-1.5 py-0.5',
    md: 'text-[9px] px-1.5 py-0.5',
    lg: 'text-[10px] px-2 py-0.5',
    xl: 'text-xs px-2.5 py-1',
    '2xl': 'text-sm px-3 py-1',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Icon Mark Component */}
      <JustClubIcon size={size} isDarkMode={isDarkMode} />

      {/* Brand Name Typography */}
      {showText && (
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-tight ${textSizes} flex items-center`}>
            <span className="text-indigo-500 hover:text-indigo-400 transition-colors">just</span>
            <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>club</span>
          </span>
          <span
            className={`font-mono font-black tracking-wider uppercase rounded-md border shadow-xs ${badgeSizes} ${
              isDarkMode
                ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}
          >
            OS
          </span>
        </div>
      )}
    </div>
  );
};
