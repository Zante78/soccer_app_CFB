/**
 * DFBnet — Delete Test Members
 *
 * Searches for test members created during E2E testing and attempts to delete them.
 * Test members use identifiable names: "E2E-Test", "RPA-Test", "Bitte-Loeschen", "Loeschen-Bitte"
 *
 * Strategy:
 * 1. Login
 * 2. Navigate to Mitglieder list (all members)
 * 3. Search for test members
 * 4. Explore delete mechanism (Aktionen dropdown, checkboxes, links)
 * 5. Delete each test member
 *
 * Usage: npx tsx src/scripts/delete-test-members.ts
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

const SCREENSHOT_DIR = resolve(process.cwd(), 'screenshots', 'delete-members');
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const TEST_NAMES = ['Bitte-Loeschen', 'Loeschen-Bitte', 'E2E-Test', 'RPA-Test'];

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
  return path;
}

async function main() {
  logLine('=== DFBnet — Delete Test Members ===\n');

  const browser = await chromium.launch({ headless: false, slowMo: 120 });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'de-DE',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30_000);

  // Auto-accept confirm dialogs for delete operations
  page.on('dialog', async (dialog) => {
    const msg = dialog.message();
    logLine(`  Dialog (${dialog.type()}): "${msg.substring(0, 120)}"`);
    // Accept delete/remove confirmations
    if (
      msg.toLowerCase().includes('löschen') ||
      msg.toLowerCase().includes('loeschen') ||
      msg.toLowerCase().includes('entfernen') ||
      msg.toLowerCase().includes('wirklich') ||
      msg.toLowerCase().includes('sicher') ||
      msg.toLowerCase().includes('unwiderruflich') ||
      dialog.type() === 'confirm'
    ) {
      logLine('  Auto-accepting dialog');
      await dialog.accept();
    } else {
      logLine('  Dismissing unexpected dialog');
      await dialog.dismiss();
    }
  });

  try {
    // ===== 1. LOGIN =====
    logLine('STEP 1: Login...');
    await page.goto('https://verein.dfbnet.org/login/', {
      waitUntil: 'networkidle',
      timeout: 60_000,
    });
    await page.fill('input[name="strUserName"]', CREDENTIALS.username);
    await page.fill('input[name="strPass"]', CREDENTIALS.password);
    await page.fill('input[name="strShortKey"]', CREDENTIALS.kundennummer);
    await page.click('a:has-text("Anmelden")');
    await page.waitForTimeout(4000);
    await page.waitForLoadState('networkidle').catch(() => {});

    const title = await page.title();
    logLine(`  Logged in: "${title}"`);
    await ss(page, 'after-login');

    // ===== 2. NAVIGATE TO MITGLIEDER LIST =====
    logLine('\nSTEP 2: Navigating to Mitglieder list...');

    // Extract Mitglieder URLs from MegaMenu
    const menuLinks: { text: string; href: string }[] = await page.$$eval(
      '#mgmenu1 a[href*="index.php"]',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (els: any[]) => els.map((el: any) => ({
        text: el.textContent?.trim() ?? '',
        href: el.href ?? '',
      }))
    );

    // Strategy: Find "Mitglied suchen" or Mitglieder Übersicht
    // The menu has multiple "Übersicht" links — we need the one near "Neues Mitglied"
    const mitgliedSuchenLink = menuLinks.find((l) => l.text === 'Mitglied suchen');
    // Find "Übersicht" links that appear AFTER "Mitglieder" in the DOM order
    const mitgliederIdx = menuLinks.findIndex((l) => l.text === 'Mitglieder' && menuLinks[menuLinks.indexOf(l) + 1]?.text === 'Übersicht');
    const mitgliederUebersicht = mitgliederIdx >= 0 ? menuLinks[mitgliederIdx + 1] : null;

    logLine(`  Mitglied suchen: ${mitgliedSuchenLink?.href ? 'found' : 'NOT found'}`);
    logLine(`  Mitglieder Übersicht: ${mitgliederUebersicht?.href ? 'found' : 'NOT found'}`);

    // Navigate to Mitglieder Übersicht (the member list)
    const listUrl = mitgliederUebersicht?.href ?? mitgliedSuchenLink?.href;
    if (!listUrl) {
      logLine('  ERROR: No Mitglieder list URL found — trying all links...');
      for (const l of menuLinks) {
        logLine(`    "${l.text}" → ${l.href.substring(0, 80)}`);
      }
      return;
    }

    logLine(`  Navigating to: ${listUrl.substring(0, 80)}...`);
    await page.goto(listUrl, { waitUntil: 'networkidle', timeout: 60_000 });
    await page.waitForTimeout(2000);
    await ss(page, 'mitglieder-list');

    // ===== 3. EXPLORE LIST STRUCTURE =====
    logLine('\nSTEP 3: Exploring member list structure...');

    // Check for "Alle" link to show all members
    const alleLink = await page.$('a:has-text("Alle")');
    if (alleLink) {
      logLine('  Found "Alle" link — clicking to show all members...');
      await alleLink.click();
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(2000);
    }

    await ss(page, 'all-members');

    // Check for action elements (checkboxes, dropdown, buttons)
    const checkboxes = await page.$$('table.datagrid input[type="checkbox"]');
    logLine(`  Checkboxes in datagrid: ${checkboxes.length}`);

    // Look for action buttons/dropdowns
    const actionElements = await page.$$eval(
      'select, a, button, input[type="submit"]',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (els: any[]) => els
        .filter((el: any) => {
          const t = (el.textContent?.trim() || el.value || '').toLowerCase();
          return (
            t.includes('lösch') || t.includes('losch') || t.includes('entfern') ||
            t.includes('aktion') || t.includes('auswahl') || t.includes('markiert') ||
            t.includes('delete') || t.includes('remove')
          );
        })
        .map((el: any) => ({
          tag: el.tagName,
          text: el.textContent?.trim().substring(0, 80),
          name: el.name,
          id: el.id,
          href: el.href?.substring(0, 120),
          visible: el.offsetParent !== null,
        }))
    );
    logLine(`  Action elements found: ${actionElements.length}`);
    for (const el of actionElements) {
      logLine(`    [${el.visible ? 'VIS' : 'hid'}] <${el.tag}> "${el.text}" name=${el.name} id=${el.id}`);
      if (el.href) logLine(`      href: ${el.href}`);
    }

    // Get all rows from the datagrid
    const rows = await page.$$eval(
      'table.datagrid tr',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (trs: any[]) => trs.map((tr: any, idx: number) => ({
        idx,
        text: tr.textContent?.trim().substring(0, 200),
        hasCheckbox: !!tr.querySelector('input[type="checkbox"]'),
        links: Array.from(tr.querySelectorAll('a') as any).map((a: any) => ({
          text: a.textContent?.trim(),
          href: a.href?.substring(0, 120),
        })),
      }))
    );

    logLine(`\n  Datagrid rows: ${rows.length}`);

    // Find test member rows
    const testRows = rows.filter((r) =>
      TEST_NAMES.some((name) => r.text?.toLowerCase().includes(name.toLowerCase()))
    );

    logLine(`  Test member rows found: ${testRows.length}`);
    for (const row of testRows) {
      logLine(`  Row ${row.idx}: "${row.text?.substring(0, 100)}"`);
      logLine(`    Checkbox: ${row.hasCheckbox}`);
      for (const link of row.links) {
        logLine(`    Link: "${link.text}" → ${link.href}`);
      }
    }

    if (testRows.length === 0) {
      logLine('\n  No test members found in the list. Trying search...');

      // Try searching via the global search bar
      for (const searchName of TEST_NAMES) {
        logLine(`\n  Searching for "${searchName}"...`);
        const searchInput = await page.$('input[name="searchAll"]');
        if (searchInput) {
          await searchInput.click();
          await searchInput.fill(searchName);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await page.evaluate(() => {
            const form = (globalThis as any).document?.FormSearchAll;
            if (form) form.submit();
          });
          await page.waitForLoadState('networkidle').catch(() => {});
          await page.waitForTimeout(2000);
          await ss(page, `search-${searchName}`);

          const bodyText = await page.textContent('body').catch(() => '') ?? '';
          if (bodyText.includes('Keine Adressen')) {
            logLine(`    "${searchName}": No results`);
          } else {
            logLine(`    "${searchName}": Results found!`);
            // Look for links in the results
            const resultLinks = await page.$$eval(
              'table.datagrid a',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (els: any[]) => els.map((el: any) => ({
                text: el.textContent?.trim(),
                href: el.href?.substring(0, 120),
              }))
            );
            for (const rl of resultLinks) {
              logLine(`      Link: "${rl.text}" → ${rl.href}`);
            }
          }
        }
      }
    }

    // ===== 4. TRY TO OPEN MEMBER AND FIND DELETE =====
    logLine('\nSTEP 4: Opening a test member to look for delete option...');

    // Navigate to Mitglieder list via "B" letter (Bitte-Loeschen starts with B)
    if (listUrl) {
      await page.goto(listUrl, { waitUntil: 'networkidle', timeout: 60_000 });
      await page.waitForTimeout(2000);
    }

    // Click on "B" letter filter
    const bLink = await page.$('a:text-is("B")');
    if (bLink) {
      logLine('  Clicking "B" letter filter...');
      await bLink.click();
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(2000);
      await ss(page, 'b-filter');

      // Look for test members
      const bRows = await page.$$eval(
        'table.datagrid tr',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (trs: any[]) => trs.map((tr: any) => ({
          text: tr.textContent?.trim().substring(0, 200),
          links: Array.from(tr.querySelectorAll('a') as any).map((a: any) => ({
            text: a.textContent?.trim(),
            href: a.href?.substring(0, 160),
          })),
        }))
      );

      const testMemberRows = bRows.filter((r) =>
        r.text?.toLowerCase().includes('bitte') || r.text?.toLowerCase().includes('loeschen') ||
        r.text?.toLowerCase().includes('e2e') || r.text?.toLowerCase().includes('rpa')
      );

      logLine(`  Test members under "B": ${testMemberRows.length}`);
      for (const row of testMemberRows) {
        logLine(`    "${row.text?.substring(0, 120)}"`);
        for (const link of row.links) {
          logLine(`      Link: "${link.text}" → ${link.href}`);
        }
      }

      // If found, click into a test member to explore delete UI
      if (testMemberRows.length > 0 && testMemberRows[0].links.length > 0) {
        const editUrl = testMemberRows[0].links[0].href;
        if (editUrl && editUrl.includes('index.php')) {
          logLine(`\n  Opening test member: ${editUrl.substring(0, 80)}...`);
          await page.goto(editUrl, { waitUntil: 'networkidle', timeout: 60_000 });
          await page.waitForTimeout(2000);
          await ss(page, 'test-member-open');

          // Look for delete links/buttons on the member page
          const deleteElements = await page.$$eval(
            'a, button, input[type="submit"]',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (els: any[]) => els
              .filter((el: any) => {
                const t = (el.textContent?.trim() || el.value || '').toLowerCase();
                return t.includes('lösch') || t.includes('losch') || t.includes('entfern') ||
                       t.includes('delete') || t.includes('austritt');
              })
              .map((el: any) => ({
                tag: el.tagName,
                text: el.textContent?.trim().substring(0, 80),
                href: el.href?.substring(0, 160),
                visible: el.offsetParent !== null,
                name: el.name,
              }))
          );

          logLine(`  Delete/removal elements on member page: ${deleteElements.length}`);
          for (const el of deleteElements) {
            logLine(`    [${el.visible ? 'VIS' : 'hid'}] <${el.tag}> "${el.text}" → ${el.href ?? ''}`);
          }

          // Check for an "Aktionen" button or gear icon
          const aktionenElements = await page.$$eval(
            'a, button, select',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (els: any[]) => els
              .filter((el: any) => {
                const t = (el.textContent?.trim() || el.title || '').toLowerCase();
                return t.includes('aktion') || t.includes('zahnrad') || t.includes('gear') ||
                       t.includes('option') || t.includes('menu') || t.includes('more');
              })
              .map((el: any) => ({
                tag: el.tagName,
                text: el.textContent?.trim().substring(0, 80),
                title: el.title,
                href: el.href?.substring(0, 120),
                visible: el.offsetParent !== null,
              }))
          );

          if (aktionenElements.length > 0) {
            logLine(`  Aktionen elements: ${aktionenElements.length}`);
            for (const el of aktionenElements) {
              logLine(`    [${el.visible ? 'VIS' : 'hid'}] <${el.tag}> "${el.text}" title="${el.title}"`);
            }
          }

          // Look for the "Aktionen" column in the first row (checkbox area)
          const firstRowActions = await page.$$eval(
            'table.datagrid tr td:first-child a, table.datagrid tr td:first-child img',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (els: any[]) => els.map((el: any) => ({
              tag: el.tagName,
              src: el.src?.substring(0, 120),
              alt: el.alt,
              title: el.title,
              href: el.parentElement?.href?.substring(0, 120),
              onclick: el.getAttribute?.('onclick')?.substring(0, 120),
            }))
          );

          if (firstRowActions.length > 0) {
            logLine(`  First-column action icons: ${firstRowActions.length}`);
            for (const el of firstRowActions) {
              logLine(`    <${el.tag}> src="${el.src}" alt="${el.alt}" title="${el.title}" onclick="${el.onclick}"`);
            }
          }
        }
      }
    }

    // ===== 5. CHECK MITGLIEDER LIST ACTIONS (checkboxes + toolbar) =====
    logLine('\nSTEP 5: Checking Mitglieder list toolbar for bulk actions...');

    // Go back to list
    if (listUrl) {
      await page.goto(listUrl, { waitUntil: 'networkidle', timeout: 60_000 });
      await page.waitForTimeout(2000);
    }

    // Click "Alle" to see all members
    const alleLink2 = await page.$('a:text-is("Alle")');
    if (alleLink2) {
      await alleLink2.click();
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(2000);
    }

    await ss(page, 'all-members-toolbar');

    // Look for toolbar/action elements above the datagrid
    const toolbarElements = await page.$$eval(
      'a, button, select, input[type="submit"], img[onclick]',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (els: any[]) => els
        .filter((el: any) => {
          const rect = el.getBoundingClientRect();
          // Only elements in the top area (toolbar-like position)
          return rect.top < 500 && rect.top > 100;
        })
        .map((el: any) => ({
          tag: el.tagName,
          text: (el.textContent?.trim() || el.value || el.alt || el.title || '').substring(0, 60),
          src: el.src?.substring(0, 80),
          href: el.href?.substring(0, 120),
          onclick: el.getAttribute?.('onclick')?.substring(0, 120),
          visible: el.offsetParent !== null,
        }))
    );

    logLine(`  Toolbar elements: ${toolbarElements.length}`);
    for (const el of toolbarElements.slice(0, 30)) {
      const desc = el.src ? `src="${el.src}"` : el.href ? `href="${el.href}"` : '';
      logLine(`    <${el.tag}> "${el.text}" ${desc} ${el.onclick ? `onclick="${el.onclick}"` : ''}`);
    }

    // Specifically look for any images with delete icons
    const allImages = await page.$$eval(
      'img',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (els: any[]) => els.map((el: any) => ({
        src: el.src?.substring(0, 100),
        alt: el.alt,
        title: el.title,
        onclick: el.getAttribute?.('onclick')?.substring(0, 120),
        parentHref: el.parentElement?.href?.substring(0, 120),
      }))
    );

    const deleteImages = allImages.filter(
      (img) =>
        img.src?.includes('delete') || img.src?.includes('losch') || img.src?.includes('trash') ||
        img.src?.includes('remove') || img.src?.includes('cross') || img.src?.includes('x_') ||
        img.alt?.toLowerCase().includes('lösch') || img.title?.toLowerCase().includes('lösch')
    );

    if (deleteImages.length > 0) {
      logLine(`\n  Delete-related images: ${deleteImages.length}`);
      for (const img of deleteImages) {
        logLine(`    src="${img.src}" alt="${img.alt}" title="${img.title}" onclick="${img.onclick}"`);
      }
    }

    // ===== 6. CHECK FOR MEMBER LIST ROW ACTIONS =====
    logLine('\nSTEP 6: Checking row-level actions in member list...');

    // Click "B" for our test members
    const bLink2 = await page.$('a:text-is("B")');
    if (bLink2) {
      await bLink2.click();
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(2000);
    }

    // Get the first "Aktionen" cell content for any row
    const aktionenCells = await page.$$eval(
      'table.datagrid tr',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (trs: any[]) => trs.slice(1).map((tr: any) => {
        const firstTd = tr.querySelector('td');
        if (!firstTd) return null;
        return {
          html: firstTd.innerHTML?.substring(0, 300),
          text: firstTd.textContent?.trim(),
          links: Array.from(firstTd.querySelectorAll('a') as any).map((a: any) => ({
            href: a.href?.substring(0, 160),
            title: a.title,
            innerHTML: a.innerHTML?.substring(0, 100),
          })),
          images: Array.from(firstTd.querySelectorAll('img') as any).map((img: any) => ({
            src: img.src?.substring(0, 100),
            alt: img.alt,
            title: img.title,
          })),
        };
      }).filter(Boolean)
    );

    if (aktionenCells.length > 0) {
      logLine(`  Aktionen cells (first 3 rows):`);
      for (const cell of aktionenCells.slice(0, 3)) {
        logLine(`    HTML: ${cell?.html}`);
        if (cell?.links.length) {
          for (const l of cell.links) {
            logLine(`      Link: title="${l.title}" href="${l.href}"`);
            logLine(`        innerHTML: ${l.innerHTML}`);
          }
        }
        if (cell?.images.length) {
          for (const img of cell.images) {
            logLine(`      Img: src="${img.src}" alt="${img.alt}" title="${img.title}"`);
          }
        }
      }
    }

    await ss(page, 'final-state');

    // Save log
    writeFileSync(`${SCREENSHOT_DIR}/delete-exploration.log`, log.join('\n'));
    logLine(`\nLog saved to ${SCREENSHOT_DIR}/delete-exploration.log`);
    logLine('Browser closing in 10s...');
    await page.waitForTimeout(10_000);

  } catch (error) {
    logLine(`\nERROR: ${error}`);
    try { await ss(page, 'error'); } catch {}
    writeFileSync(`${SCREENSHOT_DIR}/delete-error.log`, log.join('\n'));
    await page.waitForTimeout(10_000);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
