/**
 * DFBnet CSS Selectors — Central Configuration
 *
 * VERIFIED via Live-Debug 2026-07-02 gegen DFBnet Version 9.3.0.
 * Quelle: cfb-dfbnet-felder.md + SL-1_R2/R3/R4/R5 Reports.
 *
 * Wenn DFBnet-Update bricht: siehe flows/health-check.ts + Live-Debug-Anleitung
 * unter _stop-the-line/R1-DEBUG-SESSION-ANLEITUNG.md.
 */

export const SELECTORS = {
  // ===== Login Page (verein.dfbnet.org/login/) =====
  // VERIFIED 2026-03-18 + 2026-07-02
  login: {
    /** Benutzername (Login-User) */
    usernameInput: 'input[name="strUserName"]',

    /** Passwort */
    passwordInput: 'input[name="strPass"]',

    /** Kundennummer (dritter Login-Faktor bei DFBnet Verein) */
    customerNumberInput: 'input[name="strShortKey"]',

    /** Anmelden-Link (kein Button — JavaScript-Submit) */
    submitButton: 'a:has-text("Anmelden")',

    /** Login-Error-Anzeige */
    errorMessage: '.errorMessage, .error, [class*="error"]',

    /** 2FA OTP input (falls DFBnet zukünftig 2FA einführt — aktuell inaktiv) */
    twoFactorInput: 'input[name="otp"]',

    /** 2FA submit */
    twoFactorSubmit: 'button[type="submit"]',
  },

  // ===== Dashboard / MegaMenu =====
  // VERIFIED 2026-03-19 + 2026-07-02
  dashboard: {
    /** MegaMenu-Container. Kritisch für gesamte Navigation. */
    welcomeElement: '#mgmenu1',

    /** MegaMenu-Link zu "Neues Mitglied". URLs sind Session-encoded — muss dynamisch aus DOM extrahiert werden. */
    spielerverwaltungLink: '#mgmenu1 a[href*="index.php"]',

    /** Sub-Link "Neues Mitglied" (ModePage=8) */
    spielerpassBeantragen: '#mgmenu1 a',

    /**
     * Direkter URL-Pfad zum Neues-Mitglied-Formular.
     * ACHTUNG: DFBnet-URLs sind base64-encoded mit Session-ID (`?ul=...`).
     * Hardcoded Pfad funktioniert NICHT — muss aus MegaMenu extrahiert werden.
     * Dieser Wert dient nur als Referenz-Anker; Runtime nutzt Extraktion.
     */
    spielerpassFormPath: '/index.php?ModePage=8',
  },

  // ===== Neues Mitglied Formular (Adresse-Tab, AdressenTabMode=21) =====
  // VERIFIED 2026-03-19 + 2026-07-02
  spielerpassForm: {
    /** Formular-Container (Adresse-Tab-Content) */
    formContainer: 'form[name="AdressenForm"]',

    /** Vorname */
    firstName: 'input[name="strVorname"]',

    /** Nachname (Pflichtfeld) */
    lastName: 'input[name="strNachName"]',

    /** Geburtsdatum (TT.MM.JJJJ, maxLen=10) */
    birthDate: 'input[name="strGeburtsdatum"]',

    /**
     * Team-Zuweisung. ACHTUNG: DFBnet hat kein direktes "Team"-Feld im
     * Adresse-Tab — Team-Zuweisung erfolgt auf dem Zusatzdaten-Tab via
     * `select[name="iAttribut9"]` (Mannschaftswunsch). Für Health-Check
     * nutzen wir hier die Mitglieds-Nr als Anker (existiert immer im Adresse-Tab).
     */
    team: 'input[name="strMitgliedsnummer"]',

    /** Mitgliedsnummer (wird nach Save vom Server gesetzt) */
    registrationNumber: 'input[name="strMitgliedsnummer"]',

    /**
     * Antragsgrund existiert nicht als eigenes Feld — DFBnet unterscheidet
     * über den Zusatzdaten-Tab (Beitragsart, Freifeld 8). Wir nutzen die
     * Anrede als generischen Formular-Anker.
     */
    reason: 'select[name="strAnrede"]',

    /** Vorheriger Verein (nicht standardmäßig im DFBnet Formular). */
    previousTeam: 'input[name="strStrasse2"]',

    /** Abmeldedatum (nicht standardmäßig im DFBnet Formular). */
    deregistrationDate: 'input[name="strEintrittsdatum"]',

    /** Photo-Upload (im Zusatzdaten-Tab). */
    photoUpload: 'input[name="ImgTitle"]',

    /**
     * Zusätzliche Dokumenten-Uploads. Aktuell nutzt DFBnet nur ImgTitle
     * im Zusatzdaten-Tab. Bei Erweiterung anpassen.
     */
    documentUpload: 'input[type="file"]',

    /**
     * Speichern-Button auf Adresse-Tab. SAFETY-CRITICAL.
     * ACHTUNG: Auf Zusatzdaten-Tab ist es ein anderer Button (a.SubmitButton).
     * Verwenden MUSS mit `.click({ delay: 100 })` — DFBnet 9.2.0+ Trusted-Event-Check.
     */
    saveDraftButton: '#adressSaveBtn',

    /**
     * Absenden-Button existiert im DFBnet nicht als separater Button —
     * Speichern legt bereits das Mitglied an. Es gibt keinen zusätzlichen
     * Publish/Submit-Schritt für die Mitgliedserfassung. Selector bleibt
     * als Safety-Anker um Absenden-Buttons in Zukunft zu erkennen wenn
     * DFBnet ein Publish-Feature einführt.
     */
    submitButton: 'button:has-text("Absenden"), a:has-text("Absenden")',

    /** Erfolgsmeldung nach Save. */
    successMessage: 'text=gespeichert',

    /**
     * Nach Save wird die Mitgliedsnummer in strMitgliedsnummer eingetragen.
     * "Draft-URL" gibt es bei DFBnet nicht — wir nutzen die Mitgliedsnummer
     * als Referenz-Anker.
     */
    draftUrlElement: 'input[name="strMitgliedsnummer"]',
  },

  // ===== Common Elements =====
  common: {
    /** JavaScript confirm() Dialog — muss via page.on('dialog') behandelt werden. */
    cookieBanner: 'body',

    /** Confirm-Dialog Auto-Accept via Playwright-Handler (kein CSS-Selector). */
    cookieAccept: 'body',

    /** Loading-Spinner (kommt bei manchen AJAX-Actions). */
    loadingSpinner: '#loading, .ajax-loading',

    /** Session-Timeout-Modal (DFBnet-typisch nach ~30min Inaktivität). */
    sessionTimeoutModal: '.session-timeout, [id*="timeout"]',
  },

  // ===== Zusatzdaten-Tab (AdressenTabMode=23, ROT) =====
  // VERIFIED 2026-07-02 (Runde 4)
  zusatzdaten: {
    /** Zusatzdaten-Tab-Link (rot). */
    tabLink: 'a.tabbutton-txt-red, a.tabbutton-txt-active-red',

    /**
     * Speichern-Button auf Zusatzdaten-Tab.
     * ACHTUNG: NICHT #adressSaveBtn — auf diesem Tab ist es a.SubmitButton
     * mit onclick="OnSubmitPageSelectFormPunkte(...)".
     */
    saveButton: 'a.SubmitButton',

    /** Freifeld 1: Freigabe (Ja/Nein) */
    freigabe: 'select[name="iAttribut0"]',

    /** Freifeld 2: Grund */
    grund: 'select[name="iAttribut1"]',

    /** Freifeld 3: Teilhabegesetzt */
    teilhabegesetzt: 'select[name="iAttribut2"]',

    /** Freifeld 4: Beitragsbefreiung */
    beitragsbefreiung: 'select[name="iAttribut3"]',

    /** Freifeld 5: Beitragsrückstand */
    beitragsrueckstand: 'select[name="iAttribut4"]',

    /** Freifeld 6: Beitragsrückstandgrund (Text) */
    beitragsrueckstandgrund: 'input[name="strName5"]',

    /** Freifeld 7: Datenschutzerklärung */
    datenschutzerklaerung: 'select[name="iAttribut6"]',

    /** Freifeld 8: Beitragsart */
    beitragsart: 'select[name="iAttribut7"]',

    /** Freifeld 9: Aufnahmegebühr (langer Text) */
    aufnahmegebuehrText: 'textarea[name="strLong8"]',

    /** Freifeld 10: Mannschaftswunsch */
    mannschaftswunsch: 'select[name="iAttribut9"]',

    /** Freifeld 11: Aufnahmegebühr-Status */
    aufnahmegebuehrStatus: 'select[name="iAttribut10"]',

    /** Vereinseintritt-Datum */
    eintrittsdatum: 'input[name="strEintrittsdatum"]',

    /** Status (Aktiv/Passiv) */
    status: 'select[name="Status"]',
  },

  // ===== Mitgliederliste (ModePage=7) — für L2 Success-Verification =====
  // VERIFIED 2026-07-02 (Runde 5)
  mitgliederliste: {
    /** Buchstaben-Filter A-Z. In Playwright via .filter({ hasText: /^[A-Z]$/ }) */
    letterFilterLink: 'a',

    /** Trash-Icon pro Row (für Delete-Flow) */
    deleteIcon: 'img[alt="Löschen"]',

    /** Delete-Modal (Bootstrap-Iframe) */
    deleteModal: '#DeletedMitglieder',

    /** Delete-Modal-Iframe (Playwright: page.frameLocator) */
    deleteModalIframe: '#DeletedMitglieder iframe',
  },
} as const;

/**
 * Registration reason mapping: Internal enum → DFBnet Beitragsart-Label
 *
 * DFBnet hat keinen "Antragsgrund"-Selector — der interne registration_reason
 * wird auf die Beitragsart (Freifeld 8) gemappt. Für die Adresse-Tab-Suche
 * nutzen wir die Anrede als Fallback-Anker.
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
  /** Form save operation — DFBnet 9.2.0+ Trusted-Event-Chain braucht ~400-500ms */
  formSave: 30_000,
  /** Login race condition (dashboard vs 2FA vs error) */
  loginRace: 30_000,
  /** Click-Delay für Trusted-Event-Triggering (DFBnet 9.2.0+) */
  clickDelay: 100,
} as const;
