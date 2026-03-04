/**
 * Universal Eligibility Calculator
 *
 * Entscheidet automatisch zwischen Senior- und Junior-Regeln
 * basierend auf dem Alter des Spielers
 */

import type { EligibilityResult, RegistrationReason } from '@packages/shared-types';
import { calculateSeniorEligibility, isSenior } from './senior-calculator';
import { calculateJuniorEligibility, isJunior } from './junior-calculator';

export interface EligibilityCalculatorInput {
  /** Geburtsdatum des Spielers (ISO 8601) */
  player_birth_date: string;

  /** Grund der Registrierung */
  registration_reason: RegistrationReason;

  /** Datum der Abmeldung vom vorherigen Verein (ISO 8601) */
  previous_team_deregistration_date?: string;

  /** Datum des letzten Spiels für den vorherigen Verein (ISO 8601) */
  previous_team_last_game?: string;

  /** Stichtag für die Berechnung (Default: heute) */
  reference_date?: string;
}

/**
 * Universelle Sperrfristen-Berechnung
 *
 * Entscheidet automatisch ob § 16 SpO (Senioren) oder § 20 JSpO (Junioren) angewendet wird
 */
export function calculateEligibility(input: EligibilityCalculatorInput): EligibilityResult {
  const referenceDate = input.reference_date || new Date().toISOString().split('T')[0];

  // Entscheide ob Senior oder Junior
  if (isSenior(input.player_birth_date, referenceDate)) {
    return calculateSeniorEligibility({
      player_birth_date: input.player_birth_date,
      registration_reason: input.registration_reason,
      previous_team_deregistration_date: input.previous_team_deregistration_date,
      previous_team_last_game: input.previous_team_last_game,
      reference_date: referenceDate
    });
  } else {
    return calculateJuniorEligibility({
      player_birth_date: input.player_birth_date,
      registration_reason: input.registration_reason,
      previous_team_deregistration_date: input.previous_team_deregistration_date,
      previous_team_last_game: input.previous_team_last_game,
      reference_date: referenceDate
    });
  }
}

/**
 * Prüft ob ein Spieler aktuell spielberechtigt ist (Shortcut)
 */
export function isEligible(input: EligibilityCalculatorInput): boolean {
  const result = calculateEligibility(input);
  return result.is_eligible;
}

/**
 * Gibt die verbleibenden Tage bis zur Spielberechtigung zurück (0 wenn bereits berechtigt)
 */
export function getDaysUntilEligible(input: EligibilityCalculatorInput): number {
  const result = calculateEligibility(input);
  return result.sperrfrist_days;
}
