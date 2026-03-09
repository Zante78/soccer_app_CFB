/**
 * DFBnet CSS Selectors — Central Configuration
 *
 * All selectors are [PLACEHOLDER] values based on typical German
 * government web application patterns. Update with real values after
 * inspecting DFBnet with DevTools (F12).
 *
 * Discovery workflow:
 *   1. Set BOT_HEADLESS=false in .env
 *   2. Run: npx tsx src/test/test-login.ts
 *   3. Inspect failed selectors with DevTools
 *   4. Update this file with real values
 *   5. Re-run test
 */

export const SELECTORS = {
  // ===== Login Page =====
  login: {
    /** [PLACEHOLDER] Username input field */
    usernameInput: '#kennung', // Fallback: 'input[name="kennung"]'

    /** [PLACEHOLDER] Password input field */
    passwordInput: '#passwort', // Fallback: 'input[name="passwort"]'

    /** [PLACEHOLDER] Login submit button */
    submitButton: '#loginButton', // Fallback: 'button[type="submit"]'

    /** [PLACEHOLDER] Login error message container */
    errorMessage: '.login-error', // Fallback: '.alert-danger'

    /** [PLACEHOLDER] 2FA OTP input field (only visible if 2FA is active) */
    twoFactorInput: '#otp-code', // Fallback: 'input[name="otp"]'

    /** [PLACEHOLDER] 2FA submit button */
    twoFactorSubmit: '#otp-submit', // Fallback: 'button.otp-submit'
  },

  // ===== Dashboard (after login) =====
  dashboard: {
    /** [PLACEHOLDER] Element that confirms successful login */
    welcomeElement: '.dashboard-welcome', // Fallback: '#hauptmenue'

    /** [PLACEHOLDER] Navigation link: Spielerverwaltung */
    spielerverwaltungLink: 'a[href*="spielerverwaltung"]', // Fallback: '#nav-spielerverwaltung'

    /** [PLACEHOLDER] Sub-link: Spielerpass beantragen */
    spielerpassBeantragen: 'a[href*="spielerpass"]', // Fallback: '#nav-spielerpass-beantragen'

    /** [PLACEHOLDER] Direct URL path to Spielerpass form (relative to base URL) */
    spielerpassFormPath: '/spielerverwaltung/spielerpass/neu',
  },

  // ===== Spielerpass Form =====
  spielerpassForm: {
    /** [PLACEHOLDER] Form container element */
    formContainer: '#spielerpass-form', // Fallback: 'form.spielerpass'

    /** [PLACEHOLDER] Player first name */
    firstName: '#vorname', // Fallback: 'input[name="vorname"]'

    /** [PLACEHOLDER] Player last name */
    lastName: '#nachname', // Fallback: 'input[name="nachname"]'

    /** [PLACEHOLDER] Player birth date (DD.MM.YYYY format) */
    birthDate: '#geburtsdatum', // Fallback: 'input[name="geburtsdatum"]'

    /** [PLACEHOLDER] Team/Mannschaft dropdown */
    team: '#mannschaft', // Fallback: 'select[name="mannschaft"]'

    /** [PLACEHOLDER] Registration number (optional) */
    registrationNumber: '#spielernummer', // Fallback: 'input[name="spielernummer"]'

    /** [PLACEHOLDER] Registration reason dropdown */
    reason: '#antragsgrund', // Fallback: 'select[name="antragsgrund"]'

    /** [PLACEHOLDER] Previous team name (for transfers) */
    previousTeam: '#vorheriger-verein', // Fallback: 'input[name="vorheriger_verein"]'

    /** [PLACEHOLDER] Deregistration date from previous team */
    deregistrationDate: '#abmeldedatum', // Fallback: 'input[name="abmeldedatum"]'

    /** [PLACEHOLDER] Photo upload input */
    photoUpload: 'input[name="foto"]', // Fallback: '#foto-upload input[type="file"]'

    /** [PLACEHOLDER] Document upload input */
    documentUpload: 'input[name="dokument"]', // Fallback: '#dokument-upload input[type="file"]'

    /** [PLACEHOLDER] Save as draft button — SAFETY CRITICAL */
    saveDraftButton: '#entwurf-speichern', // Fallback: 'button:has-text("Entwurf")'

    /** [PLACEHOLDER] Submit/Absenden button — NEVER CLICK THIS */
    submitButton: '#antrag-absenden', // Fallback: 'button:has-text("Absenden")'

    /** [PLACEHOLDER] Success message after saving draft */
    successMessage: '.success-message', // Fallback: '.alert-success'

    /** [PLACEHOLDER] Draft URL element (link or text containing the draft URL) */
    draftUrlElement: '.draft-url a', // Fallback: '.success-message a'
  },

  // ===== Common Elements =====
  common: {
    /** [PLACEHOLDER] Cookie consent banner */
    cookieBanner: '#cookie-banner', // Fallback: '.cookie-consent'

    /** [PLACEHOLDER] Cookie accept button */
    cookieAccept: '#cookie-accept', // Fallback: '.cookie-consent button.accept'

    /** [PLACEHOLDER] Loading spinner/overlay */
    loadingSpinner: '.loading-spinner', // Fallback: '.overlay-loading'

    /** [PLACEHOLDER] Session timeout modal */
    sessionTimeoutModal: '#session-timeout', // Fallback: '.modal-session-expired'
  },
} as const;

/**
 * Registration reason mapping: Internal enum → DFBnet dropdown label
 *
 * [PLACEHOLDER] — Update with actual DFBnet dropdown option values
 */
export const REASON_LABELS: Record<string, string> = {
  NEW_PLAYER: 'Erstanmeldung',
  TRANSFER: 'Vereinswechsel',
  RE_REGISTRATION: 'Wiederanmeldung',
  INTERNATIONAL_TRANSFER: 'Internationaler Transfer',
};

/**
 * Timeout values for different page interactions (in ms)
 */
export const TIMEOUTS = {
  /** Page navigation timeout */
  navigation: 60_000,
  /** Element visibility wait */
  elementVisible: 10_000,
  /** File upload completion */
  fileUpload: 30_000,
  /** Form save operation */
  formSave: 30_000,
  /** Login race condition (dashboard vs 2FA vs error) */
  loginRace: 30_000,
} as const;
