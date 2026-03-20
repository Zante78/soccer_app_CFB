/**
 * DFBnet Verein — Explore Member Zusatzdaten/Freifelder Tab
 *
 * The violet tab (AdressenTabMode=30) contains the Freifelder.
 * This script navigates directly to it.
 *
 * Usage: npx tsx src/scripts/explore-mitglied-freifelder.ts
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

const SCREENSHOT_DIR = resolve(process.cwd(), 'screenshots', 'mitglied');
mkdirSync(SCREENSHOT_DIR, { recursive: true });

let stepNum = 0;
const allData: Record<string, any> = {};

// Known member edit URLs (Jakub Aadan, AdrId=7601782)
const MEMBER_TABS: Record<string, string> = {
  'Adresse (21)':
    'https://verein.dfbnet.org/index.php?ul=OGYzYWE3Y2U4MzcyODNlNTk1ZDQwYmU3NWM1MDU1MjM_QWRySWQ9NzYwMTc4MiZNb2RlPTImTW9kZVBhZ2U9NyZBZHJlc3NlblRhYk1vZGU9MjEmT3BoSWQ9NmY2ZTZkNmM2ZDZlNmY2ZCZkZmJuZXR2dj00ZWIwOTM4NDA4YjNjYjU1ZWMxNGFmOTA2YzllZmUwYw#Index',
  'Rot-Tab (23)':
    'https://verein.dfbnet.org/index.php?ul=OGYzYWE3Y2U4MzcyODNlNTk1ZDQwYmU3NWM1MDU1MjM_QWRySWQ9NzYwMTc4MiZNb2RlPTImTW9kZVBhZ2U9NyZBZHJlc3NlblRhYk1vZGU9MjMmT3BoSWQ9NmY2ZTZkNmM2ZDZlNmY2ZCZkZmJuZXR2dj0wNjVjM2JiOTIyYmRkN2M2Y2IzY2UwMDRkNDJiOGE1Yw#Index',
  'Violett-Tab-Freifelder (30)':
    'https://verein.dfbnet.org/index.php?ul=OGYzYWE3Y2U4MzcyODNlNTk1ZDQwYmU3NWM1MDU1MjM_QWRySWQ9NzYwMTc4MiZNb2RlPTImTW9kZVBhZ2U9NyZBZHJlc3NlblRhYk1vZGU9MzAmT3BoSWQ9NmY2ZTZkNmM2ZDZlNmY2ZCZkZmJuZXR2dj0yZDY1NjczOWRlM2Y1N2VlOWJlMjNkMzE0ZDcyZjNjYg#Index',
  'Tab-33':
    'https://verein.dfbnet.org/index.php?ul=OGYzYWE3Y2U4MzcyODNlNTk1ZDQwYmU3NWM1MDU1MjM_QWRySWQ9NzYwMTc4MiZNb2RlPTImTW9kZVBhZ2U9NyZBZHJlc3NlblRhYk1vZGU9MzMmT3BoSWQ9NmY2ZTZkNmM2ZDZlNmY2ZCZkZmJuZXR2dj01Zjk0Y2IwNDkzMjMzOTIzOTZmMjk3NDJjOWM5MDBiNQ#Index',
};

async function ss(page: any, name: string) {
  stepNum++;
  const path = `${SCREENSHOT_DIR}/${String(stepNum).padStart(2, '0')}_${name}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log(`  >> Screenshot: ${name}`);
}

async function getAllFormFields(page: any) {
  return page.$$eval(
    'input:not([type="hidden"]), select, textarea',
    (els: HTMLElement[]) =>
      els.map((el) => {
        const row = el.closest('tr');
        const tds = row ? Array.from(row.querySelectorAll('td')) : [];
        return {
          tag: el.tagName,
          id: el.id,
          name: (el as HTMLInputElement).name,
          type: (el as HTMLInputElement).type,
          value: (el as HTMLInputElement).value?.substring(0, 300),
          rowLabel: tds[0]?.textContent?.trim()?.substring(0, 120),
          visible: el.offsetParent !== null,
          disabled: (el as HTMLInputElement).disabled,
          readOnly: (el as HTMLInputElement).readOnly,
          checked: (el as HTMLInputElement).checked,
          maxLength: (el as HTMLInputElement).maxLength > 0 ? (el as HTMLInputElement).maxLength : undefined,
          className: el.className?.substring(0, 80),
          options:
            el.tagName === 'SELECT'
              ? Array.from((el as HTMLSelectElement).options).map((o) => ({
                  value: o.value,
                  text: o.text.substring(0, 200),
                  selected: o.selected,
                }))
              : undefined,
        };
      })
  );
}

async function main() {
  console.log('=== DFBnet Verein — Mitglied Freifelder Tab Exploration ===\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 80,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'de-DE',
  });

  const page = await context.newPage();

  try {
    // ========== LOGIN ==========
    console.log('LOGIN...');
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
    console.log(`  Title: ${await page.title()}\n`);

    // ========== EXPLORE ALL MISSING TABS ==========
    for (const [tabName, tabUrl] of Object.entries(MEMBER_TABS)) {
      console.log(`\n${'='.repeat(70)}`);
      console.log(`TAB: ${tabName}`);
      console.log('='.repeat(70));

      await page.goto(tabUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      await ss(page, `member_${tabName.replace(/[^a-zA-Z0-9]/g, '_')}`);

      // Get all tab names on this page (including red/violett)
      const allTabs = await page.$$eval(
        'a[class*="tabbutton-txt"]',
        (els: HTMLAnchorElement[]) =>
          els.map((el) => ({
            text: el.textContent?.trim(),
            class: el.className,
          }))
      );
      if (tabName.includes('30') || tabName.includes('23') || tabName.includes('33')) {
        console.log('  All tabs on this page:');
        for (const t of allTabs) {
          console.log(`    [${t.class}] "${t.text}"`);
        }
      }

      // Breadcrumb
      const breadcrumb = await page.$eval('#ClickPath', (el: HTMLElement) => el.textContent?.trim()).catch(() => '');
      console.log(`  Breadcrumb: ${breadcrumb?.substring(0, 200)}`);

      // All form fields
      const fields = await getAllFormFields(page);
      const visible = fields.filter((f: any) => f.visible && f.name !== 'searchAll');

      allData[tabName] = {
        url: tabUrl,
        breadcrumb,
        allTabs,
        visibleFields: visible,
        allFields: fields.filter((f: any) => f.name !== 'searchAll'),
      };

      console.log(`  Visible fields: ${visible.length}`);

      for (const f of visible) {
        const extra = [];
        if (f.disabled) extra.push('DISABLED');
        if (f.readOnly) extra.push('READONLY');
        if (f.maxLength) extra.push(`maxLen=${f.maxLength}`);
        console.log(
          `  ${f.tag} name="${f.name}" id="${f.id}" type=${f.type} value="${(f.value || '').substring(0, 80)}" [${f.rowLabel || ''}] ${extra.join(' ')}`
        );
        if (f.options) {
          for (const o of f.options) {
            console.log(`    "${o.text}" = ${o.value}${o.selected ? ' (SELECTED)' : ''}`);
          }
        }
      }

      // Also check ALL hidden inputs with ZD_ or Zusatz
      const hiddenFields = await page.$$eval('input[type="hidden"]', (els: HTMLInputElement[]) =>
        els.map((el) => ({ name: el.name, id: el.id, value: el.value?.substring(0, 200) }))
      );
      const zdHidden = hiddenFields.filter((f: any) => f.name?.includes('ZD') || f.name?.includes('zusatz') || f.name?.includes('Freifeld'));
      if (zdHidden.length > 0) {
        console.log(`\n  Hidden ZD fields: ${zdHidden.length}`);
        for (const f of zdHidden) {
          console.log(`  hidden: name="${f.name}" value="${f.value}"`);
        }
      }
    }

    // ========== SAVE ==========
    writeFileSync(`${SCREENSHOT_DIR}/freifelder_tab_data.json`, JSON.stringify(allData, null, 2));
    writeFileSync(`${SCREENSHOT_DIR}/freifelder_tab.html`, await page.content());
    console.log(`\n\n=== ALL DATA SAVED ===`);
    console.log('Browser closing in 15s.\n');
    await page.waitForTimeout(15000);
  } catch (error) {
    console.error('\nERROR:', error);
    writeFileSync(`${SCREENSHOT_DIR}/freifelder_partial.json`, JSON.stringify(allData, null, 2));
    await ss(page, 'error').catch(() => {});
    try { writeFileSync(`${SCREENSHOT_DIR}/freifelder_error.html`, await page.content()); } catch {}
    console.log('\nPartial data saved. Browser closing in 15s.');
    await page.waitForTimeout(15000);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
