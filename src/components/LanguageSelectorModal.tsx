import React, { useState } from 'react';
import { Globe, Check, X, Search, Sparkles } from 'lucide-react';
import { useTranslation, SupportedLanguage, LanguageOption } from '../i18n';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
  isDarkMode = true,
}) => {
  const { language, setLanguage, languagesList, t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredLanguages = languagesList.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
          isDarkMode 
            ? 'bg-slate-900 border-slate-800 text-slate-100' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 sm:p-5 border-b ${
          isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50/70'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-500 border border-indigo-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>{t('header.select_language', 'Select Language')}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  {languagesList.length} Languages
                </span>
              </h3>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('settings.language_desc', 'Select your native or operational language for all screens and receipts.')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition ${
              isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-inherit">
          <div className={`relative flex items-center rounded-xl border px-3 py-2 ${
            isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder={t('common.search', 'Search language or state (e.g. Hindi, Tamil, Kannada)...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm focus:outline-hidden placeholder:text-slate-500"
              autoFocus
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-xs text-slate-400 hover:text-slate-200">
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Languages Grid */}
        <div className="max-h-80 overflow-y-auto p-4 space-y-2">
          {filteredLanguages.map((langOption: LanguageOption) => {
            const isSelected = language === langOption.code;
            return (
              <button
                key={langOption.code}
                onClick={() => handleSelect(langOption.code)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition text-left group ${
                  isSelected
                    ? (isDarkMode 
                        ? 'bg-indigo-600/15 border-indigo-500/50 text-indigo-300 ring-1 ring-indigo-500/40' 
                        : 'bg-indigo-50 border-indigo-300 text-indigo-900 ring-1 ring-indigo-400')
                    : (isDarkMode 
                        ? 'bg-slate-950/30 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700 text-slate-200' 
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800')
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl select-none" role="img" aria-label={langOption.name}>
                    {langOption.flag}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{langOption.nativeName}</span>
                      <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        ({langOption.name})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isSelected && (
                    <div className="p-1 rounded-full bg-indigo-500 text-white">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {filteredLanguages.length === 0 && (
            <div className="p-6 text-center text-sm text-slate-500">
              No languages found matching "{searchQuery}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-3.5 px-5 border-t text-xs flex items-center justify-between ${
          isDarkMode ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-100 bg-slate-50 text-slate-600'
        }`}>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Instant reactive language switching without page reload.</span>
          </div>
          <button
            onClick={onClose}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
            }`}
          >
            {t('common.close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
