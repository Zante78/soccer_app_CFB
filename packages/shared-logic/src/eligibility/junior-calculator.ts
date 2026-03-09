/**
 * Junior Calculator - Sperrfristen-Berechnung nach § 20 JSpO
 *
 * Regel: Spieler ist spielberechtigt nach MAX(Abmeldedatum, letztes Spiel) + X Monate
 * X variiert nach Altersklasse:
 * - U8 bis U12: 1 Monat
 * - U13 bis U16: 2 Monate
 * - U17 bis U19: 3 Monate
 *
 * Anwendbar für: Junioren (unter 18 Jahre)
 */

import type { EligibilityResult, RegistrationReason } from '@packages/shared-types';

export interface JuniorCalculatorInput {
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
 * Altersklassen-Mapping für Sperrfristen
 */
const AGE_CLASS_BLOCKING_PERIODS: Record<string, number> = {
  'U8': 1,
  'U9': 1,
  'U10': 1,
  'U11': 1,
  'U12': 1,
  'U13': 2,
  'U14': 2,
  'U15': 2,
  'U16': 2,
  'U17': 3,
  'U18': 3,
  'U19': 3
};

/**
 * Berechnet die Spielberechtigung für Junioren nach § 20 JSpO
 */
export function calculateJuniorEligibility(input: JuniorCalculatorInput): EligibilityResult {
  const referenceDate = input.reference_date ? parseDate(input.reference_date) : new Date();
  const birthDate = parseDate(input.player_birth_date);

  // Ermittle Altersklasse (U-Klasse)
  const ageClass = getAgeClass(birthDate, referenceDate);
  const blockingMonths = AGE_CLASS_BLOCKING_PERIODS[ageClass] || 3; // Fallback: 3 Monate

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
      applied_rule: `§ 20 JSpO (${ageClass}) - Erstanmeldung`
    };
  }

  // Sonderregel: Wechsel innerhalb der Hinrunde (01.07 - 31.12)
  const isFirstHalfSeason = referenceDate.getMonth() >= 6 && referenceDate.getMonth() <= 11;
  if (isFirstHalfSeason && input.registration_reason === 'TRANSFER') {
    // Bei Wechsel in Hinrunde: Verkürzte Sperrfrist (0 Monate für U8-U12, sonst normal)
    if (blockingMonths === 1) {
      return {
        is_eligible: true,
        eligibility_date: formatDate(referenceDate),
        sperrfrist_days: 0,
        sperrfrist_start: formatDate(referenceDate),
        sperrfrist_end: formatDate(referenceDate),
        calculation_reason: 'Wechsel in Hinrunde - keine Sperrfrist für U8-U12',
        applied_rule: `§ 20 JSpO (${ageClass}) - Hinrunden-Wechsel`
      };
    }
  }

  // Ermittle Startdatum für Sperrfrist (MAX von Abmeldung und letztem Spiel)
  const dates: Date[] = [];

  if (input.previous_team_deregistration_date) {
    dates.push(parseDate(input.previous_team_deregistration_date));
  }

  if (input.previous_team_last_game) {
    dates.push(parseDate(input.previous_team_last_game));
  }

  // Fallback: Wenn keine Daten vorhanden, verwende konservative Schätzung
  if (dates.length === 0) {
    const sperrfristStart = new Date(referenceDate);
    const sperrfristEnd = addMonths(sperrfristStart, blockingMonths);

    return {
      is_eligible: false,
      eligibility_date: formatDate(sperrfristEnd),
      sperrfrist_days: Math.ceil((sperrfristEnd.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)),
      sperrfrist_start: formatDate(sperrfristStart),
      sperrfrist_end: formatDate(sperrfristEnd),
      calculation_reason: 'Keine Daten zu Abmeldung/letztem Spiel - konservative Berechnung',
      applied_rule: `§ 20 JSpO (${ageClass}) - ${blockingMonths} Monat(e) Sperrfrist`
    };
  }

  // Finde das späteste Datum (MAX)
  const sperrfristStart = new Date(Math.max(...dates.map(d => d.getTime())));

  // Berechne Ende der Sperrfrist: +X Monate
  const sperrfristEnd = addMonths(sperrfristStart, blockingMonths);

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
    applied_rule: `§ 20 JSpO (${ageClass}) - ${blockingMonths} Monat(e) Sperrfrist`
  };
}

/**
 * Parse ein Datum-String (YYYY-MM-DD) als lokales Datum (ohne Timezone-Probleme)
 */
function parseDate(dateStr: string | null | undefined): Date {
  if (!dateStr) {
    throw new Error('Datum fehlt: parseDate() erwartet einen gültigen Datum-String (YYYY-MM-DD)');
  }
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
 * Ermittelt die Altersklasse (U8 bis U19) basierend auf Geburtsdatum und Stichtag
 *
 * Stichtag für Altersklassen: 01.01. des Jahres
 * Beispiel: Ein Spieler geboren am 15.05.2008 ist in der Saison 2025/26 in der U18
 * (Alter am 01.01.2026 = 17 Jahre, also U18)
 */
export function getAgeClass(birthDate: Date, referenceDate: Date): string {
  // Stichtag: 01.01. des nächsten Jahres (für laufende Saison)
  const seasonYear = referenceDate.getMonth() >= 6
    ? referenceDate.getFullYear() + 1 // Nach Juli: Nächstes Jahr
    : referenceDate.getFullYear(); // Vor Juli: Aktuelles Jahr

  const stichtag = new Date(seasonYear, 0, 1); // 01.01.

  // Berechne Alter am Stichtag
  let age = stichtag.getFullYear() - birthDate.getFullYear();
  const monthDiff = stichtag.getMonth() - birthDate.getMonth();
  const dayDiff = stichtag.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age = age - 1;
  }

  // U-Klasse ist "Alter + 1" (Spieler wird während der Saison dieses Alter)
  const uClass = age + 1;

  // Begrenze auf U8 bis U19
  const clampedClass = Math.max(8, Math.min(19, uClass));

  return `U${clampedClass}`;
}

/**
 * Hilfsfunktion: Addiert Monate zu einem Datum
 *
 * Beispiel: 31.12.2025 + 1 Monat = 31.01.2026
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
 * Prüft ob ein Spieler als Junior gilt (unter 18 Jahre)
 */
export function isJunior(birthDate: string, referenceDate?: string): boolean {
  const birth = new Date(birthDate);
  const reference = referenceDate ? new Date(referenceDate) : new Date();

  const age = reference.getFullYear() - birth.getFullYear();
  const monthDiff = reference.getMonth() - birth.getMonth();
  const dayDiff = reference.getDate() - birth.getDate();

  // Präzise Altersberechnung
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    return age - 1 < 18;
  }

  return age < 18;
}
