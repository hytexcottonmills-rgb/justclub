import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, LanguageOption, translations } from './translations';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, fallback?: string) => string;
  currentLanguageOption: LanguageOption;
  languagesList: LanguageOption[];
  isRTL: boolean;
}

const STORAGE_KEY = 'justclub_language_preference';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
        return saved as SupportedLanguage;
      }
    } catch {
      // ignore storage errors
    }
    return 'en';
  });

  const setLanguage = (newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // ignore storage errors
    }
  };

  const currentLanguageOption = useMemo(() => {
    return SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const isRTL = currentLanguageOption.dir === 'rtl';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [language, isRTL]);

  const t = (key: string, fallback?: string): string => {
    const langDictionary = translations[language];
    if (langDictionary && langDictionary[key]) {
      return langDictionary[key];
    }
    // Fallback to English
    const enDictionary = translations.en;
    if (enDictionary && enDictionary[key]) {
      return enDictionary[key];
    }
    return fallback || key;
  };

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
    currentLanguageOption,
    languagesList: SUPPORTED_LANGUAGES,
    isRTL,
  }), [language, currentLanguageOption, isRTL]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

export * from './translations';
