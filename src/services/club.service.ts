import { supabase, handleDatabaseError, testDatabaseConnection } from './database';

interface ClubSettings {
  id: string;
  name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  created_at: string;
  updated_at: string;
}

export class ClubService {
  private static instance: ClubService | null = null;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): ClubService {
    if (!ClubService.instance) {
      ClubService.instance = new ClubService();
    }
    return ClubService.instance;
  }

  private async initialize() {
    if (this.initialized) return;

    try {
      const isConnected = await testDatabaseConnection();
      if (!isConnected) {
        throw new Error('Bitte klicken Sie auf "Connect to Supabase" um die Datenbankverbindung herzustellen');
      }

      // Ensure club_settings table has at least one record
      const { data, error } = await supabase
        .from('club_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const { error: createError } = await supabase
          .from('club_settings')
          .insert([{
            name: 'Mein Verein',
            primary_color: '#000000',
            secondary_color: '#ffffff'
          }]);

        if (createError) throw createError;
      }

      this.initialized = true;
    } catch (err) {
      this.initialized = false;
      throw handleDatabaseError(err);
    }
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      if (!this.initPromise) {
        this.initPromise = this.initialize();
      }
      await this.initPromise;
      this.initPromise = null;
    }
  }

  async getSettings(): Promise<ClubSettings | null> {
    try {
      await this.ensureInitialized();

      const { data, error } = await supabase
        .from('club_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async updateSettings(settings: Partial<Omit<ClubSettings, 'id' | 'created_at' | 'updated_at'>>): Promise<ClubSettings> {
    try {
      await this.ensureInitialized();

      const { data: currentSettings } = await supabase
        .from('club_settings')
        .select('*')
        .single();

      if (!currentSettings) {
        throw new Error('Keine Einstellungen gefunden');
      }

      const { data, error } = await supabase
        .from('club_settings')
        .update(settings)
        .eq('id', currentSettings.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async uploadLogo(file: File): Promise<string> {
    try {
      await this.ensureInitialized();

      // Validate file type
      if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
        throw new Error('Nur JPEG, PNG und GIF Dateien sind erlaubt');
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Die Datei darf maximal 5MB groß sein');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `club-logo-${Date.now()}.${fileExt}`;

      // Delete old logo if exists
      const { data: settings } = await supabase
        .from('club_settings')
        .select('logo_url')
        .single();

      if (settings?.logo_url) {
        const oldFileName = settings.logo_url.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('logos')
            .remove([oldFileName]);
        }
      }

      // Upload new logo
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      // Update club settings
      await this.updateSettings({ logo_url: data.publicUrl });

      return data.publicUrl;
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }
}