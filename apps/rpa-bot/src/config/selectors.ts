/**
 * DFBnet Verein CSS Selectors — Central Configuration
 *
 * Updated 2026-03-19 with REAL selectors from verein.dfbnet.org
 * Discovered via Playwright exploration scripts.
 *
 * Portal: https://verein.dfbnet.org (PHP-based, NOT SpielPLUS/auth.dfbnet.org)
 * App version: 9.1.1 (DFBnet-Vereinsverwaltung)
 */

export const SELECTORS = {
  // ===== Login Page (verein.dfbnet.org/login/) =====
  login: {
    /** Username input field (Benutzername) */
    usernameInput: 'input[name="strUserName"]',

    /** Password input field (Passwort) */
    passwordInput: 'input[name="strPass"]',

    /** Kundennummer input field (unique to DFBnet Verein — 3rd login field) */
    kundennummerInput: 'input[name="strShortKey"]',

    /** Login submit — JavaScript link, not a <button> */
    submitButton: 'a:has-text("Anmelden")',

    /** Login error: wrong credentials */
    errorWrongCredentials: 'text=Benutzer oder Passwort falsch',

    /** Login error: no users for this club */
    errorNoUsers: 'text=Für diesen Verein wurden noch keine Benutzer angelegt',
  },

  // ===== Navigation (after login) =====
  navigation: {
    /** Active top-level menu item */
    activeMenuLink: 'a.mgmenu-active',

    /** Tab buttons on Grunddaten 2 page (legacy — use tabs.* for member pages) */
    tabButton: 'a.tabbutton-txt',
    tabButtonActive: 'a.tabbutton-txt-active',

    /** Breadcrumb (Sie sind hier: ...) */
    clickPath: '#ClickPath',
  },

  // ===== Grunddaten 2 — Freifelder =====
  freifelder: {
    /** Main Freifelder data table */
    dataGrid: 'table#allfreifelder',

    /** Freifeld editor form fields */
    bezeichnung: 'input[name="strBezeichnung"]',
    typ: 'input[name="iType"]', // radio: 1=Text, 2=Datum, 3=Auswahl, 4=Langer Text
    defaultWertText: 'input[name="strDefaultWert"]',
    defaultWertDatum: 'input#strFoundDate',
    defaultWertAuswahl: 'input[name="iDefaultWert"]', // radio: 0=keiner, 1..N=index
    auswahlWert: 'input[id^="Attr_"]', // Attr_1, Attr_2, ... (Auswahl option values)
    auswahlAttribut: 'input[name^="ZDAttribut_"]', // ZDAttribut_1, ZDAttribut_2, ...
    maxZeilen: 'input#LongTextLines',
    maxZeichen: 'input#LongTextLength',
    defaultWertLangerText: 'textarea#LongTextArea',
  },

  // ===== Navigation — Tab Variants =====
  tabs: {
    /** All tab button variants (use for querySelectorAll) */
    allTabs: 'a[class*="tabbutton-txt"]',
    /** Active tab (any color) */
    activeTab: 'a[class*="tabbutton-txt-active"]',
    /** Specific color variants */
    activeRed: 'a.tabbutton-txt-active-red',
    activeViolett: 'a.tabbutton-txt-active-violett',
    redTab: 'a.tabbutton-txt-red',
    violettTab: 'a.tabbutton-txt-violett',
  },

  // ===== Mitglied-Formular (verified 2026-03-19) =====
  mitglied: {
    /** Member list — direct edit links (skip javascript: URLs) */
    listEditLink: 'table.datagrid tr td a[href*="index.php"]:not([href*="javascript"])',
    /** Member list selector (appears on all member tabs) */
    listSelector: '#OphMitglListSelector',

    // --- Adresse Tab (21) ---
    mitgliedsnummer: 'input[name="strMitgliedsnummer"]',
    titel: 'select[name="strTitel"]',
    anrede: 'select[name="strAnrede"]',
    briefanrede: 'select[name="iSelBriefanrede"]',
    vorname: 'input[name="strVorname"]',
    nachname: 'input[name="strNachName"]',
    strasse: 'input[name="strStrasse"]',
    strasse2: 'input[name="strStrasse2"]',
    plz: 'input[name="strPostleitzhal"]',
    ort: 'input[name="strOrt"]',
    land: 'select[name="strLand"]',
    geburtsdatum: 'input[name="strGeburtsdatum"]',
    geschlecht: 'select[name="iSelSex"]',
    familienstand: 'select[name="iSelFamilienstand"]',

    // --- Zusatzdaten Tab (23, RED) — Freifelder ---
    eintrittsdatum: 'input[name="strEintrittsdatum"]',
    statusVerein: 'select[name="Status"]',
    austrittsgrund: 'select[name="strAustritts"]',
    gemeinschaft: 'select[name="iFamAssign"]',
    branche: 'select[name="iBranche"]',
    bild: 'input[name="ImgTitle"]',

    // Freifelder (Index = Freifeld# minus 1)
    freigabe: 'select[name="iAttribut0"]',
    grund: 'select[name="iAttribut1"]',
    teilhabegesetzt: 'select[name="iAttribut2"]',
    beitragsbefreiung: 'select[name="iAttribut3"]',
    beitragsrueckstand: 'select[name="iAttribut4"]',
    beitragsrueckstandgrund: 'input[name="strName5"]',
    datenschutzerklaerung: 'select[name="iAttribut6"]',
    beitragsart: 'select[name="iAttribut7"]',
    aufnahmegebuehrText: 'textarea[name="strLong8"]',
    mannschaftswunsch: 'select[name="iAttribut9"]',
    aufnahmegebuehrStatus: 'select[name="iAttribut10"]',

    // --- Zahlungsdaten Tab (26) ---
    zahlungsart: 'select[name="iZahlungsart"]',
    iban: 'input[name="strIBAN"]',
    bic: 'input[name="strBIC"]',
    kontoinhaber: 'input[name="strKontoinhaber"]',
  },

  // ===== Common Elements =====
  common: {
    /** Datagrid tables (main data display) */
    datagrid: 'table.datagrid',

    /** Dialog/form tables */
    dialogForm: 'table.dlgform',

    /** Save/Submit buttons in forms */
    saveButton: 'a:has-text("Speichern")',
    cancelButton: 'a:has-text("Abbrechen")',

    /** Logout link */
    logoutLink: 'a:has-text("Abmelden")',
  },
} as const;

