import React, { useState, useEffect } from 'react';
import { Shield, Upload, MessageSquare, Bell } from 'lucide-react';
import { ClubService } from '../services/club.service';
import { CachedImage } from './common/CachedImage';
import { TeamInlineEdit } from './team/TeamInlineEdit';
import { ExportButton } from './export/ExportButton';
import { NotificationCenter } from './notifications/NotificationCenter';
import { MessagingPanel } from './communication/MessagingPanel';

export function Header() {
  const [clubSettings, setClubSettings] = useState<{ name: string; logo_url: string | null; } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);
  const clubService = new ClubService();

  useEffect(() => {
    loadClubSettings();
  }, []);

  const loadClubSettings = async () => {
    try {
      const settings = await clubService.getSettings();
      setClubSettings(settings);
    } catch (error) {
      console.error('Failed to load club settings:', error);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await clubService.uploadLogo(file);
      await loadClubSettings();
    } catch (error) {
      console.error('Failed to upload logo:', error);
      alert('Fehler beim Hochladen des Logos');
    } finally {
      setUploading(false);
    }
  };

  const handleNameUpdate = async (newName: string) => {
    try {
      await clubService.updateSettings({ name: newName });
      await loadClubSettings();
    } catch (error) {
      console.error('Failed to update club name:', error);
      throw error;
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group">
              {clubSettings?.logo_url ? (
                <CachedImage
                  src={clubSettings.logo_url}
                  alt="Vereinslogo"
                  className="w-12 h-12 object-contain"
                  fallback={
                    <Shield className="w-12 h-12 text-gray-400" />
                  }
                />
              ) : (
                <Shield className="w-12 h-12 text-gray-400" />
              )}
              
              <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 cursor-pointer rounded transition-opacity">
                <Upload className="w-6 h-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
            
            <div className="flex-1 min-w-0">
              <TeamInlineEdit
                label=""
                value={clubSettings?.name || 'Mein Verein'}
                onSave={handleNameUpdate}
                className="text-2xl font-bold text-gray-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ExportButton />
            
            <div className="relative">
              <button
                onClick={() => setShowMessaging(!showMessaging)}
                className="p-2 text-gray-600 hover:text-gray-900 relative"
              >
                <MessageSquare className="w-6 h-6" />
              </button>
              {showMessaging && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <MessagingPanel userId="current-user-id" />
                </div>
              )}
            </div>

            <NotificationCenter />
          </div>
        </div>
      </div>
    </header>
  );
}