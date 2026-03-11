'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Step2PlayerSelectionProps {
  onNext: (data: { is_new_player: boolean; selected_player_id?: string }) => void;
  onBack: () => void;
}

export function Step2PlayerSelection({ onNext, onBack }: Step2PlayerSelectionProps) {
  const [selection, setSelection] = useState<'new' | 'existing' | null>(null);

  const handleContinue = () => {
    if (selection === 'new') {
      onNext({ is_new_player: true });
    } else if (selection === 'existing') {
      // TODO: Implement existing player selection
      onNext({ is_new_player: false, selected_player_id: 'placeholder' });
    }
  };

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Spielerauswahl
          </h2>
          <p className="text-gray-600">
            Handelt es sich um eine Neuanmeldung oder einen bestehenden Spieler?
          </p>
        </div>

        {/* Selection Cards */}
        <div className="space-y-4" role="radiogroup" aria-label="Spielerauswahl">
          {/* New Player */}
          <button
            role="radio"
            aria-checked={selection === 'new'}
            onClick={() => setSelection('new')}
            className={`w-full p-6 rounded-xl border-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              selection === 'new'
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selection === 'new'
                      ? 'border-primary bg-primary'
                      : 'border-gray-300'
                  }`}
                >
                  {selection === 'new' && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Neuer Spieler
                </h3>
                <p className="text-sm text-gray-600">
                  Erstanmeldung für einen Spieler, der bisher noch nicht registriert wurde
                </p>
              </div>
            </div>
          </button>

          {/* Existing Player */}
          <button
            role="radio"
            aria-checked={selection === 'existing'}
            onClick={() => setSelection('existing')}
            className={`w-full p-6 rounded-xl border-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              selection === 'existing'
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selection === 'existing'
                      ? 'border-primary bg-primary'
                      : 'border-gray-300'
                  }`}
                >
                  {selection === 'existing' && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Bestehender Spieler
                </h3>
                <p className="text-sm text-gray-600">
                  Wechsel oder Wiedereintritt eines bereits registrierten Spielers
                </p>
                {selection === 'existing' && (
                  <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 italic">
                      Suche nach bestehendem Spieler wird in Phase 3 implementiert
                    </p>
                  </div>
                )}
              </div>
            </div>
          </button>
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
            disabled={!selection}
            className="flex-1"
          >
            Weiter
          </Button>
        </div>
      </div>
    </Card>
  );
}
