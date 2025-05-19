import { supabase } from '../../services/database';
import { SupportedLanguage } from '../constants';

export class I18nService {
  private translations: Record<string, string> = {};
  private currentLanguage: SupportedLanguage = 'de';
  private fallbackTranslations: Record<string, string> = {};

  async setLanguage(lang: SupportedLanguage) {
    // Load both requested language and fallback language
    const [mainLang, fallbackLang] = await Promise.all([
      this.loadTranslations(lang),
      this.loadTranslations('de') // Always load German as fallback
    ]);

    this.translations = mainLang;
    this.fallbackTranslations = fallbackLang;
    this.currentLanguage = lang;
    
    localStorage.setItem('preferred_language', lang);
  }

  private async loadTranslations(lang: SupportedLanguage): Promise<Record<string, string>> {
    const { data, error } = await supabase
      .from('translations')
      .select('key, value')
      .eq('language', lang);

    if (error) throw error;

    return data.reduce((acc, { key, value }) => ({
      ...acc,
      [key]: value
    }), {});
  }

  translate(key: string, params: Record<string, string> = {}): string {
    // Try to get translation from current language, fall back to German if not found
    let translation = this.translations[key] || this.fallbackTranslations[key] || key;

    // Replace parameters in translation string
    Object.entries(params).forEach(([paramKey, value]) => {
      translation = translation.replace(`{${paramKey}}`, value);
    });

    return translation;
  }

  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  async refreshTranslations() {
    await this.setLanguage(this.currentLanguage);
  }
}