/**
 * Freifeld type mapping: iType radio value → type name
 */
export const FREIFELD_TYPES = {
  1: 'Text',
  2: 'Datum',
  3: 'Auswahl',
  4: 'Langer Text',
} as const;

/**
 * Beitragsart options — DFBnet iAttribut7 values (verified 2026-03-19)
 */
export const BEITRAGSART_OPTIONS = {
  '240€ Aktives, sporttreibendes Mitglied Jugend & Senioren': '169342',
  '120€ Alte Herren / Student (Nachweis)': '169343',
  '40€ Inaktives unterstützendes Mitglied': '169344',
  '20€ Inaktives unterstützendes Mitglied mit aktivem Kind': '169345',
  '120€ Geschwisterkind': '169346',
  '200€ Ballschule 3-5 Jahre (Aufnahmegebühr entfällt)': '169347',
  'frei 2tes Geschwisterkind': '169348',
  'frei Jugendtrainer / Trainerkind': '169349',
  '40€ Vereinsunterstützer Inaktiv': '171725',
  '20€ Vereinsunterstützer inaktiv mit Kind': '171726',
} as const;

/**
 * Aufnahmegebühr status — DFBnet iAttribut10 values
 */
export const AUFNAHMEGEBUEHR_STATUS = {
  offen: '170823',
  bezahlt: '170824',
  frei: '170825',
  'Rücklastschrift erfolgt': '170921',
} as const;

/**
 * Freigabe — iAttribut0 values
 */
export const FREIGABE_VALUES = { Ja: '121740', Nein: '121741' } as const;

/**
 * Datenschutzerklärung — iAttribut6 values
 */
export const DATENSCHUTZ_VALUES = { Nein: '86899', Ja: '86900' } as const;

/**
 * Teilhabegesetzt — iAttribut2 values
 */
export const TEILHABE_VALUES = { Ja: '21310', Nein: '21311' } as const;

/**
 * Beitragsrückstand — iAttribut4 values
 */
export const BEITRAGSRUECKSTAND_VALUES = { JA: '66699', NEIN: '66700' } as const;

/**
 * Verein-Status — Status select values
 */
export const VEREIN_STATUS = { Aktiv: '234', Passiv: '235' } as const;

/**
 * Anrede — strAnrede select values
 */
export const ANREDE_VALUES = {
  '(Bitte auswählen)': '-1',
  Firma: '35578',
  Frau: '35577',
  Herr: '35576',
} as const;

/**
 * Timeout values for different page interactions (in ms)
 */
export const TIMEOUTS = {
  /** Page navigation timeout */
  navigation: 60_000,
  /** Element visibility wait */
  elementVisible: 10_000,
  /** Network idle after navigation */
  networkIdle: 30_000,
  /** File upload completion */
  fileUpload: 30_000,
  /** Form save operation */
  formSave: 30_000,
  /** Post-login settle time */
  loginSettle: 4_000,
  /** Tab navigation settle time */
  tabSettle: 1_500,
} as const;
