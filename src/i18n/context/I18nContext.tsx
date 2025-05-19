import React, { createContext, useState, useCallback } from 'react';
import { I18nService } from '../services/I18nService';
import { SupportedLanguage, DEFAULT_LANGUAGE } from '../constants';

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  t: (key: string, params?: Record<string, string>) => string;
}

export const I18nContext = createContext<I18nContextType | null>(null);

const i18nService = new I18nService();

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(
    () => (localStorage.getItem('preferred_language') as SupportedLanguage) || DEFAULT_LANGUAGE
  );

  const setLanguage = useCallback(async (lang: SupportedLanguage) => {
    await i18nService.setLanguage(lang);
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string>) => {
    return i18nService.translate(key, params);
  }, []);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}