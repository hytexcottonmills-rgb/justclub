import React, { useRef, useEffect } from 'react';
import { Check, Sparkles, X, Languages } from 'lucide-react';
import { useTranslation, SupportedLanguage, LanguageOption } from '../i18n';

interface LanguageDropdownPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

export const LanguageDropdownPopover: React.FC<LanguageDropdownPopoverProps> = ({
  isOpen,
  onClose,
  isDarkMode = true,
}) => {
  const { language, setLanguage, languagesList, t } = useTranslation();
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    onClose();
  };

  return (
    <div
      ref={popoverRef}
      className={`absolute right-0 top-full mt-2 w-[calc(100vw-32px)] max-w-sm sm:w-96 rounded-2xl shadow-2xl border p-3 z-50 animate-in fade-in zoom-in-95 duration-150 ${
        isDarkMode
          ? 'bg-[#0f172a] border-slate-700/80 text-slate-100 shadow-black/80'
          : 'bg-white border-slate-200 text-slate-900 shadow-slate-400/30'
      }`}
      style={{ minWidth: '280px' }}
    >
      {/* Popover Header */}
      <div className={`flex items-center justify-between pb-2.5 mb-2 border-b px-1 ${
        isDarkMode ? 'border-slate-800' : 'border-slate-100'
      }`}>
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold tracking-tight">
            {t('header.select_language', 'Select Display Language')}
          </span>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
          isDarkMode ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
        }`}>
          {languagesList.length} Indian Languages
        </span>
      </div>

      {/* Languages List */}
      <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
        {languagesList.map((langOption: LanguageOption) => {
          const isSelected = language === langOption.code;
          return (
            <button
              key={langOption.code}
              onClick={() => handleSelect(langOption.code)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? isDarkMode
                    ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500 font-bold shadow-xs'
                    : 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-1 ring-indigo-500 font-bold shadow-xs'
                  : isDarkMode
                    ? 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800 hover:border-slate-700 text-slate-300'
                    : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl select-none" role="img" aria-label={langOption.name}>
                  {langOption.flag}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs font-bold">{langOption.nativeName}</span>
                  <span className={`text-[11px] ${
                    isSelected 
                      ? (isDarkMode ? 'text-indigo-300' : 'text-indigo-600') 
                      : (isDarkMode ? 'text-slate-400' : 'text-slate-500')
                  }`}>
                    ({langOption.name})
                  </span>
                </div>
              </div>

              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Popover Footer */}
      <div className={`mt-2.5 pt-2.5 border-t text-[11px] flex items-center justify-between gap-2 px-1 ${
        isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
      }`}>
        <div className="flex items-center gap-1.5 text-[10px] leading-tight">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>Instant reactive language switching without page reload.</span>
        </div>
        <button
          onClick={onClose}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition shrink-0 ${
            isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          Close
        </button>
      </div>
    </div>
  );
};
