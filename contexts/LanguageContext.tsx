'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations, getSystemLanguage } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved language or detect system language
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language') as Language | null;
      const lang = savedLang || getSystemLanguage();
      setLanguageState(lang);
      updateDocumentDirection(lang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
    updateDocumentDirection(lang);
  };

  const updateDocumentDirection = (lang: Language) => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Return default values if context is not available (during SSR)
    return {
      language: 'en' as Language,
      setLanguage: () => {},
      t: translations.en
    };
  }
  return context;
}
