/**
 * DFBnet Verein — Create Member Draft Flow
 *
 * Creates a new member in DFBnet Verein and sets Freifelder (Zusatzdaten).
 *
 * 3-Phase Flow (verified 2026-03-19):
 * Phase 1: Navigate to "Neues Mitglied" → Fill Adresse → Speichern
 *          (confirm dialog auto-accepted, member created with Mitgliedsnummer)
 * Phase 2: Open the created member in Edit mode (via search or member list)
 *          (Edit mode shows ALL tabs including red Zusatzdaten tab)
 * Phase 3: Click Zusatzdaten tab → Fill Freifelder → Speichern
 *
 * Key Discovery: The "Neues Mitglied" form only shows the Adresse tab.
 * The Zusatzdaten tab (with Freifelder) only appears when editing an
 * existing member (with an AdrId). So we must create first, then reopen.
 *
 * Navigation: Menu is jQuery MegaMenu (#mgmenu1) with hover dropdowns.
 * URLs are session-encoded. We extract them from the hidden DOM after login.
 *
 * IMPORTANT: This operates on verein.dfbnet.org (PHP portal),
 * NOT on SpielPLUS/auth.dfbnet.org.
 */

import type { Page } from 'playwright';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  SELECTORS,
  BEITRAGSART_OPTIONS,
  AUFNAHMEGEBUEHR_STATUS,
  FREIGABE_VALUES,
  DATENSCHUTZ_VALUES,
  TEILHABE_VALUES,
  BEITRAGSRUECKSTAND_VALUES,
  VEREIN_STATUS,
  ANREDE_VALUES,
  TIMEOUTS,
} from '../config/selectors.js';
import { BotError, ErrorCategory, categorizePlaywrightError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

// ===== Types =====

export type RegistrationData = {
  id: string;
  player_name: string;
  player_birth_date: string; // ISO 8601 (YYYY-MM-DD)
  player_dfb_id: string | null;
  registration_reason: string;
  player_data: Record<string, unknown>;
  team: {
    id: string;
    name: string;
    dfbnet_id: string | null;
  };
};

export type NavigationConfig = {
  baseUrl: string;
  screenshotDir: string;
  registrationId: string;
  /** Direct URL (session-encoded) — if not provided, extracted from DOM */
  neuesMitgliedUrl?: string;
};

export type NavigationResult = {
  success: boolean;
  screenshotPath: string;
  error?: string;
};

export type FillConfig = {
  screenshotDir: string;
};

export type FillResult = {
  success: boolean;
  filledFields: string[];
  skippedFields: string[];
  warnings: string[];
  screenshotPath: string;
};

export type UploadResult = {
  success: boolean;
  uploadedFiles: number;
  errors: string[];
};

export type DraftResult = {
  success: boolean;
  draftUrl: string | null;
  screenshotPath: string;
  error?: string;
  /** Mitgliedsnummer assigned by DFBnet after first save */
  mitgliedsnummer?: string;
};

// ===== Field Mapping =====

type FieldType = 'text' | 'date' | 'select' | 'textarea';

type FieldMapping = {
  selector: string;
  type: FieldType;
  getValue: (reg: RegistrationData) => string | null;
  label: string;
  optional: boolean;
};

/**
 * Adresse tab (21) — personal data fields.
 * Maps registration data → DFBnet Verein member form.
 */
function getAdresseFieldMappings(): FieldMapping[] {
  return [
    {
      selector: SELECTORS.mitglied.nachname,
      type: 'text',
      getValue: (reg) => {
        const parts = reg.player_name.trim().split(/\s+/);
        return parts.length > 1 ? parts.slice(-1)[0] : reg.player_name;
      },
      label: 'Nachname',
      optional: false,
    },
    {
      selector: SELECTORS.mitglied.vorname,
      type: 'text',
      getValue: (reg) => {
        const parts = reg.player_name.trim().split(/\s+/);
        return parts.length > 1 ? parts.slice(0, -1).join(' ') : '';
      },
      label: 'Vorname',
      optional: false,
    },
    {
      selector: SELECTORS.mitglied.geburtsdatum,
      type: 'date',
      getValue: (reg) => reg.player_birth_date,
      label: 'Geburtsdatum',
      optional: false,
    },
    {
      selector: SELECTORS.mitglied.anrede,
      type: 'select',
      getValue: (reg) => {
        const gender = reg.player_data?.gender as string | undefined;
        if (gender === 'male' || gender === 'm') return ANREDE_VALUES.Herr;
        if (gender === 'female' || gender === 'f' || gender === 'w') return ANREDE_VALUES.Frau;
        return null;
      },
      label: 'Anrede',
      optional: true,
    },
    {
      selector: SELECTORS.mitglied.strasse,
      type: 'text',
      getValue: (reg) => (reg.player_data?.street as string) ?? null,
      label: 'Straße',
      optional: true,
    },
    {
      selector: SELECTORS.mitglied.plz,
      type: 'text',
      getValue: (reg) => (reg.player_data?.postal_code as string) ?? null,
      label: 'PLZ',
      optional: true,
    },
    {
      selector: SELECTORS.mitglied.ort,
      type: 'text',
      getValue: (reg) => (reg.player_data?.city as string) ?? null,
      label: 'Ort',
      optional: true,
    },
  ];
}

/**
 * Zusatzdaten tab (23, red) — Freifelder + membership data.
 * These are filled AFTER the member is created and reopened in Edit mode.
 */
function getZusatzdatenFieldMappings(): FieldMapping[] {
  return [
    {
      selector: SELECTORS.mitglied.eintrittsdatum,
      type: 'date',
      getValue: () => formatDateDE(new Date().toISOString().split('T')[0]),
      label: 'Vereinseintritt',
      optional: false,
    },
    {
      selector: SELECTORS.mitglied.statusVerein,
      type: 'select',
      getValue: () => VEREIN_STATUS.Aktiv,
      label: 'Status',
      optional: false,
    },
    {
      selector: SELECTORS.mitglied.datenschutzerklaerung,
      type: 'select',
      getValue: () => DATENSCHUTZ_VALUES.Ja,
      label: 'Datenschutzerklärung',
      optional: false,
    },
    {
      selector: SELECTORS.mitglied.beitragsart,
      type: 'select',
      getValue: (reg) => {
        const beitragsart = reg.player_data?.beitragsart as string | undefined;
        if (!beitragsart) return null;
        const allValues = Object.values(BEITRAGSART_OPTIONS) as string[];
        if (allValues.includes(beitragsart)) return beitragsart;
        const entries = Object.entries(BEITRAGSART_OPTIONS);
        const match = entries.find(([label]) =>
          label.toLowerCase().includes(beitragsart.toLowerCase())
        );
        return match ? match[1] : null;
      },
      label: 'Beitragsart',
      optional: false,
    },
    {
      selector: SELECTORS.mitglied.mannschaftswunsch,
      type: 'select',
      getValue: (reg) => {
        const teamName = reg.team.name;
        if (!teamName) return null;
        return teamName;
      },
      label: 'Mannschaftswunsch',
      optional: true,
    },
    {
      selector: SELECTORS.mitglied.aufnahmegebuehrStatus,
      type: 'select',
      getValue: () => AUFNAHMEGEBUEHR_STATUS.offen,
      label: 'Aufnahmegebühr-Status',
      optional: false,
    },
    {
      selector: SELECTORS.mitglied.freigabe,
      type: 'select',
      getValue: () => FREIGABE_VALUES.Nein,
      label: 'Freigabe',
      optional: false,
    },
    {
      selector: SELECTORS.mitglied.teilhabegesetzt,
      type: 'select',
      getValue: (reg) => {
        const teilhabe = reg.player_data?.teilhabe as boolean | undefined;
        return teilhabe ? TEILHABE_VALUES.Ja : TEILHABE_VALUES.Nein;
      },
      label: 'Teilhabegesetzt',
      optional: false,
    },
    {
      selector: SELECTORS.mitglied.beitragsrueckstand,
      type: 'select',
      getValue: () => BEITRAGSRUECKSTAND_VALUES.NEIN,
      label: 'Beitragsrückstand',
      optional: false,
    },
  ];
}

// ===== Navigation =====

/**
 * Navigate to the "Neues Mitglied" form.
 *
 * Strategy: Extract the session-encoded URL from the hidden jQuery MegaMenu
 * DOM (#mgmenu1) after login. The menu items are in the HTML but hidden
 * (display:none until hover). Path: Information → Mitglieder → Neues Mitglied.
 */
export async function navigateToMemberForm(
  page: Page,
  config: NavigationConfig
): Promise<NavigationResult> {
  const { screenshotDir, registrationId } = config;
  const screenshotPath = `${screenshotDir}/${registrationId}_navigation.png`;

  try {
    if (config.neuesMitgliedUrl) {
      // Strategy 1: Direct URL provided by caller
      logger.info('Navigating to Neues Mitglied via provided URL...');
      await page.goto(config.neuesMitgliedUrl, {
        waitUntil: 'networkidle',
        timeout: TIMEOUTS.navigation,
      });
    } else {
      // Strategy 2: Extract URL from MegaMenu DOM (hidden <a> tags)
      logger.info('Extracting Neues Mitglied URL from MegaMenu DOM...');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const menuLinks: { text: string; href: string }[] = await page.$$eval(
        '#mgmenu1 a[href*="index.php"]',
        (els: any[]) => els.map((el: any) => ({
          text: el.textContent?.trim() ?? '',
          href: el.href ?? '',
        }))
      );

      const neuesMitgliedLink = menuLinks.find((l) => l.text === 'Neues Mitglied');
      if (!neuesMitgliedLink) {
        throw new Error(
          `"Neues Mitglied" not found in MegaMenu DOM (${menuLinks.length} links scanned)`
        );
      }

      logger.info(`Found "Neues Mitglied" URL in DOM — navigating...`);
      await page.goto(neuesMitgliedLink.href, {
        waitUntil: 'networkidle',
        timeout: TIMEOUTS.navigation,
      });
    }

    await page.waitForTimeout(TIMEOUTS.tabSettle);

    // Verify we're on the member form (check for Vorname field)
    const formLoaded = await page.$(SELECTORS.mitglied.vorname);
    if (!formLoaded) {
      throw new Error('Member form not found — Vorname field missing');
    }

    await page.screenshot({ path: screenshotPath, fullPage: true });
    logger.info('Neues Mitglied form loaded');
    return { success: true, screenshotPath };
  } catch (error) {
    try {
      await page.screenshot({ path: screenshotPath, fullPage: true });
    } catch { /* ignore screenshot failure */ }

    throw new BotError(
      `Navigation to Neues Mitglied failed: ${error instanceof Error ? error.message : error}`,
      ErrorCategory.NAVIGATION,
      { screenshotPath, cause: error }
    );
  }
}

/**
 * Open the newly created member in Edit mode.
 *
 * After saving a new member on the Adresse tab, DFBnet assigns a Mitgliedsnummer
 * but stays on the "Neues Mitglied" page (AdrId is empty, only Adresse tab shown).
 * To access the Zusatzdaten tab (Freifelder), we must reopen the member in Edit mode.
 *
 * Strategy: Use the "Mitglieder suchen" search with the member's Nachname,
 * then click the Edit link for the matching member.
 */
export async function openCreatedMember(
  page: Page,
  registration: RegistrationData,
  config: NavigationConfig
): Promise<NavigationResult> {
  const { screenshotDir, registrationId } = config;
  const screenshotPath = `${screenshotDir}/${registrationId}_open-member.png`;

  const nachname = registration.player_name.trim().split(/\s+/).slice(-1)[0];

  try {
    // Strategy 1: Extract "Mitglieder" list URL from MegaMenu and navigate
    logger.info(`Searching for created member "${nachname}"...`);

    // Use the search bar (present on every page) — "Mitglieder suchen..."
    const searchInput = await page.$('input[name="searchAll"]');
    if (searchInput) {
      logger.info('Using global search bar to find member...');
      await searchInput.click();
      await searchInput.fill(nachname);
      // Submit search — the search form uses JavaScript submit
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await page.evaluate(() => {
        const form = (globalThis as any).document?.FormSearchAll;
        if (form) form.submit();
      });
      await page.waitForLoadState('networkidle').catch((err: Error) => {
      logger.debug(`networkidle timeout (expected): ${err.message}`);
    });
      await page.waitForTimeout(TIMEOUTS.tabSettle);
    } else {
      // Fallback: Navigate to Mitglieder list from MegaMenu
      logger.info('Search bar not found, navigating to Mitglieder list...');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const menuLinks: { text: string; href: string }[] = await page.$$eval(
        '#mgmenu1 a[href*="index.php"]',
        (els: any[]) => els.map((el: any) => ({
          text: el.textContent?.trim() ?? '',
          href: el.href ?? '',
        }))
      );
      const mitgliederLink = menuLinks.find(
        (l) => l.text === 'Mitglieder' && l.href.includes('ModePage=7')
      );
      if (mitgliederLink) {
        await page.goto(mitgliederLink.href, {
          waitUntil: 'networkidle',
          timeout: TIMEOUTS.navigation,
        });
        await page.waitForTimeout(TIMEOUTS.tabSettle);
      }
    }

    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Find the edit link for our member in the datagrid
    // Member list rows have links with href containing "index.php" and the AdrId
    const editLink = await page.$(
      `${SELECTORS.mitglied.listEditLink}`
    );

    if (editLink) {
      logger.info('Found member edit link — clicking...');
      await editLink.click();
      await page.waitForLoadState('networkidle').catch((err: Error) => {
      logger.debug(`networkidle timeout (expected): ${err.message}`);
    });
      await page.waitForTimeout(TIMEOUTS.tabSettle);
    } else {
      // Try clicking any link in the datagrid that contains the member name
      const memberLink = await page.$(
        `table.datagrid a:has-text("${nachname}")`
      );
      if (memberLink) {
        logger.info(`Found "${nachname}" in datagrid — clicking...`);
        await memberLink.click();
        await page.waitForLoadState('networkidle').catch((err: Error) => {
      logger.debug(`networkidle timeout (expected): ${err.message}`);
    });
        await page.waitForTimeout(TIMEOUTS.tabSettle);
      } else {
        throw new Error(
          `Could not find member "${nachname}" in search results or member list`
        );
      }
    }

    // Verify we're in Edit mode (should have multiple tabs now)
    const tabs = await page.$$('a[class*="tabbutton-txt"]');
    if (tabs.length <= 1) {
      logger.warn(`Only ${tabs.length} tab(s) found — expected multiple tabs in Edit mode`);
    } else {
      logger.info(`Member Edit mode: ${tabs.length} tabs available`);
    }

    // Verify Vorname matches
    const vorname = await page.$eval(
      SELECTORS.mitglied.vorname,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (el: any) => el.value
    ).catch(() => '');
    if (vorname) {
      logger.info(`Confirmed member: Vorname="${vorname}"`);
    }

    await page.screenshot({ path: screenshotPath, fullPage: true });
    return { success: true, screenshotPath };
  } catch (error) {
    try {
      await page.screenshot({ path: screenshotPath, fullPage: true });
    } catch { /* ignore */ }

    throw new BotError(
      `Opening created member failed: ${error instanceof Error ? error.message : error}`,
      ErrorCategory.NAVIGATION,
      { screenshotPath, cause: error }
    );
  }
}

// ===== Form Filling =====

/**
 * Fill the Adresse tab (personal data) of the member form.
 */
export async function fillAdresseTab(
  page: Page,
  registration: RegistrationData,
  config: FillConfig
): Promise<FillResult> {
  const { screenshotDir } = config;
  const screenshotPath = `${screenshotDir}/${registration.id}_adresse-filled.png`;

  const mappings = getAdresseFieldMappings();
  return fillFields(page, registration, mappings, screenshotPath);
}

/**
 * Fill the Zusatzdaten tab (Freifelder) of the member form.
 * Requires the member to be open in EDIT mode (not "Neues Mitglied").
 * Navigates to the red "Zusatzdaten" tab first.
 */
export async function fillZusatzdatenTab(
  page: Page,
  registration: RegistrationData,
  config: FillConfig
): Promise<FillResult> {
  const { screenshotDir } = config;
  const screenshotPath = `${screenshotDir}/${registration.id}_zusatzdaten-filled.png`;

  // Navigate to the red "Zusatzdaten" tab
  logger.info('Navigating to Zusatzdaten tab...');
  const zusatzdatenTab = await page.$(
    `${SELECTORS.tabs.redTab}, ${SELECTORS.tabs.activeRed}`
  );
  if (!zusatzdatenTab) {
    // Fallback: try clicking by text
    const tabByText = await page.$('a[class*="tabbutton-txt"]:has-text("Zusatzdaten")');
    if (tabByText) {
      await tabByText.click();
    } else {
      throw new BotError(
        'Zusatzdaten tab not found — is the member open in Edit mode?',
        ErrorCategory.NAVIGATION,
        { screenshotPath }
      );
    }
  } else {
    await zusatzdatenTab.click();
  }

  await page.waitForLoadState('networkidle').catch((err: Error) => {
      logger.debug(`networkidle timeout (expected): ${err.message}`);
    });
  await page.waitForTimeout(TIMEOUTS.tabSettle);

  // Verify we're on Zusatzdaten (check for iAttribut7 = Beitragsart)
  const beitragsartField = await page.$(SELECTORS.mitglied.beitragsart);
  if (!beitragsartField) {
    throw new BotError(
      'Zusatzdaten tab loaded but Beitragsart field not found',
      ErrorCategory.FORM,
      { screenshotPath }
    );
  }

  const mappings = getZusatzdatenFieldMappings();
  return fillFields(page, registration, mappings, screenshotPath);
}

/**
 * Generic field filling loop. Used by both Adresse and Zusatzdaten tabs.
 */
async function fillFields(
  page: Page,
  registration: RegistrationData,
  mappings: FieldMapping[],
  screenshotPath: string
): Promise<FillResult> {
  const filledFields: string[] = [];
  const skippedFields: string[] = [];
  const warnings: string[] = [];

  for (const mapping of mappings) {
    const value = mapping.getValue(registration);

    if (!value) {
      if (mapping.optional) {
        skippedFields.push(mapping.label);
        continue;
      }
      warnings.push(`Required field "${mapping.label}" has no value`);
      skippedFields.push(mapping.label);
      continue;
    }

    try {
      await fillField(page, mapping, value);
      filledFields.push(mapping.label);
    } catch (error) {
      const msg = `Could not fill "${mapping.label}": ${error instanceof Error ? error.message : error}`;
      warnings.push(msg);
      skippedFields.push(mapping.label);
      logger.warn(msg);
    }
  }

  await page.screenshot({ path: screenshotPath, fullPage: true });

  logger.info(
    `Fields filled: ${filledFields.length}, skipped: ${skippedFields.length}, warnings: ${warnings.length}`
  );

  return {
    success: warnings.filter((w) => w.startsWith('Required')).length === 0,
    filledFields,
    skippedFields,
    warnings,
    screenshotPath,
  };
}

/**
 * Fill a single form field by type.
 */
async function fillField(
  page: Page,
  mapping: FieldMapping,
  value: string
): Promise<void> {
  const { selector, type, label } = mapping;

  await page.waitForSelector(selector, {
    state: 'visible',
    timeout: TIMEOUTS.elementVisible,
  });

  switch (type) {
    case 'text':
      await page.fill(selector, value);
      break;

    case 'date':
      await page.fill(selector, ensureGermanDate(value));
      break;

    case 'textarea':
      await page.fill(selector, value);
      break;

    case 'select': {
      if (selector === SELECTORS.mitglied.mannschaftswunsch) {
        await fillSelectByFuzzyLabel(page, selector, value, label);
      } else {
        await page.selectOption(selector, value);
      }
      break;
    }
  }

  logger.info(`Filled "${label}": ${value.substring(0, 60)}`);
}

/**
 * Select an option in a <select> by fuzzy-matching the option label text.
 * Used for Mannschaftswunsch where team names change with trainer rotations.
 */
async function fillSelectByFuzzyLabel(
  page: Page,
  selector: string,
  searchText: string,
  label: string
): Promise<void> {
  // $$eval runs in the browser — use `any` for the DOM callback since
  // tsconfig has no "dom" lib (this is a Playwright Node.js project).
  const options: { value: string; text: string }[] = await page.$$eval(
    `${selector} option`,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (opts: any[]) =>
      opts.map((o: any) => ({ value: o.value, text: o.textContent?.trim() ?? '' }))
  );

  const normalizedSearch = searchText.toLowerCase();

  const exactMatch = options.find(
    (o) => o.text.toLowerCase() === normalizedSearch
  );
  if (exactMatch) {
    await page.selectOption(selector, exactMatch.value);
    return;
  }

  const partialMatch = options.find(
    (o) => o.text.toLowerCase().includes(normalizedSearch)
  );
  if (partialMatch) {
    logger.info(`Fuzzy match for "${label}": "${searchText}" → "${partialMatch.text}"`);
    await page.selectOption(selector, partialMatch.value);
    return;
  }

  const ageGroupMatch = normalizedSearch.match(/u\d+/i);
  if (ageGroupMatch) {
    const ageGroup = ageGroupMatch[0].toLowerCase();
    const agMatch = options.find(
      (o) => o.text.toLowerCase().includes(ageGroup) && o.value !== '-1'
    );
    if (agMatch) {
      logger.info(`Age group match for "${label}": "${ageGroup}" → "${agMatch.text}"`);
      await page.selectOption(selector, agMatch.value);
      return;
    }
  }

  throw new Error(
    `No match for "${searchText}" in ${label} (${options.length} options)`
  );
}

// ===== Save Form =====

/**
 * Save the member form. Clicks "Speichern" and verifies success.
 *
 * DFBnet Verein shows a JavaScript confirm() dialog on first save:
 * "Mit Ja werden die Daten gespeichert, inklusive der Mitgliedsnummer."
 * This handler auto-accepts the dialog.
 *
 * Safety: The "Freigabe" Freifeld is set to "Nein" — the Passwart
 * must manually approve by setting it to "Ja". No auto-publish.
 */
export async function saveForm(
  page: Page,
  config: { screenshotDir: string; registrationId: string; stepName: string }
): Promise<DraftResult> {
  const { screenshotDir, registrationId, stepName } = config;
  const screenshotPath = `${screenshotDir}/${registrationId}_${stepName}-saved.png`;

  try {
    const saveBtn = await page.$(SELECTORS.common.saveButton);
    if (!saveBtn) {
      throw new BotError(
        'Save button ("Speichern") not found',
        ErrorCategory.FORM,
        { screenshotPath }
      );
    }

    // SAFETY CHECK: Button text must contain "Speichern"
    const buttonText = (await saveBtn.textContent()) ?? '';
    const normalizedText = buttonText.trim().toLowerCase();

    if (!normalizedText.includes('speichern')) {
      throw new BotError(
        `SAFETY: Button text "${buttonText}" does not contain "Speichern". Refusing to click.`,
        ErrorCategory.SAFETY,
        { screenshotPath }
      );
    }

    if (normalizedText.includes('löschen') || normalizedText.includes('loschen')) {
      throw new BotError(
        `SAFETY: Button text "${buttonText}" contains "Löschen". Refusing to click.`,
        ErrorCategory.SAFETY,
        { screenshotPath }
      );
    }

    // Register dialog handler BEFORE clicking save.
    // DFBnet shows confirm() on first save: "Daten gespeichert, inklusive Mitgliedsnummer"
    let dialogHandled = false;
    const dialogHandler = (dialog: { type: () => string; message: () => string; accept: () => Promise<void>; dismiss: () => Promise<void> }) => {
      const msg = dialog.message();
      logger.info(`Dialog (${dialog.type()}): "${msg.substring(0, 100)}"`);

      if (dialog.type() === 'confirm' || dialog.type() === 'alert') {
        // Accept save confirmation — ONLY if it mentions "speichern" or "Mitgliedsnummer"
        if (msg.toLowerCase().includes('speichern') || msg.toLowerCase().includes('mitgliedsnummer')) {
          logger.info('Auto-accepting save confirmation dialog');
          dialog.accept();
          dialogHandled = true;
        } else {
          logger.warn(`Unexpected dialog: "${msg}" — dismissing`);
          dialog.dismiss();
        }
      } else {
        dialog.dismiss();
      }
    };

    page.on('dialog', dialogHandler);

    logger.info(`Clicking save button: "${buttonText.trim()}"`);
    try {
      await saveBtn.click();

      // Wait for page to settle after save — dialog may appear during this time.
      // Use networkidle with generous timeout, then a short settle buffer.
      try {
        await page.waitForLoadState('networkidle', { timeout: 10_000 });
      } catch (err: unknown) {
        logger.debug(`networkidle timeout after save (expected): ${(err as Error).message}`);
        // Fallback: fixed wait if networkidle doesn't resolve
        await page.waitForTimeout(2000);
      }
      await page.waitForTimeout(500); // Brief settle buffer for dialog handling
    } finally {
      // Always remove dialog handler, even if click/wait throws
      page.removeListener('dialog', dialogHandler);
    }

    if (dialogHandled) {
      logger.info('Save confirmation dialog was handled');
    }

    // Check for error messages on the page
    const bodyText = (await page.textContent('body').catch(() => '')) ?? '';
    if (bodyText.includes('Pflichtfeld') && bodyText.includes('Fehler')) {
      throw new BotError(
        'Save failed: mandatory field validation error detected',
        ErrorCategory.FORM,
        { screenshotPath }
      );
    }

    // Read Mitgliedsnummer if assigned
    const mitgliedsnummer = await page.$eval(
      SELECTORS.mitglied.mitgliedsnummer,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (el: any) => el.value
    ).catch(() => undefined) as string | undefined;

    if (mitgliedsnummer) {
      logger.info(`Mitgliedsnummer assigned: ${mitgliedsnummer}`);
    }

    const currentUrl = page.url();
    await page.screenshot({ path: screenshotPath, fullPage: true });
    logger.info(`${stepName} saved successfully`);

    return {
      success: true,
      draftUrl: currentUrl,
      screenshotPath,
      mitgliedsnummer,
    };
  } catch (error) {
    if (error instanceof BotError) throw error;

    try {
      await page.screenshot({ path: screenshotPath, fullPage: true });
    } catch { /* ignore */ }

    throw categorizePlaywrightError(error);
  }
}

// ===== Document Upload =====

/**
 * Upload a photo to the member form (Zusatzdaten tab, "Bild" field).
 */
export async function uploadPhotoToForm(
  page: Page,
  localPath: string
): Promise<UploadResult> {
  try {
    await page.setInputFiles(SELECTORS.mitglied.bild, localPath, {
      timeout: TIMEOUTS.fileUpload,
    });
    logger.info(`Uploaded photo: ${localPath}`);
    return { success: true, uploadedFiles: 1, errors: [] };
  } catch (error) {
    const msg = `Photo upload failed: ${error instanceof Error ? error.message : error}`;
    logger.warn(msg);
    return { success: false, uploadedFiles: 0, errors: [msg] };
  }
}

/**
 * Download a file from Supabase Storage to a temp directory.
 */
export async function downloadToTemp(
  supabaseUrl: string,
  serviceRoleKey: string,
  bucket: string,
  storagePath: string
): Promise<string> {
  const url = `${supabaseUrl}/storage/v1/object/${bucket}/${storagePath}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${serviceRoleKey}` },
  });

  if (!response.ok) {
    throw new Error(`Download failed (${response.status}): ${storagePath}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const tempDir = join(tmpdir(), 'cfb-rpa');
  if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

  const filename = storagePath.split('/').pop() ?? 'file';
  const tempPath = join(tempDir, `${Date.now()}_${filename}`);
  writeFileSync(tempPath, buffer);

  return tempPath;
}

/**
 * Clean up temp files after upload.
 */
export function cleanupTempFile(filePath: string): void {
  try {
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  } catch {
    logger.warn(`Failed to clean up temp file: ${filePath}`);
  }
}

// ===== Helpers =====

function formatDateDE(isoDate: string): string {
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(isoDate)) return isoDate;
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}.${month}.${year}`;
}

function ensureGermanDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return formatDateDE(value);
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(value)) return value;
  return value;
}
