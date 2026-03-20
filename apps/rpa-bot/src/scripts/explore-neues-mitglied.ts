/**
 * DFBnet Verein — Explore "Neues Mitglied" Creation Flow
 *
 * Tests the full member creation pipeline:
 * 1. Login
 * 2. Find and click "Neues Mitglied" (discover menu path + URL)
 * 3. Fill minimal Adresse data (Vorname, Nachname, Geburtsdatum)
 * 4. Click "Speichern"
 * 5. Observe: URL change? Same page? Tabs available? Error messages?
 * 6. Navigate to Zusatzdaten tab (red)
 * 7. Check if Freifelder are accessible
 * 8. DO NOT save Zusatzdaten — just observe
 *
 * IMPORTANT: This creates a REAL test member in DFBnet!
 * Use clearly fake data (Test-Vorname, Test-Nachname) so it can be deleted.
 *
 * Usage: npx tsx src/scripts/explore-neues-mitglied.ts
 */

import { chromium } from 'playwright';
import { resolve } from 'path';
import { mkdirSync, writeFileSync } from 'fs';
import { config } from '../config/env.js';

const CREDENTIALS = {
  username: config.DFBNET_USERNAME,
  password: config.DFBNET_PASSWORD,
  kundennummer: config.DFBNET_KUNDENNUMMER,
};

// Clearly identifiable test data — easy to find and delete afterwards
const TEST_MEMBER = {
  vorname: 'RPA-Test',
  nachname: 'Loeschen-Bitte',
  geburtsdatum: '01.01.2000',
};

const SCREENSHOT_DIR = resolve(process.cwd(), 'screenshots', 'neues-mitglied');
mkdirSync(SCREENSHOT_DIR, { recursive: true });

let stepNum = 0;
const log: string[] = [];

function logLine(msg: string) {
  console.log(msg);
  log.push(msg);
}

async function ss(page: any, name: string) {
  stepNum++;
  const path = `${SCREENSHOT_DIR}/${String(stepNum).padStart(2, '0')}_${name}.png`;
  await page.screenshot({ path, fullPage: true });
  logLine(`  >> Screenshot: ${name}`);
}

