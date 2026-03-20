'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Step4UploadProps {
  onNext: (data: { photo_file: File | null; document_files: File[] }) => void;
  onBack: () => void;
}

export function Step4Upload({ onNext, onBack }: Step4UploadProps) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);

  // Photo Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setPhotoError('Bitte nur Bilddateien (JPG, PNG, WebP) hochladen');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Datei zu groß (max. 5MB)');
      return;
    }

    // Check image dimensions
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      if (img.width < 600 || img.height < 800) {
        setPhotoError('Bild zu klein (min. 600x800px)');
        URL.revokeObjectURL(objectUrl);
        return;
      }

      // Valid image
      setPhotoFile(file);
      setPhotoPreview(objectUrl);
      setPhotoError(null);
    };
    img.src = objectUrl;
  };

  // Document Upload Handler
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocumentFiles((prev) => [...prev, ...files]);
  };

  // Remove Document
  const removeDocument = (index: number) => {
    setDocumentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit
  const handleContinue = () => {
    if (!photoFile) {
      setPhotoError('Bitte Passfoto hochladen');
      return;
    }
    onNext({ photo_file: photoFile, document_files: documentFiles });
  };

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Dokumente & Passfoto
          </h2>
          <p className="text-gray-700">
            Laden Sie ein Passfoto und ggf. weitere Dokumente hoch
          </p>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Passfoto * (600x800px min., max. 5MB)
          </label>

          {!photoPreview ? (
            <label
              htmlFor="photo-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-12 h-12 text-gray-700 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-700">
                  <span className="font-semibold">Klicken zum Hochladen</span> oder Drag & Drop
                </p>
                <p className="text-xs text-gray-700">JPG, PNG oder WebP (max. 5MB)</p>
              </div>
              <input
                id="photo-upload"
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
              />
            </label>
          ) : (
            <div className="relative">
              <img
                src={photoPreview}
                alt="Passfoto Vorschau"
                className="w-full max-w-xs mx-auto rounded-xl shadow-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setPhotoFile(null);
                  setPhotoPreview(null);
                  setPhotoError(null);
                }}
                className="absolute top-2 right-2 bg-error text-white rounded-full p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-error"
                aria-label="Foto entfernen"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}

          {photoError && (
            <p className="text-sm text-error mt-2">{photoError}</p>
          )}
        </div>

        {/* Document Upload */}
        <div className="pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Weitere Dokumente (optional)
          </label>
          <p className="text-xs text-gray-700 mb-3">
            z.B. Ausweis, Geburtsurkunde, Spielerlaubnis
          </p>

          <label
            htmlFor="document-upload"
            className="flex items-center justify-center w-full px-4 py-3 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
          >
            <svg
              className="w-5 h-5 text-gray-700 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="text-sm text-gray-700">Dokument hinzufügen</span>
            <input
              id="document-upload"
              type="file"
              className="hidden"
              multiple
              onChange={handleDocumentUpload}
            />
          </label>

          {/* Document List */}
          {documentFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {documentFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-700 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-gray-700">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="text-error hover:text-red-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
                    aria-label={`Dokument ${file.name} entfernen`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-4 pt-4">
          <Button
            variant="secondary"
            onClick={onBack}
            className="flex-1"
          >
            Zurück
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!photoFile}
            className="flex-1"
          >
            Weiter
          </Button>
        </div>
      </div>
    </Card>
  );
}
