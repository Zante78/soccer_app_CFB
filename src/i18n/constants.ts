export const SUPPORTED_LANGUAGES = ['de', 'en', 'es', 'fr'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  de: 'Deutsch',
  en: 'English',
  es: 'Español',
  fr: 'Français',
};

export const DEFAULT_LANGUAGE: SupportedLanguage = 'de';