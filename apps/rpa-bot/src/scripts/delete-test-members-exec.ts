/**
 * DFBnet — Delete Test Members (Execute)
 *
 * Finds and deletes test members using the bulk action dropdown:
 * 1. Login
 * 2. Navigate to Mitglieder > Übersicht
 * 3. Filter by letter "B" (Bitte-Loeschen)
 * 4. Find test member row, check its checkbox
 * 5. Select "gewählte Einträge löschen" from MglActionMenuSel
 * 6. Confirm deletion dialog
 *
 * Usage: npx tsx src/scripts/delete-test-members-exec.ts
 */

import { chromium, type Page } from 'playwright';
import { resolve } from 'path';
import { mkdirSync, writeFileSync } from 'fs';
import { config } from '../config/env.js';

const CREDENTIALS = {
  username: config.DFBNET_USERNAME,
  password: config.DFBNET_PASSWORD,
  kundennummer: config.DFBNET_KUNDENNUMMER,
};

const SCREENSHOT_DIR = resolve(process.cwd(), 'screenshots', 'delete-exec');
mkdirSync(SCREENSHOT_DIR, { recursive: true });

let stepNum = 0;
const log: string[] = [];

function logLine(msg: string) {
  const ts = new Date().toISOString().substring(11, 19);
  const line = `[${ts}] ${msg}`;
  console.log(line);
  log.push(line);
}

async function ss(page: Page, name: string) {
  stepNum++;
  const path = `${SCREENSHOT_DIR}/${String(stepNum).padStart(2, '0')}_${name}.png`;
  await page.screenshot({ path, fullPage: true });
  logLine(`  >> Screenshot: ${name}`);
}

