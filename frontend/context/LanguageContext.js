"use client";
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { translations } from '../utils/translations';
import { normalizeLanguage, getTranslationBundle } from '../utils/i18n';

const LanguageContext = createContext(null);

const defaultContextValue = {
  language: 'marathi',
  setLanguage: () => {},
  t: translations.marathi,
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('marathi');

  const setLanguage = useCallback((code) => {
    setLanguageState(normalizeLanguage(code));
  }, []);

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem('punelok-language') : null;
    if (raw) {
      setLanguageState(normalizeLanguage(raw));
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('punelok-language', language);
    const htmlLang = { marathi: 'mr', hindi: 'hi', english: 'en' }[language] || 'mr';
    document.documentElement.lang = htmlLang;
  }, [language]);

  const t = useMemo(() => getTranslationBundle(language), [language]);

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  return ctx ?? defaultContextValue;
}
