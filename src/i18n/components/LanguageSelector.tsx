import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES } from '../constants';

export function LanguageSelector() {
  const { language, setLanguage } = useTranslation();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as any)}
      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
    >
      {SUPPORTED_LANGUAGES.map((lang) => (
        <option key={lang} value={lang}>
          {LANGUAGE_NAMES[lang]}
        </option>
      ))}
    </select>
  );
}