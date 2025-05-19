import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { ClubService } from '../../services/club.service';

interface LogoUploadProps {
  onUpload: (url: string) => void;
  onCancel: () => void;
}

export function LogoUpload({ onUpload, onCancel }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const clubService = new ClubService();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const logoUrl = await clubService.uploadLogo(file);
      onUpload(logoUrl);
    } catch (error) {
      console.error('Failed to upload logo:', error);
      // Hier könnte eine Fehlerbehandlung implementiert werden
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Logo hochladen</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Wird hochgeladen...' : 'Logo auswählen'}
            </button>
            <p className="mt-2 text-sm text-gray-500">
              PNG, JPG oder GIF bis 5MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}