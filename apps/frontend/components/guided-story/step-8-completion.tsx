'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface Step8CompletionProps {
  magicLink: string;
  registrationId: string;
  playerName: string;
}

export function Step8Completion({ magicLink, registrationId, playerName }: Step8CompletionProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(magicLink);
    toast.success('Link in Zwischenablage kopiert!');
  };

  return (
    <Card>
      <div className="space-y-6">
        {/* Success Icon */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-success/10 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-success" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Antrag erfolgreich!
          </h2>
          <p className="text-lg text-gray-600">
            Ihr Spielerpass-Antrag für <strong>{playerName}</strong> wurde eingereicht
          </p>
        </div>

        {/* Status Timeline */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Nächste Schritte</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-success text-white rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Antrag eingegangen</p>
                <p className="text-xs text-gray-600">Ihre Daten wurden erfolgreich übermittelt</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Automatische Verarbeitung</p>
                <p className="text-xs text-gray-600">
                  Der RPA-Bot erstellt einen Entwurf im DFBnet (~30 Sekunden)
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Passwart-Prüfung</p>
                <p className="text-xs text-gray-600">
                  Der Passwart prüft und sendet den Antrag final ab
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center text-sm font-semibold">
                4
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Fertig!</p>
                <p className="text-xs text-gray-600">
                  Sie erhalten eine Benachrichtigung, sobald der Pass genehmigt ist
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Magic Link Section */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Ihr Magic Link zur Statusverfolgung
          </h3>

          {/* QR Code */}
          <div className="bg-white p-6 rounded-xl border-2 border-primary/20 mb-4">
            <div className="text-center">
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                <QRCodeSVG value={magicLink} size={200} level="H" />
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Scannen Sie den QR-Code mit Ihrem Smartphone
              </p>
            </div>
          </div>

          {/* Link Copy */}
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Oder kopieren Sie den Link:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={magicLink}
                readOnly
                className="input flex-1 text-sm"
              />
              <button
                onClick={copyToClipboard}
                aria-label="Link in Zwischenablage kopieren"
                className="px-4 py-2 min-h-[44px] min-w-[44px] bg-primary text-white rounded-xl hover:bg-[#004080] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Speichern Sie diesen Link, um jederzeit den Status Ihres Antrags zu verfolgen
            </p>
          </div>
        </div>

        {/* Info Boxes */}
        <div className="space-y-3">
          {/* DSGVO Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Datenschutz</p>
                <p>
                  Ihre hochgeladenen Fotos werden nach 48 Stunden automatisch gelöscht.
                  Der Magic Link bleibt 30 Tage gültig.
                </p>
              </div>
            </div>
          </div>

          {/* Email Confirmation */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-success mt-0.5 mr-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">E-Mail Bestätigung</p>
                <p>
                  Sie erhalten eine Bestätigungs-E-Mail mit Ihrem Magic Link und der Antragsnummer.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Registration ID */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">Antragsnummer:</p>
          <p className="text-lg font-mono font-semibold text-gray-900">{registrationId}</p>
        </div>

        {/* Action Button */}
        <div className="text-center pt-4">
          <a
            href="/"
            className="btn-primary inline-block px-8 py-4 text-lg"
          >
            Zurück zur Startseite
          </a>
        </div>
      </div>
    </Card>
  );
}