async function main() {
  logLine('=== DFBnet Verein — Neues Mitglied Creation Flow ===\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 120,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'de-DE',
  });

  const page = await context.newPage();
  const allData: Record<string, any> = {};

  try {
    // ==================== 1. LOGIN ====================
    logLine('STEP 1: Login...');
    await page.goto('https://verein.dfbnet.org/login/', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    await page.waitForTimeout(1500);
    await page.fill('input[name="strUserName"]', CREDENTIALS.username);
    await page.fill('input[name="strPass"]', CREDENTIALS.password);
    await page.fill('input[name="strShortKey"]', CREDENTIALS.kundennummer);
    await page.click('a:has-text("Anmelden")');
    await page.waitForTimeout(4000);

    const title = await page.title();
    logLine(`  Title after login: "${title}"`);
    await ss(page, 'after-login');

    allData.loginTitle = title;
    allData.loginUrl = page.url();

    // ==================== 2. FIND "NEUES MITGLIED" ====================
    logLine('\nSTEP 2: Finding "Neues Mitglied" menu...');

    // The menu is a jQuery MegaMenu (#mgmenu1) with hover-based dropdowns.
    // Menu items are in the DOM but hidden (display:none) until hover.
    // Path: Information → Mitglieder → Neues Mitglied (ModePage=8)
    // Strategy: Extract URLs directly from the hidden DOM.
    logLine('  Extracting menu URLs from DOM (#mgmenu1 hidden items)...');
    const allMenuLinks = await page.$$eval(
      '#mgmenu1 a[href*="index.php"]',
      (els: any[]) => els.map((el: any) => ({
        text: el.textContent?.trim(),
        href: el.href,
      }))
    );
    logLine(`  Total menu links in DOM: ${allMenuLinks.length}`);
    for (const link of allMenuLinks) {
      logLine(`    "${link.text}" → ${link.href?.substring(0, 120)}`);
    }
    allData.allMenuLinks = allMenuLinks;

    // Find key URLs
    const neuesMitgliedLink = allMenuLinks.find((l: any) => l.text === 'Neues Mitglied');
    const mitgliederListLink = allMenuLinks.find((l: any) => l.text === 'Mitglieder');
    const mitgliedSuchenLink = allMenuLinks.find((l: any) => l.text === 'Mitglied suchen');

    logLine(`\n  KEY URLS:`);
    logLine(`    Mitglieder (list): ${mitgliederListLink?.href ?? 'NOT FOUND'}`);
    logLine(`    Neues Mitglied:    ${neuesMitgliedLink?.href ?? 'NOT FOUND'}`);
    logLine(`    Mitglied suchen:   ${mitgliedSuchenLink?.href ?? 'NOT FOUND'}`);

    allData.neuesMitgliedMenuUrl = neuesMitgliedLink?.href;
    allData.mitgliederListUrl = mitgliederListLink?.href;
    allData.mitgliedSuchenUrl = mitgliedSuchenLink?.href;

    // Navigate directly to "Neues Mitglied" URL
    if (neuesMitgliedLink?.href) {
      logLine(`\n  Navigating to "Neues Mitglied" via direct URL...`);
      await page.goto(neuesMitgliedLink.href, {
        waitUntil: 'networkidle',
        timeout: 60000,
      });
      await page.waitForTimeout(2000);
    } else {
      logLine('\n  FATAL: "Neues Mitglied" URL not found in menu DOM!');
    }

    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    await ss(page, 'neues-mitglied-page');

    const neuUrl = page.url();
    logLine(`\n  URL after navigation: ${neuUrl}`);
    allData.neuesMitgliedUrl = neuUrl;

    // ==================== 3. ANALYZE "NEUES MITGLIED" FORM ====================
    logLine('\nSTEP 3: Analyzing form on "Neues Mitglied" page...');

    // Check breadcrumb
    const breadcrumb = await page.$eval('#ClickPath', (el: any) => el.textContent?.trim()).catch(() => '(not found)');
    logLine(`  Breadcrumb: ${breadcrumb}`);
    allData.breadcrumbBefore = breadcrumb;

    // Check which tabs are available BEFORE save
    const tabsBefore = await page.$$eval(
      'a[class*="tabbutton-txt"]',
      (els: any[]) => els.map((el: any) => ({
        text: el.textContent?.trim(),
        className: el.className,
        href: el.href?.substring(0, 160),
      }))
    );
    logLine(`  Tabs BEFORE save: ${tabsBefore.length}`);
    for (const tab of tabsBefore) {
      logLine(`    [${tab.className}] "${tab.text}"`);
    }
    allData.tabsBefore = tabsBefore;

    // Check for Vorname field (confirms we're on the form)
    const vornameField = await page.$('input[name="strVorname"]');
    if (vornameField) {
      logLine('  Vorname field found — we are on the member form');
    } else {
      logLine('  WARNING: Vorname field NOT found — may not be on the form!');
      // Dump all visible form fields for debugging
      const fields = await page.$$eval(
        'input:not([type="hidden"]), select, textarea',
        (els: any[]) => els
          .filter((el: any) => el.offsetParent !== null)
          .map((el: any) => ({
            tag: el.tagName,
            name: el.name,
            type: el.type,
            id: el.id,
          }))
      );
      logLine(`  Visible form fields: ${fields.length}`);
      for (const f of fields.slice(0, 20)) {
        logLine(`    ${f.tag} name="${f.name}" type=${f.type} id="${f.id}"`);
      }
    }

    // ==================== 4. FILL MINIMAL DATA ====================
    logLine('\nSTEP 4: Filling minimal Adresse data...');
    logLine(`  Vorname: "${TEST_MEMBER.vorname}"`);
    logLine(`  Nachname: "${TEST_MEMBER.nachname}"`);
    logLine(`  Geburtsdatum: "${TEST_MEMBER.geburtsdatum}"`);

    try {
      await page.fill('input[name="strNachName"]', TEST_MEMBER.nachname);
      logLine('  Filled Nachname');
    } catch (e: any) {
      logLine(`  ERROR filling Nachname: ${e.message}`);
    }

    try {
      await page.fill('input[name="strVorname"]', TEST_MEMBER.vorname);
      logLine('  Filled Vorname');
    } catch (e: any) {
      logLine(`  ERROR filling Vorname: ${e.message}`);
    }

    try {
      await page.fill('input[name="strGeburtsdatum"]', TEST_MEMBER.geburtsdatum);
      logLine('  Filled Geburtsdatum');
    } catch (e: any) {
      logLine(`  ERROR filling Geburtsdatum: ${e.message}`);
    }

    await ss(page, 'form-filled');

    // ==================== 5. CLICK SPEICHERN ====================
    logLine('\nSTEP 5: Clicking "Speichern"...');

    const saveBtn = await page.$('a:has-text("Speichern")');
    if (!saveBtn) {
      logLine('  ERROR: Speichern button not found!');
      // List all links with "Speichern" or "Save"
      const saveLinks = await page.$$eval('a', (els: any[]) =>
        els.filter((el: any) => {
          const t = el.textContent?.trim() || '';
          return t.includes('Speicher') || t.includes('Save') || t.includes('Ok');
        }).map((el: any) => ({
          text: el.textContent?.trim(),
          href: el.href?.substring(0, 120),
          visible: el.offsetParent !== null,
        }))
      );
      logLine(`  Links with Save/Speichern/Ok: ${saveLinks.length}`);
      for (const l of saveLinks) {
        logLine(`    [${l.visible ? 'VIS' : 'hid'}] "${l.text}" → ${l.href}`);
      }
      allData.saveLinks = saveLinks;
    } else {
      const btnText = await saveBtn.textContent();
      logLine(`  Button text: "${btnText?.trim()}"`);

      // SAFETY: Only click if it says "Speichern"
      if (btnText?.trim().toLowerCase().includes('speichern')) {
        logLine('  SAFETY CHECK PASSED — clicking Speichern...');
        await saveBtn.click();
        await page.waitForTimeout(3000);
        await page.waitForLoadState('networkidle').catch(() => {});
        await page.waitForTimeout(2000);
      } else {
        logLine(`  SAFETY: Button text "${btnText}" does not contain "Speichern" — NOT clicking!`);
      }
    }

    await ss(page, 'after-save');

    // ==================== 6. OBSERVE POST-SAVE STATE ====================
    logLine('\nSTEP 6: Observing post-save state...');

    const postSaveUrl = page.url();
    logLine(`  URL after save: ${postSaveUrl}`);
    logLine(`  URL changed: ${postSaveUrl !== neuUrl}`);
    allData.postSaveUrl = postSaveUrl;
    allData.urlChanged = postSaveUrl !== neuUrl;

    const postSaveTitle = await page.title();
    logLine(`  Title: "${postSaveTitle}"`);

    // Check breadcrumb
    const breadcrumbAfter = await page.$eval('#ClickPath', (el: any) => el.textContent?.trim()).catch(() => '(not found)');
    logLine(`  Breadcrumb: ${breadcrumbAfter}`);
    allData.breadcrumbAfter = breadcrumbAfter;

    // Check for error messages
    const bodyText = await page.textContent('body').catch(() => '') ?? '';
    const errorPatterns = [
      'Fehler', 'Pflichtfeld', 'ungültig', 'nicht gespeichert',
      'Error', 'Warnung', 'fehlgeschlagen', 'nicht möglich',
    ];
    const foundErrors: string[] = [];
    for (const pattern of errorPatterns) {
      if (bodyText.includes(pattern)) {
        // Extract surrounding context
        const idx = bodyText.indexOf(pattern);
        const start = Math.max(0, idx - 60);
        const end = Math.min(bodyText.length, idx + pattern.length + 60);
        const context = bodyText.substring(start, end).replace(/\s+/g, ' ').trim();
        foundErrors.push(`"${pattern}" found: ...${context}...`);
      }
    }
    if (foundErrors.length > 0) {
      logLine(`  ERRORS/WARNINGS on page:`);
      for (const err of foundErrors) {
        logLine(`    ${err}`);
      }
    } else {
      logLine('  No error messages detected on page');
    }
    allData.foundErrors = foundErrors;

    // Check if there's a success message
    const successPatterns = ['gespeichert', 'erfolgreich', 'angelegt', 'erstellt'];
    const foundSuccess: string[] = [];
    for (const pattern of successPatterns) {
      if (bodyText.toLowerCase().includes(pattern)) {
        const idx = bodyText.toLowerCase().indexOf(pattern);
        const start = Math.max(0, idx - 40);
        const end = Math.min(bodyText.length, idx + pattern.length + 40);
        const context = bodyText.substring(start, end).replace(/\s+/g, ' ').trim();
        foundSuccess.push(`"${pattern}" found: ...${context}...`);
      }
    }
    if (foundSuccess.length > 0) {
      logLine(`  SUCCESS indicators on page:`);
      for (const s of foundSuccess) {
        logLine(`    ${s}`);
      }
    }
    allData.foundSuccess = foundSuccess;

    // Check which tabs are available AFTER save
    const tabsAfter = await page.$$eval(
      'a[class*="tabbutton-txt"]',
      (els: any[]) => els.map((el: any) => ({
        text: el.textContent?.trim(),
        className: el.className,
        href: el.href?.substring(0, 160),
      }))
    );
    logLine(`\n  Tabs AFTER save: ${tabsAfter.length}`);
    for (const tab of tabsAfter) {
      logLine(`    [${tab.className}] "${tab.text}"`);
    }
    allData.tabsAfter = tabsAfter;

    // Check if Vorname still has our value (same member page?)
    const vornameValue = await page.$eval(
      'input[name="strVorname"]',
      (el: any) => el.value
    ).catch(() => '(not found)');
    logLine(`  Vorname field value: "${vornameValue}"`);
    allData.vornameAfterSave = vornameValue;

    // Check for Mitgliedsnummer (assigned after creation?)
    const mitgliedsnr = await page.$eval(
      'input[name="strMitgliedsnummer"]',
      (el: any) => el.value
    ).catch(() => '(not found)');
    logLine(`  Mitgliedsnummer: "${mitgliedsnr}"`);
    allData.mitgliedsnummerAfterSave = mitgliedsnr;

    // ==================== 7. NAVIGATE TO ZUSATZDATEN TAB ====================
    logLine('\nSTEP 7: Trying to navigate to Zusatzdaten tab (red)...');

    // Look for red tab
    const redTab = await page.$('a.tabbutton-txt-red, a.tabbutton-txt-active-red');
    const zusatzdatenByText = await page.$('a[class*="tabbutton-txt"]:has-text("Zusatzdaten")');
    const targetTab = redTab || zusatzdatenByText;

    if (targetTab) {
      const tabText = await targetTab.textContent();
      const tabClass = await targetTab.getAttribute('class');
      logLine(`  Found tab: "${tabText?.trim()}" [${tabClass}]`);
      logLine('  Clicking Zusatzdaten tab...');
      await targetTab.click();
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(2000);
      await ss(page, 'zusatzdaten-tab');

      // Check if Freifelder are accessible
      const freifelderSelectors = [
        { name: 'Freigabe (iAttribut0)', sel: 'select[name="iAttribut0"]' },
        { name: 'Beitragsart (iAttribut7)', sel: 'select[name="iAttribut7"]' },
        { name: 'Mannschaftswunsch (iAttribut9)', sel: 'select[name="iAttribut9"]' },
        { name: 'Aufnahmegebühr-Status (iAttribut10)', sel: 'select[name="iAttribut10"]' },
        { name: 'Eintrittsdatum', sel: 'input[name="strEintrittsdatum"]' },
        { name: 'Status', sel: 'select[name="Status"]' },
      ];

      logLine('\n  Freifelder accessibility check:');
      const freifelderStatus: Record<string, string> = {};
      for (const { name, sel } of freifelderSelectors) {
        const el = await page.$(sel);
        if (el) {
          const isVisible = await el.isVisible().catch(() => false);
          const isDisabled = await el.isDisabled().catch(() => false);
          freifelderStatus[name] = isVisible ? (isDisabled ? 'VISIBLE+DISABLED' : 'VISIBLE+ENABLED') : 'HIDDEN';
          logLine(`    ${name}: ${freifelderStatus[name]}`);
        } else {
          freifelderStatus[name] = 'NOT FOUND';
          logLine(`    ${name}: NOT FOUND`);
        }
      }
      allData.freifelderStatus = freifelderStatus;

      // Check active tab
      const activeTab = await page.$eval(
        'a[class*="tabbutton-txt-active"]',
        (el: any) => ({ text: el.textContent?.trim(), className: el.className })
      ).catch(() => null);
      logLine(`  Active tab: ${activeTab ? `"${activeTab.text}" [${activeTab.className}]` : 'none detected'}`);
      allData.activeTabAfterZusatzdaten = activeTab;

    } else {
      logLine('  WARNING: Zusatzdaten tab NOT found!');
      logLine('  This might mean: (a) new member not yet saved, (b) different page structure');

      // List what tabs ARE available
      const availTabs = await page.$$eval(
        'a[class*="tabbutton-txt"]',
        (els: any[]) => els.map((el: any) => ({
          text: el.textContent?.trim(),
          className: el.className,
        }))
      );
      logLine(`  Available tabs: ${availTabs.length}`);
      for (const t of availTabs) {
        logLine(`    [${t.className}] "${t.text}"`);
      }
    }

    // ==================== 8. CHECK SAVE BUTTON ON ZUSATZDATEN ====================
    logLine('\nSTEP 8: Checking save button on Zusatzdaten page...');
    const saveBtnZD = await page.$('a:has-text("Speichern")');
    if (saveBtnZD) {
      const btnTextZD = await saveBtnZD.textContent();
      logLine(`  Save button found: "${btnTextZD?.trim()}"`);
      logLine('  NOT clicking — observation only');
    } else {
      logLine('  Save button not found on Zusatzdaten page');
    }

    // ==================== 9. CHECK FOR DELETE OPTION ====================
    logLine('\nSTEP 9: Checking for delete option (to clean up test member)...');
    const deleteLinks = await page.$$eval(
      'a',
      (els: any[]) => els
        .filter((el: any) => {
          const t = el.textContent?.trim().toLowerCase() || '';
          return t.includes('lösch') || t.includes('losch') || t.includes('entfern') || t.includes('delete');
        })
        .map((el: any) => ({
          text: el.textContent?.trim(),
          href: el.href?.substring(0, 160),
          visible: el.offsetParent !== null,
        }))
    );
    logLine(`  Delete links found: ${deleteLinks.length}`);
    for (const dl of deleteLinks) {
      logLine(`    [${dl.visible ? 'VIS' : 'hid'}] "${dl.text}" → ${dl.href}`);
    }
    allData.deleteLinks = deleteLinks;

    // ==================== SAVE ALL DATA ====================
    writeFileSync(
      `${SCREENSHOT_DIR}/neues-mitglied-flow.json`,
      JSON.stringify(allData, null, 2)
    );
    writeFileSync(
      `${SCREENSHOT_DIR}/neues-mitglied-flow.log`,
      log.join('\n')
    );
    await ss(page, 'final-state');

    logLine('\n=== ALL DATA SAVED ===');
    logLine(`Screenshots: ${SCREENSHOT_DIR}`);
    logLine('Browser closing in 20s (review screenshots)...\n');
    await page.waitForTimeout(20000);

  } catch (error) {
    logLine(`\nERROR: ${error}`);
    writeFileSync(
      `${SCREENSHOT_DIR}/neues-mitglied-partial.json`,
      JSON.stringify(allData, null, 2)
    );
    writeFileSync(
      `${SCREENSHOT_DIR}/neues-mitglied-error.log`,
      log.join('\n')
    );
    await ss(page, 'error').catch(() => {});
    try {
      writeFileSync(`${SCREENSHOT_DIR}/neues-mitglied-error.html`, await page.content());
    } catch {}
    logLine('Partial data saved. Browser closing in 20s.');
    await page.waitForTimeout(20000);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
