/**
 * Unit Tests für Senior Calculator (§ 16 SpO)
 */

import { describe, it, expect } from 'vitest';
import { calculateSeniorEligibility, isSenior } from '../senior-calculator';
import { RegistrationReason } from '@packages/shared-types';

describe('Senior Calculator', () => {
  describe('calculateSeniorEligibility', () => {
    // Test 1: Erstanmeldung - sofort spielberechtigt
    it('should allow immediate eligibility for new players without previous team', () => {
      const result = calculateSeniorEligibility({
        player_birth_date: '1995-06-15',
        registration_reason: RegistrationReason.NEW_PLAYER,
        reference_date: '2026-03-04'
      });

      expect(result.is_eligible).toBe(true);
      expect(result.sperrfrist_days).toBe(0);
      expect(result.applied_rule).toContain('Erstanmeldung');
    });

    // Test 2: Transfer mit Abmeldedatum - 6 Monate Sperrfrist
    it('should calculate 6 months blocking period from deregistration date', () => {
      const result = calculateSeniorEligibility({
        player_birth_date: '1990-03-20',
        registration_reason: RegistrationReason.TRANSFER,
        previous_team_deregistration_date: '2025-12-31',
        reference_date: '2026-03-04'
      });

      expect(result.is_eligible).toBe(false);
      expect(result.eligibility_date).toBe('2026-06-30'); // 31.12.2025 + 6 Monate = 30.06.2026 (Juni hat nur 30 Tage)
      expect(result.sperrfrist_start).toBe('2025-12-31');
      expect(result.sperrfrist_end).toBe('2026-06-30');
      expect(result.applied_rule).toContain('§ 16 SpO');
    });

    // Test 3: Transfer mit letztem Spiel - 6 Monate Sperrfrist
    it('should calculate 6 months blocking period from last game', () => {
      const result = calculateSeniorEligibility({
        player_birth_date: '1988-08-10',
        registration_reason: RegistrationReason.TRANSFER,
        previous_team_last_game: '2025-10-15',
        reference_date: '2026-03-04'
      });

      expect(result.is_eligible).toBe(false);
      expect(result.eligibility_date).toBe('2026-04-15'); // 15.10.2025 + 6 Monate = 15.04.2026
      expect(result.sperrfrist_days).toBeGreaterThan(0);
    });

    // Test 4: MAX von Abmeldung und letztem Spiel - nimmt das spätere Datum
    it('should use the later date (MAX) of deregistration and last game', () => {
      const result = calculateSeniorEligibility({
        player_birth_date: '1992-05-05',
        registration_reason: RegistrationReason.TRANSFER,
        previous_team_deregistration_date: '2025-11-01', // Früher
        previous_team_last_game: '2025-12-15', // Später (wird verwendet)
        reference_date: '2026-03-04'
      });

      expect(result.sperrfrist_start).toBe('2025-12-15'); // Späteres Datum
      expect(result.eligibility_date).toBe('2026-06-15'); // 15.12.2025 + 6 Monate = 15.06.2026
    });

    // Test 5: Bereits abgelaufene Sperrfrist - Spieler ist berechtigt
    it('should mark player as eligible when blocking period expired', () => {
      const result = calculateSeniorEligibility({
        player_birth_date: '1993-02-10',
        registration_reason: RegistrationReason.TRANSFER,
        previous_team_deregistration_date: '2025-06-01',
        reference_date: '2026-03-04' // Mehr als 6 Monate später
      });

      expect(result.is_eligible).toBe(true);
      expect(result.eligibility_date).toBe('2025-12-01'); // 01.06.2025 + 6 Monate
      expect(result.sperrfrist_days).toBe(0);
      expect(result.calculation_reason).toContain('abgelaufen');
    });

    // Test 6: Keine Daten vorhanden - konservative Berechnung
    it('should use conservative calculation when no dates provided', () => {
      const result = calculateSeniorEligibility({
        player_birth_date: '1989-11-20',
        registration_reason: RegistrationReason.TRANSFER,
        reference_date: '2026-03-04'
      });

      expect(result.is_eligible).toBe(false);
      expect(result.eligibility_date).toBe('2026-09-04'); // 04.03.2026 + 6 Monate = 04.09.2026
      expect(result.calculation_reason).toContain('konservative Berechnung');
    });

    // Test 7: Edge Case - Monatsende (31. März + 6 Monate = 30. September)
    it('should handle month-end edge cases correctly', () => {
      const result = calculateSeniorEligibility({
        player_birth_date: '1991-07-30',
        registration_reason: RegistrationReason.TRANSFER,
        previous_team_deregistration_date: '2025-08-31',
        reference_date: '2026-03-04'
      });

      // 31.08.2025 + 6 Monate = 28.02.2026 (Februar hat nur 28 Tage)
      expect(result.eligibility_date).toBe('2026-02-28');
    });
  });

  describe('isSenior', () => {
    it('should return true for players 18 years or older', () => {
      expect(isSenior('2008-03-04', '2026-03-04')).toBe(true); // Genau 18 Jahre
      expect(isSenior('2000-01-01', '2026-03-04')).toBe(true); // 26 Jahre
      expect(isSenior('1995-12-31', '2026-03-04')).toBe(true); // 30+ Jahre
    });

    it('should return false for players under 18 years', () => {
      expect(isSenior('2008-03-05', '2026-03-04')).toBe(false); // 1 Tag zu jung
      expect(isSenior('2010-06-15', '2026-03-04')).toBe(false); // 15 Jahre
      expect(isSenior('2015-01-01', '2026-03-04')).toBe(false); // 11 Jahre
    });

    it('should handle month/day edge cases correctly', () => {
      // Geburtstag noch nicht gewesen in diesem Jahr
      expect(isSenior('2008-03-05', '2026-03-04')).toBe(false); // Wird erst morgen 18
      expect(isSenior('2008-04-01', '2026-03-04')).toBe(false); // Wird erst in 1 Monat 18

      // Geburtstag bereits gewesen
      expect(isSenior('2008-03-03', '2026-03-04')).toBe(true); // Wurde gestern 18
      expect(isSenior('2008-01-01', '2026-03-04')).toBe(true); // Wurde vor 2 Monaten 18
    });
  });
});
