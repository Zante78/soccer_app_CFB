/**
 * Validators Package
 *
 * Validierungs-Funktionen für Formulardaten
 */

import type { ValidationResult, ValidationError } from '@packages/shared-types';

// ===== IBAN VALIDATION =====

/**
 * Validiert eine deutsche IBAN (DE + 20 Ziffern)
 *
 * Prüft:
 * - Format (DE + 20 Ziffern)
 * - IBAN Prüfziffer (Modulo 97)
 */
export function validateIBAN(iban: string): ValidationResult {
  const errors: ValidationError[] = [];

  // Entferne Leerzeichen und konvertiere zu Uppercase
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();

  // Prüfe Format: DE + 20 Ziffern
  if (!cleanIBAN.match(/^DE\d{20}$/)) {
    errors.push({
      field: 'iban',
      message: 'IBAN muss im Format DE + 20 Ziffern sein',
      code: 'IBAN_INVALID_FORMAT'
    });
    return { is_valid: false, errors };
  }

  // Prüfe Prüfziffer (Modulo 97 Algorithmus)
  const rearranged = cleanIBAN.slice(4) + cleanIBAN.slice(0, 4);
  const numericIBAN = rearranged.replace(/[A-Z]/g, (char) =>
    (char.charCodeAt(0) - 55).toString()
  );

  // Berechne Modulo 97 für große Zahlen
  let remainder = 0;
  for (let i = 0; i < numericIBAN.length; i++) {
    remainder = (remainder * 10 + parseInt(numericIBAN[i], 10)) % 97;
  }

  if (remainder !== 1) {
    errors.push({
      field: 'iban',
      message: 'IBAN Prüfziffer ist ungültig',
      code: 'IBAN_INVALID_CHECKSUM'
    });
  }

  return { is_valid: errors.length === 0, errors };
}

// ===== PLZ VALIDATION =====

/**
 * Validiert eine deutsche Postleitzahl (5-stellig)
 */
export function validatePLZ(plz: string): ValidationResult {
  const errors: ValidationError[] = [];

  const cleanPLZ = plz.trim();

  if (!cleanPLZ.match(/^\d{5}$/)) {
    errors.push({
      field: 'plz',
      message: 'PLZ muss genau 5 Ziffern enthalten',
      code: 'PLZ_INVALID_FORMAT'
    });
  }

  return { is_valid: errors.length === 0, errors };
}

// ===== DATE VALIDATION =====

/**
 * Validiert ein Datum (ISO 8601: YYYY-MM-DD)
 */
export function validateDate(dateStr: string): ValidationResult {
  const errors: ValidationError[] = [];

  // Prüfe Format
  if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    errors.push({
      field: 'date',
      message: 'Datum muss im Format YYYY-MM-DD sein',
      code: 'DATE_INVALID_FORMAT'
    });
    return { is_valid: false, errors };
  }

  // Parse Datum
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  // Prüfe ob gültiges Datum (JavaScript korrigiert ungültige Daten automatisch)
  if (
    isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    errors.push({
      field: 'date',
      message: 'Ungültiges Datum',
      code: 'DATE_INVALID'
    });
  }

  return { is_valid: errors.length === 0, errors };
}

/**
 * Validiert ein Geburtsdatum (nicht in der Zukunft, nicht zu alt)
 */
export function validateBirthDate(dateStr: string): ValidationResult {
  const dateValidation = validateDate(dateStr);
  if (!dateValidation.is_valid) {
    return dateValidation;
  }

  const errors: ValidationError[] = [];
  const birthDate = new Date(dateStr);
  const today = new Date();

  // Prüfe: Nicht in der Zukunft
  if (birthDate > today) {
    errors.push({
      field: 'birth_date',
      message: 'Geburtsdatum darf nicht in der Zukunft liegen',
      code: 'BIRTH_DATE_FUTURE'
    });
  }

  // Prüfe: Nicht älter als 120 Jahre
  const age = today.getFullYear() - birthDate.getFullYear();
  if (age > 120) {
    errors.push({
      field: 'birth_date',
      message: 'Geburtsdatum ist unrealistisch (älter als 120 Jahre)',
      code: 'BIRTH_DATE_TOO_OLD'
    });
  }

  return { is_valid: errors.length === 0, errors };
}

