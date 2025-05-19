import { useContext } from 'react';
import { I18nContext } from '../context/I18nContext';
import { SupportedLanguage } from '../constants';

export function useLanguage() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useLanguage must be used within an I18nProvider');
  }

  const { language, setLanguage } = context;

  const changeLanguage = async (newLanguage: SupportedLanguage) => {
    try {
      await setLanguage(newLanguage);
      document.documentElement.lang = newLanguage;
    } catch (error) {
      console.error('Failed to change language:', error);
      throw error;
    }
  };

  return {
    currentLanguage: language,
    changeLanguage,
    availableLanguages: ['de', 'en'] as const,
  };
}