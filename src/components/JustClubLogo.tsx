import React from 'react';

interface JustClubLogoProps {
  isDarkMode?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const JustClubLogo: React.FC<JustClubLogoProps> = ({
  isDarkMode = true,
  size = 'md',
  showText = true,
}) => {
  const unifiedLogoPath = '/src/assets/images/justclub_unified_icon_1789478728674.jpg';
  const [imgError, setImgError] = React.useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  }[size];

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  }[size];

  const logoColor = isDarkMode ? '#FFFFFF' : '#4C1D95';
  const cutoutColor = isDarkMode ? '#0F172A' : '#FFFFFF';

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Dynamic Theme Logo Icon */}
      <div className={`${sizeClasses} rounded-xl overflow-hidden shadow-md shrink-0 transition-all duration-300 flex items-center justify-center ${
        isDarkMode
          ? 'bg-[#0F172A] ring-1 ring-slate-800 shadow-indigo-500/10'
          : 'bg-white ring-1 ring-indigo-600/20 shadow-indigo-500/15'
      }`}>
        {!imgError ? (
          <img
            src={unifiedLogoPath}
            alt="justclub logo"
            className={`w-full h-full object-cover transition-all duration-300 ${
              isDarkMode
                ? 'grayscale invert brightness-[2] contrast-[1.8]'
                : 'brightness-100'
            }`}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          /* 100% Identical Vector SVG Geometry Fallback */
          <svg viewBox="0 0 100 100" className="w-full h-full p-1.5" fill="none">
            {/* Outer Circular Ring */}
            <circle 
              cx="50" 
              cy="50" 
              r="38" 
              stroke={logoColor} 
              strokeWidth="7" 
            />
            {/* Note Stem / 'd' Curve */}
            <path
              d="M50 20 C62 20 72 30 72 45 L72 75 C72 82 65 88 56 88 C44 88 34 78 34 65 C34 52 44 42 56 42 L62 42 L62 20 Z"
              fill={logoColor}
            />
            {/* Negative Space Club Symbol cutout inside loop */}
            <path
              d="M 50 56 A 4 4 0 1 1 54 60 A 4 4 0 1 1 50 64 A 4 4 0 1 1 46 60 A 4 4 0 1 1 50 56 Z M 50 64 L 47 70 L 53 70 Z"
              fill={cutoutColor}
            />
          </svg>
        )}
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight ${textSizes} flex items-center`}>
              <span className="text-indigo-600 dark:text-indigo-400">just</span>
              <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>club</span>
            </span>
            <span className={`px-1.5 py-0.5 text-[9px] font-extrabold tracking-widest uppercase rounded border ${
              isDarkMode
                ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs'
            }`}>
              OS V2
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
