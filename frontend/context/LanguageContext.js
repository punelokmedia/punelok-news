"use client";
import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  const hasUserSelectedRef = useRef(false);

  const setLanguage = useCallback((code) => {
    const normalized = normalizeLanguage(code);
    hasUserSelectedRef.current = true;
    setLanguageState(normalized);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('punelok-language', normalized);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedRaw = window.localStorage.getItem('punelok-language');
    if (!storedRaw || hasUserSelectedRef.current) return;

    // Backward compatible with any previously stringified values.
    let parsed = storedRaw;
    try {
      parsed = JSON.parse(storedRaw);
    } catch {
      parsed = storedRaw;
    }

    const normalized = normalizeLanguage(parsed);
    setLanguageState(normalized);
    window.localStorage.setItem('punelok-language', normalized);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('punelok-language', normalizeLanguage(language));
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
