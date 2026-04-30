"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('marathi'); // Default to Marathi
  const [t, setT] = useState(translations.marathi);

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem('punelok-language');
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    setT(translations[language]);
    window.localStorage.setItem('punelok-language', language);
    document.documentElement.lang = language;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
