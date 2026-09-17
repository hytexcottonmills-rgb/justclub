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
 * Stripe-styled JustClub Emblem Icon
 * Signature blurple gradient squircle tile with subtle top-highlight border,
 * paired with a crisp, geometric "J" lettermark.
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
    xs: 'w-5 h-5 rounded-[6px]',
    sm: 'w-7 h-7 rounded-[8px]',
    md: 'w-9 h-9 rounded-[10px]',
    lg: 'w-12 h-12 rounded-[14px]',
    xl: 'w-16 h-16 rounded-[18px]',
    '2xl': 'w-20 h-20 rounded-[22px]',
  }[size];

  const emblemColor = '#FFFFFF';
  
  const containerBg = isDark 
    ? 'bg-gradient-to-br from-[#726BFF] via-[#635BFF] to-[#4338CA] border border-white/25 shadow-md shadow-indigo-950/50' 
    : 'bg-gradient-to-br from-[#726BFF] via-[#635BFF] to-[#4F46E5] border border-white/30 shadow-md shadow-indigo-500/20';

  const svgContent = (
    <svg
      viewBox="0 0 128 128"
      className="w-full h-full select-none pointer-events-none p-1"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`jcJGrad_${isDark ? 'dark' : 'light'}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#726BFF" />
          <stop offset="50%" stopColor="#635BFF" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>
      </defs>

      {/* Stripe-styled Geometric J Path */}
      <path
        fill={withContainer ? emblemColor : (isDark ? '#FFFFFF' : 'url(#jcJGrad_light)')}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M 71 32 L 89 32 L 89 72 C 89 85.5 78 96 64 96 C 50 96 39 85.5 39 72 L 39 63 L 57 63 L 57 71 C 57 75 60 78 64 78 C 68 78 71 75 71 71 L 71 32 Z"
      />
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
          ? '0 4px 16px -2px rgba(99, 91, 255, 0.45), 0 2px 6px -1px rgba(0, 0, 0, 0.4)' 
          : '0 4px 14px -2px rgba(99, 91, 255, 0.35)',
      }}
    >
      {svgContent}
    </div>
  );
};

/**
 * Unified JustClub Logo with Stripe-styled J Icon and Brand Typography
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
      {/* Stripe-styled J Emblem */}
      <JustClubIcon size={size} isDarkMode={isDarkMode} />

      {/* Brand Name Typography */}
      {showText && (
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-tight ${textSizes} flex items-center`}>
            <span className="text-[#635BFF] hover:text-[#726BFF] transition-colors">just</span>
            <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>club</span>
          </span>
          <span
            className={`font-mono font-black tracking-wider uppercase rounded-md border shadow-xs ${badgeSizes} ${
              isDarkMode
                ? 'bg-[#635BFF]/15 text-[#A5A0FF] border-[#635BFF]/30'
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
