/**
 * Unit Tests für Junior Calculator (§ 20 JSpO)
 */

import { describe, it, expect } from 'vitest';
import { calculateJuniorEligibility, isJunior, getAgeClass } from '../junior-calculator';
import { RegistrationReason } from '@packages/shared-types';

describe('Junior Calculator', () => {
  describe('calculateJuniorEligibility', () => {
    // Test 1: Erstanmeldung - sofort spielberechtigt
    it('should allow immediate eligibility for new players without previous team', () => {
      const result = calculateJuniorEligibility({
        player_birth_date: '2010-05-10',
        registration_reason: RegistrationReason.NEW_PLAYER,
        reference_date: '2026-03-04'
      });

      expect(result.is_eligible).toBe(true);
      expect(result.sperrfrist_days).toBe(0);
      expect(result.applied_rule).toContain('Erstanmeldung');
    });

    // Test 2: U11 Transfer - 1 Monat Sperrfrist
    it('should calculate 1 month blocking period for U11 transfer', () => {
      const result = calculateJuniorEligibility({
        player_birth_date: '2015-08-20', // U11 in 2026 (wird 10 am 01.01.2026)
        registration_reason: RegistrationReason.TRANSFER,
        previous_team_deregistration_date: '2026-02-01',
        reference_date: '2026-03-04'
      });

      expect(result.eligibility_date).toBe('2026-03-01'); // 01.02.2026 + 1 Monat
      expect(result.is_eligible).toBe(true); // 03.04 ist nach 01.03
      expect(result.applied_rule).toContain('U11');
      expect(result.applied_rule).toContain('1 Monat');
    });

    // Test 3: U14 Transfer - 2 Monate Sperrfrist
    it('should calculate 2 months blocking period for U14 transfer', () => {
      const result = calculateJuniorEligibility({
        player_birth_date: '2012-06-15', // U14 in 2026 (wird 13 am 01.01.2026)
        registration_reason: RegistrationReason.TRANSFER,
        previous_team_deregistration_date: '2026-01-15',
        reference_date: '2026-03-04'
      });

      expect(result.is_eligible).toBe(false);
      expect(result.eligibility_date).toBe('2026-03-15'); // 15.01.2026 + 2 Monate
      expect(result.applied_rule).toContain('U14');
      expect(result.applied_rule).toContain('2 Monat');
    });

    // Test 4: U17 Transfer - 3 Monate Sperrfrist
    it('should calculate 3 months blocking period for U17 transfer', () => {
      const result = calculateJuniorEligibility({
        player_birth_date: '2009-03-10', // U17 in 2026 (wird 16 am 01.01.2026)
        registration_reason: RegistrationReason.TRANSFER,
        previous_team_deregistration_date: '2025-12-01',
        reference_date: '2026-03-04'
      });

      expect(result.eligibility_date).toBe('2026-03-01'); // 01.12.2025 + 3 Monate
      expect(result.is_eligible).toBe(true); // 04.03 ist nach 01.03
      expect(result.applied_rule).toContain('U17');
      expect(result.applied_rule).toContain('3 Monat');
    });

    // Test 5: MAX von Abmeldung und letztem Spiel
    it('should use the later date (MAX) of deregistration and last game', () => {
      const result = calculateJuniorEligibility({
        player_birth_date: '2013-04-20',
        registration_reason: RegistrationReason.TRANSFER,
        previous_team_deregistration_date: '2026-01-01', // Früher
        previous_team_last_game: '2026-01-20', // Später
        reference_date: '2026-03-04'
      });

      expect(result.sperrfrist_start).toBe('2026-01-20'); // Späteres Datum
    });

    // Test 6: Hinrunden-Wechsel für U8-U12 - keine Sperrfrist
    it('should allow immediate eligibility for U8-U12 transfer in first half season', () => {
      const result = calculateJuniorEligibility({
        player_birth_date: '2016-05-10', // U11
        registration_reason: RegistrationReason.TRANSFER,
        previous_team_deregistration_date: '2025-08-15', // August = Hinrunde
        reference_date: '2025-09-01' // September = noch Hinrunde
      });

      expect(result.is_eligible).toBe(true);
      expect(result.sperrfrist_days).toBe(0);
      expect(result.applied_rule).toContain('Hinrunden-Wechsel');
    });

    // Test 7: Hinrunden-Wechsel für U13+ - normale Sperrfrist
    it('should apply normal blocking period for U13+ even in first half season', () => {
      const result = calculateJuniorEligibility({
        player_birth_date: '2012-05-10', // U15
        registration_reason: RegistrationReason.TRANSFER,
        previous_team_deregistration_date: '2025-08-15', // August = Hinrunde
        reference_date: '2025-09-01'
      });

      expect(result.is_eligible).toBe(false);
      expect(result.eligibility_date).toBe('2025-10-15'); // 2 Monate Sperrfrist
    });

    // Test 8: Bereits abgelaufene Sperrfrist
    it('should mark player as eligible when blocking period expired', () => {
      const result = calculateJuniorEligibility({
        player_birth_date: '2010-08-10',
        registration_reason: RegistrationReason.TRANSFER,
        previous_team_deregistration_date: '2025-06-01',
        reference_date: '2026-03-04' // Weit nach Sperrfrist
      });

      expect(result.is_eligible).toBe(true);
      expect(result.sperrfrist_days).toBe(0);
    });
  });

  describe('getAgeClass', () => {
    it('should calculate correct U-class based on age on January 1st', () => {
      // Saison 2025/26: Stichtag ist 01.01.2026
      expect(getAgeClass(new Date('2008-06-15'), new Date('2025-09-01'))).toBe('U18'); // Wird 17 am 01.01.2026
      expect(getAgeClass(new Date('2010-03-20'), new Date('2025-09-01'))).toBe('U16'); // Wird 15 am 01.01.2026
      expect(getAgeClass(new Date('2015-08-10'), new Date('2025-09-01'))).toBe('U11'); // Wird 10 am 01.01.2026
    });

    it('should handle birth dates before and after season cutoff', () => {
      // Spieler geboren 2010-12-31 wird am 01.01.2026 genau 15 Jahre alt → U16
      expect(getAgeClass(new Date('2010-12-31'), new Date('2025-09-01'))).toBe('U16');

      // Spieler geboren 2010-01-02 wird am 01.01.2026 genau 15 Jahre alt → U16
      expect(getAgeClass(new Date('2010-01-02'), new Date('2025-09-01'))).toBe('U16');
    });

    it('should clamp age classes to U8-U19 range', () => {
      // Zu jung (wird 5 Jahre alt) → U8 (minimum)
      expect(getAgeClass(new Date('2020-06-15'), new Date('2025-09-01'))).toBe('U8');

      // Zu alt (wird 22 Jahre alt) → U19 (maximum)
      expect(getAgeClass(new Date('2004-01-01'), new Date('2025-09-01'))).toBe('U19');
    });

    it('should consider season year correctly (July cutoff)', () => {
      // Vor Juli: Aktuelles Jahr als Stichtag
      expect(getAgeClass(new Date('2010-06-15'), new Date('2025-06-30'))).toBe('U15'); // Stichtag: 01.01.2025

      // Nach Juli: Nächstes Jahr als Stichtag
      expect(getAgeClass(new Date('2010-06-15'), new Date('2025-07-01'))).toBe('U16'); // Stichtag: 01.01.2026
    });
  });

  describe('isJunior', () => {
    it('should return true for players under 18 years', () => {
      expect(isJunior('2010-06-15', '2026-03-04')).toBe(true); // 15 Jahre
      expect(isJunior('2008-03-05', '2026-03-04')).toBe(true); // 17 Jahre (noch nicht 18)
      expect(isJunior('2015-01-01', '2026-03-04')).toBe(true); // 11 Jahre
    });

    it('should return false for players 18 years or older', () => {
      expect(isJunior('2008-03-04', '2026-03-04')).toBe(false); // Genau 18 heute
      expect(isJunior('2000-06-15', '2026-03-04')).toBe(false); // 25 Jahre
      expect(isJunior('1995-12-31', '2026-03-04')).toBe(false); // 30+ Jahre
    });

    it('should handle birthday edge cases', () => {
      // Wird heute 18
      expect(isJunior('2008-03-04', '2026-03-04')).toBe(false);

      // Wird morgen 18
      expect(isJunior('2008-03-05', '2026-03-04')).toBe(true);

      // Wurde gestern 18
      expect(isJunior('2008-03-03', '2026-03-04')).toBe(false);
    });
  });
});
