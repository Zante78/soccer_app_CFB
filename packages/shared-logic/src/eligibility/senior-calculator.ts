/**
 * Senior Calculator - Sperrfristen-Berechnung nach § 16 SpO
 *
 * Regel: Spieler ist spielberechtigt nach MAX(Abmeldedatum, letztes Spiel) + 6 Monate
 *
 * Anwendbar für: Senioren (ab 18 Jahre)
 */

import type { EligibilityResult, RegistrationReason } from '@packages/shared-types';

export interface SeniorCalculatorInput {
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
 * Berechnet die Spielberechtigung für Senioren nach § 16 SpO
 */
export function calculateSeniorEligibility(input: SeniorCalculatorInput): EligibilityResult {
  const referenceDate = input.reference_date ? parseDate(input.reference_date) : new Date();

  // Sonderfall: Erstanmeldung (NEW_PLAYER ohne vorherigen Verein)
  if (input.registration_reason === 'NEW_PLAYER' &&
      !input.previous_team_deregistration_date &&
      !input.previous_team_last_game) {
    return {
      is_eligible: true,
      eligibility_date: formatDate(referenceDate),
      sperrfrist_days: 0,
      sperrfrist_start: formatDate(referenceDate),
      sperrfrist_end: formatDate(referenceDate),
      calculation_reason: 'Erstanmeldung - keine vorherige Mannschaft',
      applied_rule: '§ 16 SpO (Senioren) - Erstanmeldung'
    };
  }

  // Ermittle Startdatum für Sperrfrist (MAX von Abmeldung und letztem Spiel)
  const dates: Date[] = [];

  if (input.previous_team_deregistration_date) {
    dates.push(parseDate(input.previous_team_deregistration_date));
  }

  if (input.previous_team_last_game) {
    dates.push(parseDate(input.previous_team_last_game));
  }

  // Fallback: Wenn keine Daten vorhanden, verwende konservative Schätzung (6 Monate von heute)
  if (dates.length === 0) {
    const sperrfristStart = new Date(referenceDate);
    const sperrfristEnd = addMonths(sperrfristStart, 6);

    return {
      is_eligible: false,
      eligibility_date: formatDate(sperrfristEnd),
      sperrfrist_days: Math.ceil((sperrfristEnd.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)),
      sperrfrist_start: formatDate(sperrfristStart),
      sperrfrist_end: formatDate(sperrfristEnd),
      calculation_reason: 'Keine Daten zu Abmeldung/letztem Spiel - konservative Berechnung',
      applied_rule: '§ 16 SpO (Senioren) - 6 Monate Sperrfrist'
    };
  }

  // Finde das späteste Datum (MAX)
  const sperrfristStart = new Date(Math.max(...dates.map(d => d.getTime())));

  // Berechne Ende der Sperrfrist: +6 Monate
  const sperrfristEnd = addMonths(sperrfristStart, 6);

  // Prüfe ob Spieler bereits spielberechtigt ist
  const isEligible = referenceDate >= sperrfristEnd;

  // Berechne verbleibende Tage
  const daysRemaining = Math.ceil((sperrfristEnd.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));

  return {
    is_eligible: isEligible,
    eligibility_date: formatDate(sperrfristEnd),
    sperrfrist_days: Math.max(0, daysRemaining),
    sperrfrist_start: formatDate(sperrfristStart),
    sperrfrist_end: formatDate(sperrfristEnd),
    calculation_reason: isEligible
      ? 'Sperrfrist ist abgelaufen - Spieler ist spielberechtigt'
      : `Sperrfrist läuft noch ${daysRemaining} Tage`,
    applied_rule: '§ 16 SpO (Senioren) - 6 Monate Sperrfrist'
  };
}

/**
 * Parse ein Datum-String (YYYY-MM-DD) als lokales Datum (ohne Timezone-Probleme)
 */
function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formatiert ein Date-Objekt als YYYY-MM-DD String
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Hilfsfunktion: Addiert Monate zu einem Datum
 *
 * Beispiel: 31.12.2025 + 6 Monate = 30.06.2026 (letzter Tag im Juni)
 * Beispiel: 31.01.2026 + 1 Monat = 28.02.2026 (letzter Tag im Februar)
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const targetMonth = (result.getMonth() + months) % 12;

  result.setMonth(result.getMonth() + months);

  // Prüfe ob wir in den falschen Monat gerutscht sind (durch Overflow)
  const actualMonth = result.getMonth();
  if (actualMonth !== targetMonth) {
    // Wir sind zu weit - setze auf letzten Tag des Zielmonats
    result.setDate(0);
  }

  return result;
}

/**
 * Prüft ob ein Spieler als Senior gilt (18+ Jahre)
 */
export function isSenior(birthDate: string, referenceDate?: string): boolean {
  const birth = new Date(birthDate);
  const reference = referenceDate ? new Date(referenceDate) : new Date();

  const age = reference.getFullYear() - birth.getFullYear();
  const monthDiff = reference.getMonth() - birth.getMonth();
  const dayDiff = reference.getDate() - birth.getDate();

  // Präzise Altersberechnung
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    return age - 1 >= 18;
  }

  return age >= 18;
}
