import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Language, Theme, getTranslation } from '../lib/i18n';

interface ThemeLanguageContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const ThemeLanguageContext = createContext<ThemeLanguageContextType | undefined>(undefined);

export const ThemeLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('assiduo_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('assiduo_language');
    if (saved === 'ar' || saved === 'en' || saved === 'fr') {
      return saved;
    }
    return 'fr';
  });

  useEffect(() => {
    localStorage.setItem('assiduo_theme', theme);
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('assiduo_language', language);
    const root = document.documentElement;
    root.setAttribute('lang', language);
    root.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
  }, [language]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
  };

  const t = useCallback(
    (key: string): string => {
      return getTranslation(key, language);
    },
    [language]
  );

  const isRtl = language === 'ar';

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      language,
      setLanguage,
      t,
      isRtl,
    }),
    [theme, language, isRtl, t]
  );

  return (
    <ThemeLanguageContext.Provider value={value}>
      {children}
    </ThemeLanguageContext.Provider>
  );
};

// oxlint-disable-next-line react/only-export-components
export const useThemeLanguage = (): ThemeLanguageContextType => {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error('useThemeLanguage must be used within a ThemeLanguageProvider');
  }
  return context;
};
