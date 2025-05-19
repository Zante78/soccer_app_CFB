import React, { useRef, useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface ImageUploadModalProps {
  onUpload: (file: File) => Promise<void>;
  onClose: () => void;
}

export function ImageUploadModal({ onUpload, onClose }: ImageUploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Auto-close on success after delay
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, onClose]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    setSuccess(false);

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
      setError('Nur JPEG, PNG und GIF Dateien sind erlaubt');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Die Datei darf maximal 5MB groß sein');
      return;
    }

    // Clear previous preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 500);

      await onUpload(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setSuccess(true);

      // Show success message with toast
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
      toast.innerHTML = `
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>Bild erfolgreich hochgeladen</span>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Hochladen');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg w-full max-w-lg" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Teambild hochladen</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            disabled={uploading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">Bild erfolgreich hochgeladen</p>
            </div>
          )}

          <div
            className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <div className="space-y-4">
                <img 
                  src={previewUrl} 
                  alt="Vorschau" 
                  className="max-h-64 mx-auto rounded-lg"
                />
                {!uploading && !success && (
                  <div className="text-center">
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Bild entfernen
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4 flex flex-col items-center text-sm text-gray-600">
                  <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Bild auswählen</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="sr-only"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={handleFileSelect}
                      disabled={uploading}
                    />
                  </label>
                  <p className="pl-1">oder hierher ziehen</p>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  PNG, JPG oder GIF bis 5MB
                </p>
              </div>
            )}

            {/* Upload Progress Overlay */}
            {uploading && (
              <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
                <div className="w-full max-w-xs">
                  <div className="flex items-center justify-between mb-2">
                    <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                    <span className="text-sm font-medium text-blue-600">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Bild wird hochgeladen...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            disabled={uploading}
          >
            Abbrechen
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading || success}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {uploading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Wird hochgeladen...
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Hochgeladen
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Hochladen
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}