// ===== EMAIL VALIDATION =====

/**
 * Validiert eine Email-Adresse (RFC 5322 vereinfacht)
 */
export function validateEmail(email: string): ValidationResult {
  const errors: ValidationError[] = [];

  const cleanEmail = email.trim().toLowerCase();

  // Vereinfachte RFC 5322 Regex
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

  if (!emailRegex.test(cleanEmail)) {
    errors.push({
      field: 'email',
      message: 'Ungültige Email-Adresse',
      code: 'EMAIL_INVALID'
    });
  }

  return { is_valid: errors.length === 0, errors };
}

// ===== PHONE VALIDATION =====

/**
 * Validiert eine deutsche Telefonnummer (flexibel)
 *
 * Akzeptiert:
 * - +49 123 456789
 * - 0123 456789
 * - +49123456789
 * - 0123456789
 */
export function validatePhone(phone: string): ValidationResult {
  const errors: ValidationError[] = [];

  const cleanPhone = phone.replace(/\s/g, '');

  // Deutsches Format: +49 oder 0 am Anfang, dann mindestens 9 Ziffern
  const phoneRegex = /^(\+49|0)\d{9,15}$/;

  if (!phoneRegex.test(cleanPhone)) {
    errors.push({
      field: 'phone',
      message: 'Ungültige Telefonnummer (Format: +49 oder 0, dann mindestens 9 Ziffern)',
      code: 'PHONE_INVALID'
    });
  }

  return { is_valid: errors.length === 0, errors };
}

// ===== NAME VALIDATION =====

/**
 * Validiert einen Spielernamen (mindestens 3 Zeichen, nur Buchstaben, Leerzeichen, Bindestriche)
 */
export function validatePlayerName(name: string): ValidationResult {
  const errors: ValidationError[] = [];

  const trimmedName = name.trim();

  if (trimmedName.length < 3) {
    errors.push({
      field: 'player_name',
      message: 'Name muss mindestens 3 Zeichen lang sein',
      code: 'NAME_TOO_SHORT'
    });
  }

  // Erlaubt: Buchstaben, Leerzeichen, Bindestriche, Umlaute
  if (!trimmedName.match(/^[a-zA-ZäöüÄÖÜß\s-]+$/)) {
    errors.push({
      field: 'player_name',
      message: 'Name darf nur Buchstaben, Leerzeichen und Bindestriche enthalten',
      code: 'NAME_INVALID_CHARACTERS'
    });
  }

  return { is_valid: errors.length === 0, errors };
}

// ===== DFB-ID VALIDATION =====

/**
 * Validiert eine DFBnet-ID (Format: beliebig, aber mindestens 5 Zeichen alphanumerisch)
 */
export function validateDFBID(dfbId: string): ValidationResult {
  const errors: ValidationError[] = [];

  const cleanID = dfbId.trim();

  if (cleanID.length < 5) {
    errors.push({
      field: 'dfb_id',
      message: 'DFBnet-ID muss mindestens 5 Zeichen lang sein',
      code: 'DFBID_TOO_SHORT'
    });
  }

  if (!cleanID.match(/^[a-zA-Z0-9-]+$/)) {
    errors.push({
      field: 'dfb_id',
      message: 'DFBnet-ID darf nur Buchstaben, Ziffern und Bindestriche enthalten',
      code: 'DFBID_INVALID_CHARACTERS'
    });
  }

  return { is_valid: errors.length === 0, errors };
}

// ===== EXPORT ALL =====

export const validators = {
  validateIBAN,
  validatePLZ,
  validateDate,
  validateBirthDate,
  validateEmail,
  validatePhone,
  validatePlayerName,
  validateDFBID
};
