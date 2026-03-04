/**
 * Unit Tests für Validators
 */

import { describe, it, expect } from 'vitest';
import {
  validateIBAN,
  validatePLZ,
  validateDate,
  validateBirthDate,
  validateEmail,
  validatePhone,
  validatePlayerName,
  validateDFBID
} from '../index';

describe('Validators', () => {
  describe('validateIBAN', () => {
    it('should accept valid German IBANs', () => {
      const result1 = validateIBAN('DE89370400440532013000');
      expect(result1.is_valid).toBe(true);
      expect(result1.errors).toHaveLength(0);

      // Mit Leerzeichen
      const result2 = validateIBAN('DE89 3704 0044 0532 0130 00');
      expect(result2.is_valid).toBe(true);
    });

    it('should reject invalid IBAN format', () => {
      const result = validateIBAN('DE1234'); // Zu kurz
      expect(result.is_valid).toBe(false);
      expect(result.errors[0].code).toBe('IBAN_INVALID_FORMAT');
    });

    it('should reject IBAN with invalid checksum', () => {
      const result = validateIBAN('DE89370400440532013099'); // Falsche Prüfziffer
      expect(result.is_valid).toBe(false);
      expect(result.errors[0].code).toBe('IBAN_INVALID_CHECKSUM');
    });

    it('should reject non-German IBANs', () => {
      const result = validateIBAN('FR1420041010050500013M02606'); // Französische IBAN
      expect(result.is_valid).toBe(false);
      expect(result.errors[0].code).toBe('IBAN_INVALID_FORMAT');
    });
  });

  describe('validatePLZ', () => {
    it('should accept valid 5-digit PLZ', () => {
      expect(validatePLZ('50667').is_valid).toBe(true);
      expect(validatePLZ('10115').is_valid).toBe(true);
      expect(validatePLZ('80331').is_valid).toBe(true);
    });

    it('should reject invalid PLZ formats', () => {
      expect(validatePLZ('1234').is_valid).toBe(false); // Zu kurz
      expect(validatePLZ('123456').is_valid).toBe(false); // Zu lang
      expect(validatePLZ('ABCDE').is_valid).toBe(false); // Keine Ziffern
      expect(validatePLZ('50 667').is_valid).toBe(false); // Leerzeichen
    });
  });

  describe('validateDate', () => {
    it('should accept valid ISO 8601 dates', () => {
      expect(validateDate('2026-03-04').is_valid).toBe(true);
      expect(validateDate('2000-01-01').is_valid).toBe(true);
      expect(validateDate('2025-12-31').is_valid).toBe(true);
    });

    it('should reject invalid date formats', () => {
      expect(validateDate('04.03.2026').is_valid).toBe(false); // Falsches Format
      expect(validateDate('2026/03/04').is_valid).toBe(false); // Slashes statt Bindestriche
      expect(validateDate('2026-3-4').is_valid).toBe(false); // Fehlende führende Nullen
    });

    it('should reject impossible dates', () => {
      expect(validateDate('2026-02-30').is_valid).toBe(false); // 30. Februar existiert nicht
      expect(validateDate('2026-13-01').is_valid).toBe(false); // Monat 13 existiert nicht
    });
  });

  describe('validateBirthDate', () => {
    it('should accept valid birth dates', () => {
      expect(validateBirthDate('2000-06-15').is_valid).toBe(true);
      expect(validateBirthDate('1990-01-01').is_valid).toBe(true);
    });

    it('should reject future birth dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      const result = validateBirthDate(futureDateStr);
      expect(result.is_valid).toBe(false);
      expect(result.errors[0].code).toBe('BIRTH_DATE_FUTURE');
    });

    it('should reject unrealistically old birth dates', () => {
      const result = validateBirthDate('1800-01-01');
      expect(result.is_valid).toBe(false);
      expect(result.errors[0].code).toBe('BIRTH_DATE_TOO_OLD');
    });
  });

  describe('validateEmail', () => {
    it('should accept valid email addresses', () => {
      expect(validateEmail('test@example.com').is_valid).toBe(true);
      expect(validateEmail('user.name+tag@example.co.uk').is_valid).toBe(true);
      expect(validateEmail('info@cfb-niehl.de').is_valid).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid').is_valid).toBe(false);
      expect(validateEmail('@example.com').is_valid).toBe(false);
      expect(validateEmail('user@').is_valid).toBe(false);
      expect(validateEmail('user @example.com').is_valid).toBe(false); // Leerzeichen
    });
  });

  describe('validatePhone', () => {
    it('should accept valid German phone numbers', () => {
      expect(validatePhone('+49 123 456789').is_valid).toBe(true);
      expect(validatePhone('+49123456789').is_valid).toBe(true);
      expect(validatePhone('0123 456789').is_valid).toBe(true);
      expect(validatePhone('0123456789').is_valid).toBe(true);
      expect(validatePhone('+491234567890').is_valid).toBe(true); // Länger
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123456').is_valid).toBe(false); // Zu kurz
      expect(validatePhone('+1 123 456789').is_valid).toBe(false); // Nicht DE
      expect(validatePhone('ABC123456789').is_valid).toBe(false); // Buchstaben
    });
  });

  describe('validatePlayerName', () => {
    it('should accept valid player names', () => {
      expect(validatePlayerName('Max Mustermann').is_valid).toBe(true);
      expect(validatePlayerName('Anna-Maria Schmidt').is_valid).toBe(true);
      expect(validatePlayerName('Müller').is_valid).toBe(true); // Umlaute
      expect(validatePlayerName('O\'Brien').is_valid).toBe(false); // Apostroph nicht erlaubt
    });

    it('should reject invalid player names', () => {
      expect(validatePlayerName('AB').is_valid).toBe(false); // Zu kurz
      expect(validatePlayerName('Max123').is_valid).toBe(false); // Zahlen
      expect(validatePlayerName('Max@Mustermann').is_valid).toBe(false); // Sonderzeichen
    });
  });

  describe('validateDFBID', () => {
    it('should accept valid DFBnet IDs', () => {
      expect(validateDFBID('DFB-2008-12345').is_valid).toBe(true);
      expect(validateDFBID('12345678').is_valid).toBe(true);
      expect(validateDFBID('DFBNET-A19-2026').is_valid).toBe(true);
    });

    it('should reject invalid DFBnet IDs', () => {
      expect(validateDFBID('ABC').is_valid).toBe(false); // Zu kurz
      expect(validateDFBID('DFB_ID_123').is_valid).toBe(false); // Unterstrich nicht erlaubt
      expect(validateDFBID('DFB ID 123').is_valid).toBe(false); // Leerzeichen
    });
  });
});
