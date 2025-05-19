import { supabase } from './database';

export type SupportedLanguage = 'de' | 'en' | 'es' | 'fr';

export class I18nService {
  private translations: Record<string, string> = {};
  private currentLanguage: SupportedLanguage = 'de';

  async setLanguage(lang: SupportedLanguage) {
    const { data, error } = await supabase
      .from('translations')
      .select('key, value')
      .eq('language', lang);

    if (error) throw error;

    this.translations = data.reduce((acc, { key, value }) => ({
      ...acc,
      [key]: value
    }), {});

    this.currentLanguage = lang;
    localStorage.setItem('preferred_language', lang);
  }

  translate(key: string, params: Record<string, string> = {}): string {
    let translation = this.translations[key] || key;

    // Replace parameters in translation string
    Object.entries(params).forEach(([key, value]) => {
      translation = translation.replace(`{${key}}`, value);
    });

    return translation;
  }

  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }
}