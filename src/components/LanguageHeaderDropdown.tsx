import React, { useState, useRef, useEffect } from 'react';
import { Languages, Check, Sparkles, X } from 'lucide-react';
import { useTranslation, SupportedLanguage, LanguageOption } from '../i18n';

interface LanguageHeaderDropdownProps {
  isDarkMode?: boolean;
}

export const LanguageHeaderDropdown: React.FC<LanguageHeaderDropdownProps> = ({
  isDarkMode = true,
}) => {
  const { language, setLanguage, languagesList, currentLanguageOption, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handlePointerDown);
      document.addEventListener('touchstart', handlePointerDown);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectLanguage = (langCode: SupportedLanguage) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  // Compute tooltip label based on alternate language (e.g., Hindi preview if English, or English preview if Hindi)
  const tooltipText = language === 'hi' ? 'Switch to English' : 'हिंदी में देखें / Select Language';

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTooltip(false);
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`flex items-center justify-center gap-1.5 w-9 h-9 sm:w-auto sm:h-auto sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold transition border shadow-2xs ${
          isOpen
            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-500/30'
            : isDarkMode
            ? 'bg-slate-800/70 hover:bg-slate-800 text-slate-200 border-slate-700/70 hover:border-slate-600'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
        }`}
        aria-label="Select Regional Language"
        aria-expanded={isOpen}
      >
        {/* Custom Crisp Translate Icon (A / 文) */}
        <div className="flex items-center justify-center text-indigo-400 shrink-0">
          <Languages className="w-4 h-4" />
        </div>
        
        {/* Native name label on desktop / tablet */}
        <span className="font-semibold text-[11px] hidden md:inline">
          {currentLanguageOption.nativeName}
        </span>
      </button>

      {/* Hover Tooltip (Desktop Only, shown when dropdown is closed) */}
      {showTooltip && !isOpen && (
        <div className={`hidden sm:block absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap pointer-events-none shadow-xl border animate-in fade-in zoom-in-95 duration-150 ${
          isDarkMode 
            ? 'bg-slate-900 border-slate-700 text-slate-200' 
            : 'bg-slate-800 border-slate-900 text-white'
        }`}>
          {tooltipText}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-inherit border-t border-l border-inherit" />
        </div>
      )}

      {/* Language Selection Popover Dropdown (Matches User Screenshot) */}
      {isOpen && (
        <div 
          className={`fixed sm:absolute right-3 sm:right-0 top-16 sm:top-full sm:mt-2 w-[calc(100vw-24px)] sm:w-[320px] max-w-[340px] z-50 rounded-2xl border shadow-2xl p-2 sm:p-2.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
            isDarkMode 
              ? 'bg-[#0c1222]/98 border-slate-700/80 text-slate-100 shadow-black/80' 
              : 'bg-white/98 border-slate-200 text-slate-900 shadow-xl'
          }`}
        >
          {/* Header Title & Close for small devices */}
          <div className="flex items-center justify-between px-2.5 py-1.5 mb-1 border-b border-inherit/40 sm:hidden">
            <span className="text-xs font-bold flex items-center gap-1.5 text-indigo-400">
              <Languages className="w-3.5 h-3.5" />
              {t('header.select_language', 'Select Language')}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Languages List */}
          <div className="max-h-[340px] overflow-y-auto space-y-1.5 pr-0.5 scrollbar-thin">
            {languagesList.map((langOpt: LanguageOption) => {
              const isSelected = language === langOpt.code;
              return (
                <button
                  key={langOpt.code}
                  type="button"
                  onClick={() => handleSelectLanguage(langOpt.code)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left transition ${
                    isSelected
                      ? isDarkMode
                        ? 'border-2 border-indigo-500 bg-indigo-950/40 text-white shadow-xs'
                        : 'border-2 border-indigo-600 bg-indigo-50 text-indigo-950 shadow-xs'
                      : isDarkMode
                      ? 'border-transparent hover:border-slate-700/70 hover:bg-slate-800/70 text-slate-300 hover:text-white'
                      : 'border-transparent hover:border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg select-none" role="img" aria-label={langOpt.name}>
                      {langOpt.flag}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-xs">
                        {langOpt.nativeName}
                      </span>
                      {langOpt.name !== langOpt.nativeName && (
                        <span className={`text-[11px] ${
                          isSelected 
                            ? isDarkMode ? 'text-indigo-300' : 'text-indigo-700' 
                            : isDarkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          ({langOpt.name})
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer with reactive notice & close button */}
          <div className={`mt-2 pt-2 border-t flex items-center justify-between gap-2 px-2 text-[10px] ${
            isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
          }`}>
            <div className="flex items-center gap-1.5 truncate">
              <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
              <span className="truncate">Instant reactive language switching</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition shrink-0 ${
                isDarkMode 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
            >
              {t('common.close', 'Close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
