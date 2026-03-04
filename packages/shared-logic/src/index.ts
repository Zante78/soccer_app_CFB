/**
 * Shared Logic Package
 *
 * Business Logic für CFB Pass-Automation:
 * - Sperrfristen-Berechnung (§ 16 SpO, § 20 JSpO)
 * - Validierungs-Funktionen (IBAN, PLZ, Email, etc.)
 */

// Eligibility Calculators
export {
  calculateEligibility,
  isEligible,
  getDaysUntilEligible,
  type EligibilityCalculatorInput
} from './eligibility';

export {
  calculateSeniorEligibility,
  isSenior,
  type SeniorCalculatorInput
} from './eligibility/senior-calculator';

export {
  calculateJuniorEligibility,
  isJunior,
  getAgeClass,
  type JuniorCalculatorInput
} from './eligibility/junior-calculator';

// Validators
export {
  validators,
  validateIBAN,
  validatePLZ,
  validateDate,
  validateBirthDate,
  validateEmail,
  validatePhone,
  validatePlayerName,
  validateDFBID
} from './validators';