async function main() {
  logLine('=== DFBnet — Delete Test Members ===\n');

  const browser = await chromium.launch({ headless: false, slowMo: 150 });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'de-DE',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30_000);

  // Auto-accept ALL confirm dialogs (delete confirmations)
  page.on('dialog', async (dialog) => {
    const msg = dialog.message();
    logLine(`  Dialog (${dialog.type()}): "${msg.substring(0, 150)}"`);
    logLine('  Auto-accepting...');
    await dialog.accept();
  });

  let deletedCount = 0;

  try {
    // ===== 1. LOGIN =====
    logLine('STEP 1: Login...');
    await page.goto('https://verein.dfbnet.org/login/', { waitUntil: 'networkidle', timeout: 60_000 });
    await page.fill('input[name="strUserName"]', CREDENTIALS.username);
    await page.fill('input[name="strPass"]', CREDENTIALS.password);
    await page.fill('input[name="strShortKey"]', CREDENTIALS.kundennummer);
    await page.click('a:has-text("Anmelden")');
    await page.waitForTimeout(4000);
    await page.waitForLoadState('networkidle').catch(() => {});
    logLine(`  Logged in: "${await page.title()}"`);
    await ss(page, 'after-login');

    // ===== 2. NAVIGATE TO MITGLIEDER ÜBERSICHT =====
    logLine('\nSTEP 2: Navigating to Mitglieder Übersicht...');

    const menuLinks: { text: string; href: string }[] = await page.$$eval(
      '#mgmenu1 a[href*="index.php"]',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (els: any[]) => els.map((el: any) => ({
        text: el.textContent?.trim() ?? '',
        href: el.href ?? '',
      }))
    );

    // Find Mitglieder > Übersicht (the "Übersicht" that follows "Mitglieder")
    const mitgliederIdx = menuLinks.findIndex(
      (l, i) => l.text === 'Mitglieder' && menuLinks[i + 1]?.text === 'Übersicht'
    );
    const listUrl = mitgliederIdx >= 0 ? menuLinks[mitgliederIdx + 1].href : null;

    if (!listUrl) {
      logLine('  ERROR: Mitglieder Übersicht URL not found');
      return;
    }

    await page.goto(listUrl, { waitUntil: 'networkidle', timeout: 60_000 });
    await page.waitForTimeout(2000);
    await ss(page, 'mitglieder-list');

    // ===== 3-5. FIND, CHECK, AND DELETE TEST MEMBERS PER LETTER PAGE =====
    // We must stay on the same letter page: check + select action + click "Ausführen"
    const lettersToCheck = ['B']; // B = "Bitte-Loeschen"

    for (const letter of lettersToCheck) {
      logLine(`\nProcessing letter "${letter}"...`);

      const letterLink = await page.$(`a:text-is("${letter}")`);
      if (!letterLink) {
        logLine(`  Letter "${letter}" not found — skipping`);
        continue;
      }

      await letterLink.click();
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(2000);
      await ss(page, `letter-${letter}`);

      // Find test member rows
      const rows = await page.$$('table.datagrid tr');
      logLine(`  Rows: ${rows.length}`);

      let checkedAny = false;
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const rowText = await row.textContent().catch(() => '') ?? '';

        const isTestMember =
          rowText.includes('Bitte-Loeschen') ||
          rowText.includes('Loeschen-Bitte') ||
          rowText.includes('E2E-Test') ||
          rowText.includes('RPA-Test');

        if (!isTestMember) continue;

        logLine(`  FOUND test member row ${i}: "${rowText.substring(0, 80).trim()}"`);

        const checkbox = await row.$('input[type="checkbox"]');
        if (checkbox) {
          await checkbox.check();
          checkedAny = true;
          logLine(`  Checked row ${i}`);
        }
      }

      if (!checkedAny) {
        logLine(`  No test members found under "${letter}"`);
        continue;
      }

      await ss(page, `checked-${letter}`);

      // Now select the delete action and click "Ausführen"
      // IMPORTANT: The action dropdown + Ausführen button are at the bottom of the list
      const actionSelect = await page.$('select#MglActionMenuSel');
      if (!actionSelect) {
        logLine('  ERROR: Action dropdown not found!');
        continue;
      }

      // Get the delete option value
      const options = await page.$$eval(
        'select#MglActionMenuSel option',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (opts: any[]) => opts.map((o: any) => ({ value: o.value, text: o.textContent?.trim() }))
      );
      logLine(`  Options: ${options.map((o) => `"${o.text}"=${o.value}`).join(', ')}`);

      const deleteOption = options.find((o) =>
        o.text?.toLowerCase().includes('löschen') || o.text?.toLowerCase().includes('loeschen')
      );

      if (!deleteOption) {
        logLine('  ERROR: Delete option not found!');
        continue;
      }

      logLine(`  Selecting "${deleteOption.text}" (${deleteOption.value})...`);

      // Use page.selectOption which doesn't trigger navigation
      await actionSelect.selectOption(deleteOption.value);
      await page.waitForTimeout(500);

      // Look for "Ausführen" button next to the dropdown
      const ausfuehrenBtn = await page.$('input[value="Ausführen"], a:has-text("Ausführen"), button:has-text("Ausführen")');
      if (ausfuehrenBtn) {
        logLine('  Found "Ausführen" button — clicking...');
        await ss(page, `before-ausfuehren-${letter}`);
        await ausfuehrenBtn.click();
      } else {
        logLine('  No "Ausführen" button found — action may auto-submit on change');
      }

      // Wait for the Bootstrap modal confirmation dialog to appear
      // DFBnet uses a CUSTOM HTML modal (#DeletedAlle) with an IFRAME inside!
      await page.waitForTimeout(2000);
      await ss(page, `dialog-appeared-${letter}`);

      // The modal #DeletedAlle contains an iframe with the actual "Ja"/"Nein" buttons
      logLine('  Looking for iframe inside #DeletedAlle modal...');

      const modalIframe = await page.$('#DeletedAlle iframe');
      if (!modalIframe) {
        logLine('  ERROR: No iframe found in modal!');
        continue;
      }

      const iframeContent = await modalIframe.contentFrame();
      if (!iframeContent) {
        logLine('  ERROR: Could not access iframe content frame!');
        continue;
      }

      // Wait for iframe to load
      await iframeContent.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(1500);

      // Dump iframe HTML for debugging
      const iframeHtml = await iframeContent.content().catch(() => 'ERROR');
      logLine(`  Iframe body text: "${(await iframeContent.textContent('body').catch(() => '') ?? '').substring(0, 300)}"`);

      // Find and click "Ja" button inside the iframe
      const jaSelectors = [
        'button:has-text("Ja")',
        'input[value="Ja"]',
        'a:has-text("Ja")',
        '.btn:has-text("Ja")',
      ];

      let clickedJa = false;
      for (const sel of jaSelectors) {
        const jaBtn = await iframeContent.$(sel);
        if (jaBtn) {
          logLine(`  Found "Ja" via "${sel}" in iframe — clicking...`);
          await jaBtn.click();
          clickedJa = true;
          logLine('  Clicked "Ja" inside iframe — waiting for deletion...');
          break;
        }
      }

      if (!clickedJa) {
        // Last resort: evaluate inside iframe
        logLine('  Trying page.evaluate inside iframe...');
        const clicked = await iframeContent.evaluate(() => {
          const allEls = document.querySelectorAll('button, a, input[type="button"], input[type="submit"]');
          for (const el of allEls) {
            const text = (el as HTMLElement).textContent?.trim() ?? '';
            const value = (el as HTMLInputElement).value ?? '';
            console.log(`Button: text="${text}" value="${value}"`);
            if (text === 'Ja' || value === 'Ja') {
              (el as HTMLElement).click();
              return true;
            }
          }
          return false;
        });
        if (clicked) {
          logLine('  Clicked "Ja" via iframe evaluate!');
          clickedJa = true;
        } else {
          // Dump all buttons/links for debugging
          const allBtns = await iframeContent.$$eval(
            'button, a, input[type="button"], input[type="submit"]',
            (els) => els.map((el) => ({
              tag: el.tagName,
              text: el.textContent?.trim(),
              value: (el as HTMLInputElement).value,
              class: el.className,
            }))
          );
          logLine(`  All buttons in iframe: ${JSON.stringify(allBtns)}`);
          logLine('  WARNING: Could not find or click "Ja" button!');
        }
      }

      // Wait for page reload after confirmation
      await page.waitForTimeout(3000);
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(2000);

      await ss(page, `after-delete-${letter}`);

      // Verify: check if test member is still visible on this letter page
      const pageText = await page.textContent('body').catch(() => '') ?? '';
      if (pageText.includes('Bitte-Loeschen') || pageText.includes('E2E-Test') || pageText.includes('RPA-Test')) {
        logLine('  WARNING: Test member may still be present!');
      } else {
        logLine('  SUCCESS: Test member no longer visible!');
        deletedCount++;
      }
    }

  } catch (error) {
    logLine(`\nERROR: ${error}`);
    try { await ss(page, 'error'); } catch {}
  } finally {
    logLine(`\n${'='.repeat(50)}`);
    logLine(`Deleted: ${deletedCount} test member(s)`);
    logLine('='.repeat(50));

    writeFileSync(`${SCREENSHOT_DIR}/delete-exec.log`, log.join('\n'));
    logLine(`\nLog: ${SCREENSHOT_DIR}/delete-exec.log`);
    logLine('Browser closing in 10s...');
    await page.waitForTimeout(10_000);
    await browser.close();
  }
}

main().catch(console.error);
