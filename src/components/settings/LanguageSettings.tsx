import React from 'react';
import { useLanguage } from '../../i18n/hooks/useLanguage';
import { useTranslation } from '../../i18n/hooks/useTranslation';
import { LANGUAGE_NAMES } from '../../i18n/constants';
import { Globe } from 'lucide-react';

export function LanguageSettings() {
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3">
      <Globe className="w-5 h-5 text-gray-500" />
      <select
        value={currentLanguage}
        onChange={(e) => changeLanguage(e.target.value as any)}
        className="block w-full rounded-md border-gray-300 shadow-sm 
                   focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      >
        {availableLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {LANGUAGE_NAMES[lang]}
          </option>
        ))}
      </select>
    </div>
  );
}