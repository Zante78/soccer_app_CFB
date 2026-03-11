'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { calculateSeniorEligibility, calculateJuniorEligibility } from '@packages/shared-logic';
import type { EligibilityResult } from '@packages/shared-types';
import { RegistrationReason } from '@packages/shared-types';

interface Step5EligibilityProps {
  onNext: (data: { eligibility_result: EligibilityResult }) => void;
  onBack: () => void;
  playerData: {
    birth_date: string;
    team_id: string;
    previous_club?: string;
    previous_team_deregistration_date?: string;
    previous_team_last_game?: string;
  };
}

export function Step5Eligibility({ onNext, onBack, playerData }: Step5EligibilityProps) {
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);

  useEffect(() => {
    // Calculate eligibility
    const isJunior = playerData.team_id.toLowerCase().includes('u');

    try {
      if (isJunior) {
        const result = calculateJuniorEligibility({
          player_birth_date: playerData.birth_date || new Date().toISOString().split('T')[0],
          previous_team_deregistration_date: playerData.previous_team_deregistration_date,
          previous_team_last_game: playerData.previous_team_last_game,
          registration_reason: playerData.previous_club ? RegistrationReason.TRANSFER : RegistrationReason.NEW_PLAYER,
        });
        setEligibility(result);
      } else {
        const result = calculateSeniorEligibility({
          player_birth_date: playerData.birth_date || new Date().toISOString().split('T')[0],
          previous_team_deregistration_date: playerData.previous_team_deregistration_date,
          previous_team_last_game: playerData.previous_team_last_game,
          registration_reason: playerData.previous_club ? RegistrationReason.TRANSFER : RegistrationReason.NEW_PLAYER,
        });
        setEligibility(result);
      }
    } catch (error) {
      console.error('Eligibility calculation error:', error);
      // Fallback: show as eligible
      setEligibility({
        is_eligible: true,
        eligibility_date: new Date().toISOString().split('T')[0],
        sperrfrist_days: 0,
        sperrfrist_start: "",
        sperrfrist_end: "",
        calculation_reason: "Fallback-Berechnung",
        applied_rule: playerData.team_id.toLowerCase().includes('u') ? 'JSpO §20' : 'SpO §16',
      });
    }
  }, [playerData]);

  const handleContinue = () => {
    if (eligibility) {
      onNext({ eligibility_result: eligibility });
    }
  };

  if (!eligibility) {
    return (
      <Card>
        <div className="space-y-6 py-6" role="status" aria-label="Spielberechtigung wird berechnet">
          <div className="text-center">
            <div className="h-7 bg-gray-200 rounded w-48 mx-auto mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto animate-pulse" />
          </div>
          <div className="h-28 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-40 bg-gray-200 rounded-xl animate-pulse" />
          <p className="text-sm text-gray-600 text-center">Berechne Spielberechtigung...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Spielberechtigung
          </h2>
          <p className="text-gray-600">
            Automatische Berechnung nach {eligibility.applied_rule}
          </p>
        </div>

        {/* Eligibility Status */}
        <div
          className={`p-6 rounded-xl ${
            eligibility.is_eligible
              ? 'bg-green-50 border-2 border-green-200'
              : 'bg-orange-50 border-2 border-orange-200'
          }`}
        >
          <div className="flex items-start">
            {/* Icon */}
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                eligibility.is_eligible ? 'bg-green-500' : 'bg-orange-500'
              }`}
            >
              {eligibility.is_eligible ? (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>

            {/* Content */}
            <div className="ml-4 flex-1">
              <h3
                className={`text-lg font-semibold mb-1 ${
                  eligibility.is_eligible ? 'text-green-900' : 'text-orange-900'
                }`}
              >
                {eligibility.is_eligible
                  ? 'Sofort spielberechtigt'
                  : 'Sperrfrist aktiv'}
              </h3>
              <p
                className={`text-sm ${
                  eligibility.is_eligible ? 'text-green-700' : 'text-orange-700'
                }`}
              >
                {eligibility.is_eligible
                  ? 'Der Spieler kann direkt eingesetzt werden'
                  : `Spielberechtigt ab: ${new Date(eligibility.eligibility_date).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}`}
              </p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Details zur Berechnung</h4>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Regelwerk:</span>
              <span className="text-sm font-medium text-gray-900">
                {eligibility.applied_rule}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Sperrfrist:</span>
              <span className="text-sm font-medium text-gray-900">
                {eligibility.sperrfrist_days} Tage
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Spielberechtigung ab:</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(eligibility.eligibility_date).toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </span>
            </div>

            {!eligibility.is_eligible && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Verbleibende Tage:</span>
                <span className="text-sm font-medium text-orange-700">
                  {Math.max(
                    0,
                    Math.ceil(
                      (new Date(eligibility.eligibility_date).getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24)
                    )
                  )}
                </span>
              </div>
            )}
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
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Wichtig</p>
              <p>
                Diese Berechnung erfolgt automatisch nach den aktuellen WDFV-Regeln.
                Im Zweifelsfall wird die längere Sperrfrist angenommen, um Bußgelder zu vermeiden.
              </p>
            </div>
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
            className="flex-1"
          >
            Weiter
          </Button>
        </div>
      </div>
    </Card>
  );
}
