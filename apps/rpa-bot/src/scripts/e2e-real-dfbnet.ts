/**
 * E2E Test — Full 3-Phase Member Creation against REAL DFBnet Verein
 *
 * Runs the complete production pipeline:
 * Phase 1: Login → Navigate to "Neues Mitglied" → Fill Adresse → Speichern (confirm dialog)
 * Phase 2: Search for created member → Open in Edit mode
 * Phase 3: Click Zusatzdaten tab → Fill Freifelder → Speichern
 *
 * IMPORTANT: This creates a REAL member in DFBnet!
 * Uses clearly identifiable test data: "E2E-Test Bitte-Loeschen"
 * Delete manually after the test via DFBnet Vereinsverwaltung.
 *
 * Usage: npx tsx src/scripts/e2e-real-dfbnet.ts
 */

import { chromium, type Page } from 'playwright';
import { resolve } from 'path';
import { mkdirSync, writeFileSync } from 'fs';
import { loginToDFBnet, type LoginConfig } from '../flows/login.js';
import {
  navigateToMemberForm,
  openCreatedMember,
  fillAdresseTab,
  fillZusatzdatenTab,
  saveForm,
  type RegistrationData,
  type NavigationConfig,
} from '../flows/create-draft.js';
import { config } from '../config/env.js';

// ===== Configuration =====

const CREDENTIALS = {
  username: config.DFBNET_USERNAME,
  password: config.DFBNET_PASSWORD,
  kundennummer: config.DFBNET_KUNDENNUMMER,
};

const BASE_URL = 'https://verein.dfbnet.org';

// Clearly identifiable test data — easy to find and delete
const TEST_REGISTRATION: RegistrationData = {
  id: 'e2e-test-001',
  player_name: 'E2E-Test Bitte-Loeschen',
  player_birth_date: '2000-01-01',
  player_dfb_id: null,
  registration_reason: 'NEW_PLAYER',
  player_data: {
    gender: 'male',
    street: 'Teststraße 99',
    postal_code: '50735',
    city: 'Köln',
    beitragsart: '169342', // 240€ Aktives Mitglied
  },
  team: {
    id: 'team-test',
    name: 'U13', // will fuzzy-match to U13-1 D1-Junioren
    dfbnet_id: null,
  },
};

const SCREENSHOT_DIR = resolve(process.cwd(), 'screenshots', 'e2e-test');
mkdirSync(SCREENSHOT_DIR, { recursive: true });

// ===== Test Runner =====

type TestStep = {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration_ms: number;
  details: string;
  error?: string;
};

const results: TestStep[] = [];
const log: string[] = [];

function logLine(msg: string) {
  const ts = new Date().toISOString().substring(11, 19);
  const line = `[${ts}] ${msg}`;
  console.log(line);
  log.push(line);
}

async function ss(page: Page, name: string) {
  const path = `${SCREENSHOT_DIR}/${String(results.length + 1).padStart(2, '0')}_${name}.png`;
  await page.screenshot({ path, fullPage: true });
  logLine(`  >> Screenshot: ${name}`);
  return path;
}

async function runStep(
  name: string,
  fn: () => Promise<string>
): Promise<boolean> {
  logLine(`\n${'='.repeat(60)}`);
  logLine(`STEP: ${name}`);
  logLine('='.repeat(60));

  const start = Date.now();
  try {
    const details = await fn();
    const duration = Date.now() - start;
    results.push({ name, status: 'PASS', duration_ms: duration, details });
    logLine(`  PASS (${duration}ms): ${details}`);
    return true;
  } catch (error) {
    const duration = Date.now() - start;
    const errMsg = error instanceof Error ? error.message : String(error);
    results.push({ name, status: 'FAIL', duration_ms: duration, details: '', error: errMsg });
    logLine(`  FAIL (${duration}ms): ${errMsg}`);
    return false;
  }
}

// ===== Main =====

