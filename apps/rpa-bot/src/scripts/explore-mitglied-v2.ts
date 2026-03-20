/**
 * DFBnet Verein — Explore Existing Member Form (all tabs, especially Freifelder)
 *
 * Strategy: Navigate to member list, click first member (JS-based navigation),
 * then explore ALL tabs including the one with Freifelder (Zusatzfelder).
 *
 * Usage: npx tsx src/scripts/explore-mitglied-v2.ts
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

const URLS = {
  mitgliederListe:
    'https://verein.dfbnet.org/index.php?ul=MjI1ZTRhNTA0OWQ0YjJjMGFiMjFiOWQ5MDAzNjNhZjE_TW9kZVBhZ2U9NyZPcGhJZD02ZjZlNmQ2YzZkNmU2ZjZkJmRmYm5ldHZ2PTYwYmU5MzA2YWFlYzI5ZGJiNDg5NTgyYjM0ZGJlYjE5',
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

async function getTabLinks(page: any) {
  return page.$$eval(
    'a.tabbutton-txt, a.tabbutton-txt-active',
    (els: HTMLAnchorElement[]) =>
      els.map((el) => ({
        text: el.textContent?.trim(),
        href: el.href,
        active: el.className.includes('active'),
      }))
  );
}

function printField(f: any) {
  const extra = [];
  if (f.disabled) extra.push('DISABLED');
  if (f.readOnly) extra.push('READONLY');
  if (f.maxLength) extra.push(`maxLen=${f.maxLength}`);
  console.log(
    `  ${f.tag} name="${f.name}" id="${f.id}" type=${f.type} value="${(f.value || '').substring(0, 60)}" [${f.rowLabel || ''}] ${extra.join(' ')}`
  );
  if (f.options && f.options.length <= 25) {
    console.log(
      `    OPTIONS: ${f.options.map((o: any) => `"${o.text}"=${o.value}${o.selected ? '*' : ''}`).join(', ')}`
    );
  } else if (f.options) {
    console.log(`    OPTIONS: ${f.options.length} items (first: ${f.options.slice(0, 3).map((o: any) => o.text).join(', ')}...)`);
  }
}

async function exploreTab(page: any, tabName: string, dataKey: string) {
  const fields = await getAllFormFields(page);
  const visible = fields.filter((f: any) => f.visible && f.name !== 'searchAll');

  allData[dataKey] = {
    tabName,
    visibleFields: visible,
    allFields: fields.filter((f: any) => f.name !== 'searchAll'),
  };

  console.log(`  Visible: ${visible.length}`);
  for (const f of visible) {
    printField(f);
  }

  // Highlight ZD_ / Freifeld fields
  const zdFields = fields.filter(
    (f: any) =>
      f.name?.startsWith('ZD_') ||
      f.name?.startsWith('strZD') ||
      f.name?.includes('Zusatz') ||
      f.name?.includes('Freifeld') ||
      f.id?.startsWith('ZD_') ||
      f.id?.includes('Zusatz')
  );
  if (zdFields.length > 0) {
    console.log(`\n  >>> FREIFELDER / ZUSATZFELDER FOUND: ${zdFields.length} <<<`);
    for (const f of zdFields) {
      console.log(`  ${f.tag} name="${f.name}" id="${f.id}" type=${f.type} visible=${f.visible} value="${f.value}" [${f.rowLabel || ''}]`);
      if (f.options) {
        for (const o of f.options) {
          console.log(`    "${o.text}" = ${o.value}${o.selected ? ' (DEFAULT)' : ''}`);
        }
      }
    }
  }

  return { fields, visible, zdFields };
}

async function main() {
  console.log('=== DFBnet Verein — Mitglied Form Exploration v2 ===\n');

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

    // ========== MEMBER LIST ==========
    console.log('='.repeat(70));
    console.log('STEP 1: Navigate to member list');
    console.log('='.repeat(70));

    await page.goto(URLS.mitgliederListe, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await ss(page, 'mitglieder_liste');

    // Get member list rows — look for clickable names (usually in <a> or directly in <td>)
    const memberRows = await page.$$eval('table.datagrid tr', (rows: HTMLElement[]) =>
      rows
        .slice(2) // skip header rows
        .map((row) => {
          const tds = Array.from(row.querySelectorAll('td'));
          const allLinks = Array.from(row.querySelectorAll('a'));
          // Find the edit/detail link (pencil icon or name link)
          const editLink = allLinks.find(
            (a) =>
              (a as HTMLAnchorElement).href?.includes('index.php') &&
              !(a as HTMLAnchorElement).href?.includes('Delete') &&
              !(a as HTMLAnchorElement).href?.includes('javascript:')
          );
          return {
            cells: tds.map((td) => td.textContent?.trim()?.substring(0, 100)),
            editHref: editLink ? (editLink as HTMLAnchorElement).href : null,
            allHrefs: allLinks.map((a) => ({
              href: (a as HTMLAnchorElement).href?.substring(0, 120),
              title: a.getAttribute('title') || a.textContent?.trim()?.substring(0, 50),
            })),
          };
        })
        .filter((r) => r.cells.length > 2)
    );

    console.log(`\n  Member rows: ${memberRows.length}`);
    for (const r of memberRows.slice(0, 5)) {
      console.log(`    ${r.cells.join(' | ')}`);
      if (r.editHref) console.log(`      Edit: ${r.editHref.substring(0, 80)}...`);
      for (const l of r.allHrefs) {
        console.log(`      Link: "${l.title}" → ${l.href}`);
      }
    }

    // ========== CLICK ON FIRST MEMBER ==========
    // The member list uses clickable table rows or edit icons
    // Try to find an edit icon (pencil) or a direct link in the row
    console.log('\n  Looking for clickable member links...');

    // Try: Find edit icons (img with edit/pencil)
    let memberOpened = false;

    // Approach 1: Click on a member name in the datagrid
    const memberNameLinks = await page.$$('table.datagrid tr td a[href*="index.php"]:not([href*="javascript"])');
    if (memberNameLinks.length > 0) {
      console.log(`  Found ${memberNameLinks.length} direct member links`);
      await memberNameLinks[0].click();
      await page.waitForTimeout(2000);
      await page.waitForLoadState('networkidle').catch(() => {});
      memberOpened = true;
    }

    // Approach 2: Click on edit icon
    if (!memberOpened) {
      const editIcons = await page.$$('table.datagrid a img[src*="edit"], table.datagrid a img[src*="bearbeiten"], table.datagrid a img[src*="pencil"]');
      if (editIcons.length > 0) {
        console.log(`  Found ${editIcons.length} edit icons`);
        await editIcons[0].click();
        await page.waitForTimeout(2000);
        await page.waitForLoadState('networkidle').catch(() => {});
        memberOpened = true;
      }
    }

    // Approach 3: Click on the table row itself (some apps make rows clickable)
    if (!memberOpened) {
      const dataRows = await page.$$('table.datagrid tr:nth-child(n+3)');
      if (dataRows.length > 0) {
        console.log('  Clicking on first data row...');
        await dataRows[0].click();
        await page.waitForTimeout(2000);
        await page.waitForLoadState('networkidle').catch(() => {});
        memberOpened = true;
      }
    }

    // Approach 4: Use Mitglied suchen to find a specific member
    if (!memberOpened) {
      console.log('  No clickable member found in list — trying search...');
      // Navigate to search, leave fields empty, and search to get results with links
      const searchUrl = 'https://verein.dfbnet.org/index.php?ul=YjBmODdjNWJjMzQ3MzAxNzdiMjI5ZmMzZDkzZTRlNzk_TW9kZVBhZ2U9OSZPcGhJZD02ZjZlNmQ2YzZkNmU2ZjZkJmRmYm5ldHZ2PWRkODRjNzAwZDdmODgyMWRjMzNiZGU4ZWNkYTQ5YTRk';
      await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1500);
      // Click search button to get all members
      const searchBtn = await page.$('a:has-text("Suche starten"), a:has-text("Suchen"), input[value="Suchen"]');
      if (searchBtn) {
        await searchBtn.click();
        await page.waitForTimeout(3000);
        await page.waitForLoadState('networkidle').catch(() => {});
      }
    }

    await ss(page, 'after_member_click');
    console.log(`\n  Current URL: ${page.url()}`);
    console.log(`  Title: ${await page.title()}`);

    // ========== CHECK IF WE'RE ON A MEMBER DETAIL PAGE ==========
    const tabs = await getTabLinks(page);
    console.log(`\n  Tabs found: ${tabs.length}`);
    for (const t of tabs) {
      console.log(`    ${t.active ? '>>>' : '   '} ${t.text}`);
    }

    if (tabs.length > 0) {
      console.log('\n='.repeat(70));
      console.log('STEP 2: Explore ALL member tabs');
      console.log('='.repeat(70));

      // First explore the current tab (should be Adresse or whatever is active)
      const activeTab = tabs.find((t: any) => t.active);
      if (activeTab) {
        console.log(`\n  --- Active Tab: ${activeTab.text} ---`);
        await exploreTab(page, activeTab.text, `member_tab_${activeTab.text}`);
      }

      // Then explore all other tabs
      for (const tab of tabs) {
        if (tab.active) continue;

        console.log(`\n  ${'─'.repeat(60)}`);
        console.log(`  TAB: ${tab.text}`);
        console.log(`  ${'─'.repeat(60)}`);

        await page.goto(tab.href, { waitUntil: 'networkidle', timeout: 20000 });
        await page.waitForTimeout(1500);
        await ss(page, `member_tab_${tab.text?.replace(/[^a-zA-Z0-9]/g, '_')}`);

        await exploreTab(page, tab.text, `member_tab_${tab.text}`);
      }
    } else {
      // Maybe we're still on the list — try to find member links differently
      console.log('\n  No tabs found — dumping page content for analysis...');
      const allLinks = await page.$$eval('a', (els: HTMLAnchorElement[]) =>
        els
          .filter((el) => el.offsetParent !== null && el.textContent?.trim())
          .map((el) => ({
            text: el.textContent?.trim()?.substring(0, 80),
            href: el.href?.substring(0, 120),
            class: el.className?.substring(0, 40),
          }))
          .slice(0, 30)
      );
      console.log('  Links on page:');
      for (const l of allLinks) {
        console.log(`    "${l.text}" [${l.class}] → ${l.href}`);
      }
    }

    // ========== SAVE ==========
    writeFileSync(`${SCREENSHOT_DIR}/mitglied_form_data_v2.json`, JSON.stringify(allData, null, 2));
    writeFileSync(`${SCREENSHOT_DIR}/final_v2.html`, await page.content());
    console.log(`\n\n=== ALL DATA SAVED ===`);
    console.log('Browser closing in 15s.\n');
    await page.waitForTimeout(15000);
  } catch (error) {
    console.error('\nERROR:', error);
    writeFileSync(`${SCREENSHOT_DIR}/partial_data_v2.json`, JSON.stringify(allData, null, 2));
    await ss(page, 'error').catch(() => {});
    try { writeFileSync(`${SCREENSHOT_DIR}/error_v2.html`, await page.content()); } catch {}
    console.log('\nPartial data saved. Browser closing in 15s.');
    await page.waitForTimeout(15000);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
