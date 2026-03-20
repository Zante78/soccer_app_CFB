/**
 * DFBnet Verein Explorer v6 — with corrected password
 * Usage: npx tsx src/scripts/explore-dfbnet.ts
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

const SCREENSHOT_DIR = resolve(process.cwd(), 'screenshots', 'explore');
mkdirSync(SCREENSHOT_DIR, { recursive: true });

let stepNum = 0;

async function ss(page: any, name: string) {
  stepNum++;
  const path = `${SCREENSHOT_DIR}/${String(stepNum).padStart(2, '0')}_${name}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log(`  >> ${path}`);
}

async function dumpFields(page: any, label: string) {
  const fields = await page.$$eval(
    'input:not([type="hidden"]), select, textarea',
    (els: HTMLElement[]) =>
      els.map((el) => ({
        tag: el.tagName,
        id: el.id,
        name: (el as HTMLInputElement).name,
        type: (el as HTMLInputElement).type,
        placeholder: (el as HTMLInputElement).placeholder,
        value: (el as HTMLInputElement).value?.substring(0, 200),
        className: el.className?.substring(0, 80),
        label:
          el.closest('label')?.textContent?.trim()?.substring(0, 80) ||
          el.closest('td')?.previousElementSibling?.textContent?.trim()?.substring(0, 80) ||
          el.closest('tr')?.querySelector('td:first-child')?.textContent?.trim()?.substring(0, 80),
        visible: el.offsetParent !== null,
        disabled: (el as HTMLInputElement).disabled,
        checked: (el as HTMLInputElement).checked,
        options:
          el.tagName === 'SELECT'
            ? Array.from((el as HTMLSelectElement).options).map((o) => ({
                value: o.value,
                text: o.text,
                selected: o.selected,
              }))
            : undefined,
      }))
  );
  console.log(`\n  [${label}] ${fields.length} fields`);
  if (fields.length > 0 && fields.length <= 50) {
    console.log(JSON.stringify(fields, null, 2));
  } else if (fields.length > 50) {
    console.log(`  (${fields.length} fields — saved to file only)`);
  }
  writeFileSync(`${SCREENSHOT_DIR}/${label.replace(/\s+/g, '_')}_fields.json`, JSON.stringify(fields, null, 2));
  return fields;
}

async function main() {
  console.log('=== DFBnet VEREIN Explorer v6 ===');
  console.log(`User: ${CREDENTIALS.username} | PW: ${CREDENTIALS.password.substring(0, 3)}*** | KNr: ${CREDENTIALS.kundennummer}\n`);

  const browser = await chromium.launch({
    headless: false,
    slowMo: 150,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'de-DE',
  });

  const page = await context.newPage();

  try {
    // ========== LOGIN ==========
    console.log('STEP 1: Login...');
    await page.goto('https://verein.dfbnet.org/login/', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    await page.waitForTimeout(2000);

    await page.fill('input[name="strUserName"]', CREDENTIALS.username);
    await page.fill('input[name="strPass"]', CREDENTIALS.password);
    await page.fill('input[name="strShortKey"]', CREDENTIALS.kundennummer);
    await ss(page, 'login_filled');

    // Click "Anmelden" link
    await page.click('a:has-text("Anmelden")');
    await page.waitForTimeout(5000);
    await page.waitForLoadState('networkidle').catch(() => {});
    await ss(page, 'after_login');

    const title = await page.title();
    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  Title: ${title}`);

    // Check login success
    const bodyText = await page.textContent('body').catch(() => '');
    if (bodyText.includes('Benutzer oder Passwort falsch') || bodyText.includes('ungültig')) {
      console.log('  !! LOGIN FAILED: Wrong credentials');
      await ss(page, 'login_failed');
      writeFileSync(`${SCREENSHOT_DIR}/login_failed.html`, await page.content());
      console.log('\n  Browser open for 5 min. Ctrl+C to exit.');
      await page.waitForTimeout(300000);
      return;
    }

    console.log('  LOGIN SUCCESS!');

    // ========== EXPLORE NAVIGATION ==========
    console.log('\nSTEP 2: Exploring post-login page...');
    await ss(page, 'dashboard');

    // Get all links
    const allLinks = await page.$$eval('a', (els: HTMLAnchorElement[]) =>
      els
        .filter((el) => el.textContent?.trim())
        .map((el) => ({
          text: el.textContent?.trim()?.substring(0, 120),
          href: el.href,
          target: el.target,
        }))
    );
    writeFileSync(`${SCREENSHOT_DIR}/dashboard_links.json`, JSON.stringify(allLinks, null, 2));
    console.log(`  Total links: ${allLinks.length}`);

    // Show all links for debugging
    for (const l of allLinks) {
      console.log(`    "${l.text}" → ${l.href}`);
    }

    // Check frames
    const frames = page.frames();
    console.log(`\n  Frames: ${frames.length}`);
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      if (frame === page.mainFrame()) continue;
      console.log(`  Frame ${i}: ${frame.url()}`);
      const frameLinks = await frame.$$eval('a', (els: HTMLAnchorElement[]) =>
        els.filter((el) => el.textContent?.trim()).map((el) => ({
          text: el.textContent?.trim()?.substring(0, 100),
          href: el.href,
        }))
      ).catch(() => []);
      for (const l of frameLinks) {
        console.log(`    [frame] "${l.text}" → ${l.href}`);
      }
    }

    // ========== NAVIGATE: Mein Portal → Konfiguration → Grunddaten 2 ==========
    console.log('\nSTEP 3: Navigation...');

    // Try all possible menu structures
    const menuPaths = [
      // Direct links
      'Mein Portal', 'Portal', 'Konfiguration', 'Grunddaten', 'Grunddaten 2',
      // German menu items typical for DFBnet Verein
      'Stammdaten', 'Vereinsdaten', 'Einstellungen', 'Administration',
      'Mitglieder', 'Übersicht', 'Startseite', 'Hauptmenü',
    ];

    for (const target of menuPaths) {
      // Try in main page
      let el = await page.$(`a:has-text("${target}"):visible`).catch(() => null);

      // Try in all frames
      if (!el) {
        for (const frame of frames) {
          if (frame === page.mainFrame()) continue;
          el = await frame.$(`a:has-text("${target}")`).catch(() => null);
          if (el) break;
        }
      }

      if (el) {
        const elText = await el.textContent().catch(() => target);
        console.log(`\n  Found & clicking: "${elText.trim()}"...`);
        await el.click();
        await page.waitForTimeout(3000);
        await page.waitForLoadState('networkidle').catch(() => {});
        await ss(page, `nav_${target.replace(/\s+/g, '_')}`);
        console.log(`  URL: ${page.url()}`);

        // After each nav, re-check for Grunddaten 2
        const gd2 = await page.$('a:has-text("Grunddaten 2"):visible').catch(() => null);
        if (gd2) {
          console.log('\n  Found "Grunddaten 2"! Clicking...');
          await gd2.click();
          await page.waitForTimeout(3000);
          await page.waitForLoadState('networkidle').catch(() => {});
          await ss(page, 'grunddaten_2');
          console.log(`  URL: ${page.url()}`);
          break;
        }
      }
    }

    // ========== DUMP CURRENT PAGE ==========
    console.log('\nSTEP 4: Current page analysis...');
    await dumpFields(page, 'current_page');

    // Headings and labels
    const headings = await page.$$eval('h1, h2, h3, h4, h5, th, legend, dt, b, strong, label, .label', (els: HTMLElement[]) =>
      els
        .filter((el) => el.offsetParent !== null && el.textContent?.trim())
        .map((el) => ({
          tag: el.tagName,
          cls: el.className?.substring(0, 40),
          text: el.textContent?.trim()?.substring(0, 120),
        }))
    );
    console.log('\n  Headings/Labels:');
    for (const h of headings.slice(0, 50)) {
      console.log(`    <${h.tag}> ${h.text}`);
    }

    // Tables
    const tables = await page.$$eval('table', (els: HTMLElement[]) =>
      els.map((el, i) => ({
        index: i,
        rows: Array.from(el.querySelectorAll('tr')).slice(0, 50).map((tr) =>
          Array.from(tr.querySelectorAll('td, th')).map((td) => td.textContent?.trim()?.substring(0, 150))
        ),
      }))
    );
    writeFileSync(`${SCREENSHOT_DIR}/tables.json`, JSON.stringify(tables, null, 2));
    console.log(`  Tables: ${tables.length}`);

    await ss(page, 'final');
    writeFileSync(`${SCREENSHOT_DIR}/final.html`, await page.content());

    console.log('\n=== DONE ===');
    console.log('Browser open for 5 min. Navigate manually if needed. Ctrl+C to exit.\n');
    await page.waitForTimeout(300000);

  } catch (error) {
    console.error('\nERROR:', error);
    await ss(page, 'error').catch(() => {});
    try { writeFileSync(`${SCREENSHOT_DIR}/error.html`, await page.content()); } catch {}
    console.log('\nBrowser open. Ctrl+C to exit.');
    await page.waitForTimeout(300000);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