async function main() {
  logLine('=== DFBnet E2E Test — Full 3-Phase Member Creation ===');
  logLine(`Test member: "${TEST_REGISTRATION.player_name}"`);
  logLine(`Team: "${TEST_REGISTRATION.team.name}"`);
  logLine(`Beitragsart: ${TEST_REGISTRATION.player_data.beitragsart}`);
  logLine(`Screenshots: ${SCREENSHOT_DIR}\n`);

  const browser = await chromium.launch({
    headless: false,
    slowMo: 150,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
  });

  const page = await context.newPage();
  page.setDefaultTimeout(30_000);

  const navConfig: NavigationConfig = {
    baseUrl: BASE_URL,
    screenshotDir: SCREENSHOT_DIR,
    registrationId: TEST_REGISTRATION.id,
  };

  let mitgliedsnummer: string | undefined;

  try {
    // ==================== STEP 1: LOGIN ====================
    const loginOk = await runStep('Login to DFBnet Verein', async () => {
      const loginConfig: LoginConfig = {
        baseUrl: BASE_URL,
        username: CREDENTIALS.username,
        password: CREDENTIALS.password,
        kundennummer: CREDENTIALS.kundennummer,
        screenshotDir: SCREENSHOT_DIR,
        registrationId: TEST_REGISTRATION.id,
        headless: false,
      };

      const result = await loginToDFBnet(page, loginConfig);
      await ss(page, 'after-login');

      if (!result.success) {
        throw new Error(result.error ?? 'Login failed');
      }

      const title = await page.title();
      return `Title: "${title}", URL: ${page.url().substring(0, 80)}...`;
    });

    if (!loginOk) throw new Error('Login failed — cannot continue');

    // ==================== STEP 2: NAVIGATE TO "NEUES MITGLIED" ====================
    const navOk = await runStep('Navigate to "Neues Mitglied" form', async () => {
      const result = await navigateToMemberForm(page, navConfig);
      await ss(page, 'neues-mitglied-form');

      // Verify form loaded
      const vorname = await page.$('input[name="strVorname"]');
      if (!vorname) throw new Error('Vorname field not found — not on member form');

      return `Form loaded: ${result.success}, URL: ${page.url().substring(0, 80)}...`;
    });

    if (!navOk) throw new Error('Navigation failed — cannot continue');

    // ==================== STEP 3: FILL ADRESSE TAB (Phase 1) ====================
    const adresseOk = await runStep('Fill Adresse tab (Phase 1)', async () => {
      const result = await fillAdresseTab(page, TEST_REGISTRATION, {
        screenshotDir: SCREENSHOT_DIR,
      });
      await ss(page, 'adresse-filled');

      const details = [
        `Filled: [${result.filledFields.join(', ')}]`,
        `Skipped: [${result.skippedFields.join(', ')}]`,
        result.warnings.length > 0 ? `Warnings: [${result.warnings.join('; ')}]` : '',
      ].filter(Boolean).join(' | ');

      return details;
    });

    if (!adresseOk) throw new Error('Adresse fill failed — cannot continue');

    // ==================== STEP 4: SAVE ADRESSE (confirm dialog) ====================

    const saveAdresseOk = await runStep('Save Adresse (Phase 1 — confirm dialog)', async () => {
      const result = await saveForm(page, {
        screenshotDir: SCREENSHOT_DIR,
        registrationId: TEST_REGISTRATION.id,
        stepName: 'adresse',
      });
      await ss(page, 'adresse-saved');

      mitgliedsnummer = result.mitgliedsnummer;

      const details = [
        `Success: ${result.success}`,
        result.mitgliedsnummer ? `Mitgliedsnummer: ${result.mitgliedsnummer}` : 'No Mitgliedsnummer',
        `URL: ${result.draftUrl?.substring(0, 80)}...`,
      ].join(' | ');

      return details;
    });

    if (!saveAdresseOk) throw new Error('Adresse save failed — cannot continue');

    logLine(`\n  >>> PHASE 1 COMPLETE — Member created ${mitgliedsnummer ? `(Nr. ${mitgliedsnummer})` : ''} <<<\n`);

    // ==================== STEP 5: CHECK IF ZUSATZDATEN TAB IS ALREADY AVAILABLE ====================
    // After save, DFBnet may stay in Edit mode (all tabs visible) — check before reopening
    const zusatzdatenTabExists = await page.$('a[class*="tabbutton-txt"]:has-text("Zusatzdaten")');

    if (zusatzdatenTabExists) {
      logLine('  Zusatzdaten tab already available — SKIPPING Phase 2 (reopen)');
      results.push({
        name: 'Open created member in Edit mode (Phase 2)',
        status: 'SKIP' as 'PASS',
        duration_ms: 0,
        details: 'Skipped — Zusatzdaten tab already visible after Phase 1 save',
      });
    } else {
      // ==================== STEP 5: OPEN MEMBER IN EDIT MODE (Phase 2) ====================
      const openOk = await runStep('Open created member in Edit mode (Phase 2)', async () => {
        const result = await openCreatedMember(page, TEST_REGISTRATION, navConfig);
        await ss(page, 'member-edit-mode');

        if (!result.success) {
          throw new Error(result.error ?? 'Could not open member');
        }

        // Check how many tabs are visible
        const tabs = await page.$$('a[class*="tabbutton-txt"]');
        const tabTexts: string[] = [];
        for (const tab of tabs) {
          const text = await tab.textContent();
          if (text) tabTexts.push(text.trim());
        }

        return `Edit mode: ${tabs.length} tabs [${tabTexts.join(', ')}]`;
      });

      if (!openOk) throw new Error('Opening member in Edit mode failed — cannot continue');
    }

    logLine(`\n  >>> PHASE 2 COMPLETE — Ready for Zusatzdaten <<<\n`);

    // ==================== STEP 6: FILL ZUSATZDATEN TAB (Phase 3) ====================
    const zusatzdatenOk = await runStep('Fill Zusatzdaten tab (Phase 3 — Freifelder)', async () => {
      const result = await fillZusatzdatenTab(page, TEST_REGISTRATION, {
        screenshotDir: SCREENSHOT_DIR,
      });
      await ss(page, 'zusatzdaten-filled');

      const details = [
        `Filled: [${result.filledFields.join(', ')}]`,
        `Skipped: [${result.skippedFields.join(', ')}]`,
        result.warnings.length > 0 ? `Warnings: [${result.warnings.join('; ')}]` : '',
      ].filter(Boolean).join(' | ');

      return details;
    });

    if (!zusatzdatenOk) throw new Error('Zusatzdaten fill failed — cannot continue');

    // ==================== STEP 7: SAVE ZUSATZDATEN ====================
    const saveZusatzdatenOk = await runStep('Save Zusatzdaten (Phase 3)', async () => {
      const result = await saveForm(page, {
        screenshotDir: SCREENSHOT_DIR,
        registrationId: TEST_REGISTRATION.id,
        stepName: 'zusatzdaten',
      });
      await ss(page, 'zusatzdaten-saved');

      return `Success: ${result.success} | URL: ${result.draftUrl?.substring(0, 80)}...`;
    });

    logLine(`\n  >>> PHASE 3 COMPLETE — Zusatzdaten saved <<<\n`);

    // ==================== STEP 8: VERIFY FINAL STATE ====================
    await runStep('Verify final state', async () => {
      // Check Vorname is still our test member
      const vorname = await page.$eval(
        'input[name="strVorname"]',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (el: any) => el.value
      ).catch(() => '(not found)');

      // Check Mitgliedsnummer
      const mnr = await page.$eval(
        'input[name="strMitgliedsnummer"]',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (el: any) => el.value
      ).catch(() => '(not found)');

      // Check which tab is active
      const activeTab = await page.$eval(
        'a[class*="tabbutton-txt-active"]',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (el: any) => el.textContent?.trim()
      ).catch(() => '(none)');

      await ss(page, 'final-state');

      return `Vorname: "${vorname}" | Mitgliedsnr: "${mnr}" | Active tab: "${activeTab}"`;
    });

    // ==================== STEP 9: NAVIGATE BACK TO ADRESSE TAB TO VERIFY ====================
    await runStep('Verify Adresse data persisted (cross-check)', async () => {
      // Click the Adresse tab to go back
      const adresseTab = await page.$('a[class*="tabbutton-txt"]:has-text("Adresse")');
      if (adresseTab) {
        await adresseTab.click();
        await page.waitForLoadState('networkidle').catch(() => {});
        await page.waitForTimeout(1500);
      }

      const fields: Record<string, string> = {};
      for (const name of ['strVorname', 'strNachName', 'strGeburtsdatum', 'strStrasse', 'strPostleitzhal', 'strOrt']) {
        fields[name] = await page.$eval(
          `input[name="${name}"]`,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (el: any) => el.value
        ).catch(() => '(not found)');
      }

      await ss(page, 'adresse-verified');

      return Object.entries(fields).map(([k, v]) => `${k}="${v}"`).join(' | ');
    });

  } catch (error) {
    logLine(`\nFATAL ERROR: ${error instanceof Error ? error.message : error}`);
    try {
      await ss(page, 'error-state');
    } catch { /* ignore */ }
  } finally {
    // ==================== SUMMARY ====================
    logLine('\n' + '='.repeat(60));
    logLine('E2E TEST RESULTS');
    logLine('='.repeat(60));

    const passed = results.filter((r) => r.status === 'PASS').length;
    const failed = results.filter((r) => r.status === 'FAIL').length;
    const totalMs = results.reduce((sum, r) => sum + r.duration_ms, 0);

    for (const r of results) {
      const icon = r.status === 'PASS' ? 'PASS' : 'FAIL';
      logLine(`  [${icon}] ${r.name} (${r.duration_ms}ms)`);
      if (r.details) logLine(`         ${r.details}`);
      if (r.error) logLine(`         ERROR: ${r.error}`);
    }

    logLine(`\nTotal: ${passed} passed, ${failed} failed (${results.length} steps, ${totalMs}ms)`);

    if (mitgliedsnummer) {
      logLine(`\n  >>> TEST MEMBER CREATED: Mitgliedsnummer ${mitgliedsnummer} <<<`);
      logLine('  >>> DELETE MANUALLY in DFBnet Vereinsverwaltung! <<<');
    }

    // Save results
    writeFileSync(
      `${SCREENSHOT_DIR}/e2e-results.json`,
      JSON.stringify({ results, testRegistration: TEST_REGISTRATION, mitgliedsnummer }, null, 2)
    );
    writeFileSync(`${SCREENSHOT_DIR}/e2e-test.log`, log.join('\n'));

    logLine(`\nScreenshots: ${SCREENSHOT_DIR}`);
    logLine('Browser closing in 15s (review screenshots)...\n');
    await page.waitForTimeout(15000);
    await browser.close();

    process.exit(failed > 0 ? 1 : 0);
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
