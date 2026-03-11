'use client';

import { useState, useRef } from 'react';
import type ReactSignatureCanvas from 'react-signature-canvas';
import type { SignatureCanvasProps } from 'react-signature-canvas';
import dynamic from 'next/dynamic';
const SignatureCanvas = dynamic<SignatureCanvasProps & { ref?: React.Ref<ReactSignatureCanvas> }>(
  () => import('react-signature-canvas'),
  { ssr: false }
);
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface Step6ConsentProps {
  onNext: (data: { consents: Record<string, boolean>; signature_data: string }) => void;
  onBack: () => void;
  playerData: {
    first_name: string;
    last_name: string;
    birth_date: string;
    team_id: string;
  };
}

export function Step6Consent({ onNext, onBack, playerData }: Step6ConsentProps) {
  const [consents, setConsents] = useState({
    dsgvo: false,
    accuracy: false,
    eligibility: false,
  });
  const [signatureError, setSignatureError] = useState<string | null>(null);
  const signatureRef = useRef<ReactSignatureCanvas>(null);

  const handleConsentChange = (key: string, value: boolean) => {
    setConsents((prev) => ({ ...prev, [key]: value }));
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
    setSignatureError(null);
  };

  const handleContinue = () => {
    // Validate all consents
    if (!consents.dsgvo || !consents.accuracy || !consents.eligibility) {
      toast.error('Bitte akzeptieren Sie alle erforderlichen Erklärungen');
      return;
    }

    // Validate signature
    if (signatureRef.current?.isEmpty()) {
      setSignatureError('Bitte unterschreiben Sie das Formular');
      return;
    }

    // Get signature as base64
    const signatureData = signatureRef.current?.toDataURL('image/png') || '';

    onNext({ consents, signature_data: signatureData });
  };

  const allConsentsGiven = consents.dsgvo && consents.accuracy && consents.eligibility;

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Erklärungen & Unterschrift
          </h2>
          <p className="text-gray-600">
            Bitte lesen und akzeptieren Sie die folgenden Erklärungen
          </p>
        </div>

        {/* Data Summary */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Zusammenfassung Ihrer Angaben</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Spieler:</span>
              <span className="font-medium text-gray-900">
                {playerData.first_name} {playerData.last_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Geburtsdatum:</span>
              <span className="font-medium text-gray-900">
                {new Date(playerData.birth_date).toLocaleDateString('de-DE')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mannschaft:</span>
              <span className="font-medium text-gray-900">{playerData.team_id}</span>
            </div>
          </div>
        </div>

        {/* Consent Checkboxes */}
        <div className="space-y-4">
          {/* DSGVO Consent */}
          <label className="flex items-start cursor-pointer group">
            <input
              type="checkbox"
              checked={consents.dsgvo}
              onChange={(e) => handleConsentChange('dsgvo', e.target.checked)}
              className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            />
            <div className="ml-3 flex-1">
              <span className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">
                DSGVO-Einwilligung *
              </span>
              <p className="text-xs text-gray-600 mt-1">
                Ich willige ein, dass meine personenbezogenen Daten zum Zweck der Spielerpass-Beantragung
                verarbeitet werden. Die Daten werden nach 48 Stunden automatisch gelöscht.
              </p>
            </div>
          </label>

          {/* Accuracy Declaration */}
          <label className="flex items-start cursor-pointer group">
            <input
              type="checkbox"
              checked={consents.accuracy}
              onChange={(e) => handleConsentChange('accuracy', e.target.checked)}
              className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            />
            <div className="ml-3 flex-1">
              <span className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">
                Richtigkeit der Angaben *
              </span>
              <p className="text-xs text-gray-600 mt-1">
                Ich bestätige, dass alle gemachten Angaben wahrheitsgemäß und vollständig sind.
                Mir ist bekannt, dass falsche Angaben zu Sanktionen führen können.
              </p>
            </div>
          </label>

          {/* Eligibility Declaration */}
          <label className="flex items-start cursor-pointer group">
            <input
              type="checkbox"
              checked={consents.eligibility}
              onChange={(e) => handleConsentChange('eligibility', e.target.checked)}
              className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            />
            <div className="ml-3 flex-1">
              <span className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">
                Kenntnisnahme Spielberechtigung *
              </span>
              <p className="text-xs text-gray-600 mt-1">
                Ich habe die berechnete Spielberechtigung zur Kenntnis genommen und bin mir bewusst,
                dass ein Einsatz vor Ablauf der Sperrfrist zu Bußgeldern führen kann.
              </p>
            </div>
          </label>
        </div>

        {/* Signature Canvas */}
        <div className="pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unterschrift * (mit Maus oder Touch)
          </label>

          <div className="border-2 border-gray-300 rounded-xl overflow-hidden">
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                className: 'w-full h-40 bg-white',
                style: { touchAction: 'none' },
                'aria-label': 'Unterschriftsfeld — mit Maus oder Touch unterschreiben',
              }}
              backgroundColor="white"
              penColor="black"
            />
          </div>

          <div className="flex justify-between items-center mt-2">
            {signatureError && (
              <p role="alert" className="text-sm text-error">{signatureError}</p>
            )}
            <button
              type="button"
              onClick={clearSignature}
              className="ml-auto text-sm text-gray-600 hover:text-primary transition-colors min-h-[44px] px-3 inline-flex items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Unterschrift löschen
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-blue-800">
              Ihre Unterschrift wird digital gespeichert und zusammen mit dem Antrag
              an den Passwart übermittelt. Sie können Ihren Antragsstatus jederzeit
              über den Magic Link verfolgen.
            </p>
          </div>
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
            disabled={!allConsentsGiven}
            className="flex-1"
          >
            Weiter zur Zahlung
          </Button>
        </div>
      </div>
    </Card>
  );
}
