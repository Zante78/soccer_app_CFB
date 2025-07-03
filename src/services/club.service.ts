import { supabase, handleDatabaseError, testDatabaseConnection } from './database';
import { uploadFileToSupabaseStorage } from '../utils/storageUtils';

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

  async getSettings(): Promise<any> {
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

  async updateSettings(settings: Partial<any>): Promise<any> {
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

      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Sie müssen angemeldet sein');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `club-logo-${Date.now()}.${fileExt}`;
      const filePath = `club_logos/${fileName}`;

      // Delete old logo if exists
      const { data: settings } = await supabase
        .from('club_settings')
        .select('logo_url')
        .single();

      if (settings?.logo_url) {
        // Extract path from URL
        const oldUrl = new URL(settings.logo_url);
        const pathParts = oldUrl.pathname.split('/');
        const bucketIndex = pathParts.findIndex(part => part === 'logos');
        
        if (bucketIndex !== -1 && pathParts.length > bucketIndex + 1) {
          const oldPath = pathParts.slice(bucketIndex + 1).join('/');
          
          await supabase.storage
            .from('logos')
            .remove([oldPath]);
        }
      }

      // Use the centralized storage utility to upload the file
      const publicUrl = await uploadFileToSupabaseStorage(
        'logos',
        file,
        {
          path: filePath,
          validateFileType: true,
          allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
          maxSizeBytes: 5 * 1024 * 1024 // 5MB
        }
      );

      // Update club settings with new logo URL
      await this.updateSettings({ logo_url: publicUrl });

      return publicUrl;
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }
}