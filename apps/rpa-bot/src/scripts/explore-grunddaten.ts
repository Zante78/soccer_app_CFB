/**
 * DFBnet Verein — Deep Exploration of Grunddaten 2 (ALL Tabs) v2
 *
 * Uses direct URL navigation for each tab (no click-based tab switching).
 * For Freifelder: reads edit links from table#allfreifelder and visits each
 * Auswahl-type field to extract dropdown options.
 *
 * Usage: npx tsx src/scripts/explore-grunddaten.ts
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

const SCREENSHOT_DIR = resolve(process.cwd(), 'screenshots', 'grunddaten2');
mkdirSync(SCREENSHOT_DIR, { recursive: true });

let stepNum = 0;
const allData: Record<string, any> = {};

// All Grunddaten 2 tab URLs extracted from the actual HTML (class="tabbutton-txt")
const TAB_URLS: Record<string, string> = {
  Freifelder:
    'https://verein.dfbnet.org/index.php?ul=NWViNjQzMDM3NTYzZjQ0NTBhM2IxYjFjOGVmZDFkZDQ_TW9kZVBhZ2U9MTAyJk9waElkPTZmNmU2ZDZjNmQ2ZTZmNmQmZGZibmV0dnY9Yjg5NjQxNjkwNDFiYzk4MGRhYzdiMWQ4NmQ1OGRlZDA',
  Ehrungen:
    'https://verein.dfbnet.org/index.php?ul=NWViNjQzMDM3NTYzZjQ0NTBhM2IxYjFjOGVmZDFkZDQ_TW9kZVBhZ2U9MTAzJk9waElkPTZmNmU2ZDZjNmQ2ZTZmNmQmZGZibmV0dnY9NWU0MDhlMjFmNzE3NzczMDRlYTMxNGIwMGZlMTIzYmM',
  'Zeitraeume':
    'https://verein.dfbnet.org/index.php?ul=NWViNjQzMDM3NTYzZjQ0NTBhM2IxYjFjOGVmZDFkZDQ_TW9kZVBhZ2U9MTA0Jk9waElkPTZmNmU2ZDZjNmQ2ZTZmNmQmZGZibmV0dnY9NmM4OGFjNjA2ZmFjZDI4YzFhYzE0ZGJlYTUxMDY5ZmY',
  Altersgruppen:
    'https://verein.dfbnet.org/index.php?ul=NWViNjQzMDM3NTYzZjQ0NTBhM2IxYjFjOGVmZDFkZDQ_TW9kZVBhZ2U9MTEzJk9waElkPTZmNmU2ZDZjNmQ2ZTZmNmQmZGZibmV0dnY9YTBhZWM1MTBlOTBjODMwZTc3NWYyN2U2ZDc2YTlhZTA',
  Mitgliedsstufen:
    'https://verein.dfbnet.org/index.php?ul=NWViNjQzMDM3NTYzZjQ0NTBhM2IxYjFjOGVmZDFkZDQ_TW9kZVBhZ2U9MTE0Jk9waElkPTZmNmU2ZDZjNmQ2ZTZmNmQmZGZibmV0dnY9YWYwMTU1MjhlZGQxY2NiYWM2ODQwOGJiMzcwMmE0YmU',
  Feiertag:
    'https://verein.dfbnet.org/index.php?ul=MzMxMWM2YTUzZDY2MmNmMTRiZmM1ZjRiNTUxNmM2YmU_T3BoSWQ9NmY2ZTZkNmM2ZDZlNmY2ZCZkZmJuZXR2dj01NDRiMjNlNzBkYzUyYTdjNjNjNjliZWNjYWEzMTJiMQ',
  'E-Mail-Signaturen':
    'https://verein.dfbnet.org/index.php?ul=NDY0NTlmZmFmMTY1NWY5YTRjNmQ4ZmU5NTNiNTI5Yzc_T3BoSWQ9NmY2ZTZkNmM2ZDZlNmY2ZCZkZmJuZXR2dj00M2ZjZGI0YWZjMzQ3NWM5M2ZkOGE5MTYxMzMxNTQ3MQ',
  'USt.':
    'https://verein.dfbnet.org/index.php?ul=NWViNjQzMDM3NTYzZjQ0NTBhM2IxYjFjOGVmZDFkZDQ_TW9kZVBhZ2U9MTY5Jk9waElkPTZmNmU2ZDZjNmQ2ZTZmNmQmZGZibmV0dnY9ZWRiYjQyMzAxNTQ0Mjk3Yzc2YjZmZjNiMTA5YTY0MzM',
  Rechnungsstati:
    'https://verein.dfbnet.org/index.php?ul=ZDQ1ODBiNzEzN2Q3ZTA2NmNlMDI5NDFkZWE0OTdiNzY_T3BoSWQ9NmY2ZTZkNmM2ZDZlNmY2ZCZkZmJuZXR2dj01YjI0OGY1NGIwZTQwZGQ2ZGFkYWU5NGQ2ZjBmYTZjMg',
  Notizarten:
    'https://verein.dfbnet.org/index.php?ul=ZGRmMzgzZGIwZjZjZDg5ZDU5NTk4ZGM4NjA4Y2M4YTU_T3BoSWQ9NmY2ZTZkNmM2ZDZlNmY2ZCZkZmJuZXR2dj0zYjM3YjEwNzVhOTFhYTFmZWEwNzRmYjdmNmQ5OTE4NA',
};

const GD1_URL =
  'https://verein.dfbnet.org/index.php?ul=MmY3NWYzODY5YTE5NmJiNDNhNTM4MTY2NTI0MGMxZjU_TW9kZVBhZ2U9MTA1Jk9waElkPTZmNmU2ZDZjNmQ2ZTZmNmQmZGZibmV0dnY9MzY1Yzk4ZjM2MTIzZTllZjIxNzM5YzExMWY2NzU1YWI';

async function ss(page: any, name: string) {
  stepNum++;
  const path = `${SCREENSHOT_DIR}/${String(stepNum).padStart(2, '0')}_${name}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log(`  >> Screenshot: ${name}`);
}

async function getDatagridRows(page: any) {
  // Extract rows from .datagrid tables (the main content tables in DFBnet)
  return page.$$eval('table.datagrid', (tables: HTMLElement[]) =>
    tables.map((t) => ({
      id: t.id,
      header: Array.from(t.querySelectorAll('tr:nth-child(2) td')).map(
        (td) => td.textContent?.trim()
      ),
      rows: Array.from(t.querySelectorAll('tr'))
        .slice(2) // skip title row + header row
        .map((tr) =>
          Array.from(tr.querySelectorAll('td')).map((td) => ({
            text: td.textContent?.trim()?.substring(0, 300),
            links: Array.from(td.querySelectorAll('a')).map((a) => ({
              href: (a as HTMLAnchorElement).href,
              title: a.getAttribute('title') || '',
            })),
          }))
        ),
    }))
  );
}

async function getFormFields(page: any) {
  return page.$$eval(
    'table.dlgform input:not([type="hidden"]), table.dlgform select, table.dlgform textarea',
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
          checked: (el as HTMLInputElement).checked,
          options:
            el.tagName === 'SELECT'
              ? Array.from((el as HTMLSelectElement).options).map((o) => ({
                  value: o.value,
                  text: o.text,
                  selected: o.selected,
                }))
              : undefined,
        };
      })
  );
}

async function main() {
  console.log('=== DFBnet Verein — Grunddaten 2 Deep Exploration v2 ===\n');

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

    // ========== ITERATE ALL TABS VIA DIRECT URL ==========
    for (const [tabName, tabUrl] of Object.entries(TAB_URLS)) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`TAB: ${tabName}`);
      console.log('='.repeat(60));

      await page.goto(tabUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1500);
      await ss(page, `tab_${tabName.replace(/[^a-zA-Z0-9]/g, '_')}`);

      // Get datagrid data (structured)
      const datagrids = await getDatagridRows(page);
      // Get form fields
      const fields = await getFormFields(page);

      const tabData: any = {
        url: tabUrl,
        datagrids,
        fields: fields.filter((f: any) => f.name !== 'searchAll'),
      };

      // Print datagrid contents
      for (const dg of datagrids) {
        console.log(`\n  Datagrid "${dg.id}" — Headers: ${dg.header?.join(' | ')}`);
        for (const row of dg.rows.slice(0, 50)) {
          const texts = row.map((c: any) => c.text).filter((t: any) => t && t.length > 0);
          if (texts.length > 0) {
            console.log(`    ${texts.join(' | ')}`);
          }
        }
      }

      // Print visible fields
      for (const f of fields.filter((f: any) => f.visible && f.name !== 'searchAll')) {
        console.log(`  Field: ${f.name} = "${f.value}" (${f.type}) [${f.rowLabel || ''}]`);
        if (f.options) {
          console.log(
            `    Options: ${f.options.map((o: any) => `${o.text}${o.selected ? ' *' : ''}`).join(', ')}`
          );
        }
      }

      // ===== SPECIAL: For Freifelder tab, read Auswahl options =====
      if (tabName === 'Freifelder') {
        console.log('\n  --- Reading Auswahl options for each Freifeld ---');

        // Extract rows from the #allfreifelder datagrid
        const freifelderGrid = datagrids.find((d: any) => d.id === 'allfreifelder');
        if (freifelderGrid) {
          tabData.freifelder = [];

          for (const row of freifelderGrid.rows) {
            // row = [Aktionen-td, Bezeichnung-td, Typ-td, Vorgabewert-td]
            if (row.length < 3) continue;

            const bezeichnung = row[2]?.text; // Column: Bezeichnung
            const typ = row[3]?.text; // Column: Typ
            const vorgabe = row[4]?.text; // Column: Vorgabewert

            if (!bezeichnung || bezeichnung === 'Bezeichnung') continue;

            // Find edit link (not Delete) in the Aktionen column
            const editLink = row[1]?.links?.find(
              (l: any) => l.href.includes('index.php') && !l.href.includes('Delete')
            )?.href;

            console.log(`\n  Freifeld: "${bezeichnung}" (${typ})`);
            const freifeldData: any = {
              bezeichnung,
              typ,
              vorgabe,
              editLink,
              auswahlOptionen: [],
            };

            if (editLink && typ === 'Auswahl') {
              // Visit edit page to read dropdown options
              await page.goto(editLink, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
              await page.waitForTimeout(1500);

              // Read Attr_ inputs (the Auswahl option values)
              const attrValues = await page.$$eval(
                'input[id^="Attr_"]',
                (els: HTMLInputElement[]) =>
                  els.map((el) => ({
                    id: el.id,
                    value: el.value,
                    name: el.name,
                  }))
              );

              if (attrValues.length > 0) {
                freifeldData.auswahlOptionen = attrValues
                  .map((a: any) => a.value)
                  .filter((v: any) => v);
                console.log(`    Optionen: ${JSON.stringify(freifeldData.auswahlOptionen)}`);
              } else {
                // Fallback: read all visible text inputs
                const editFields = await getFormFields(page);
                freifeldData.editFields = editFields.filter((f: any) => f.visible);
                console.log(`    Edit fields: ${freifeldData.editFields.length}`);
              }

              // Also read the default value radio selection
              const defaultWert = await page
                .$$eval('input[name="iDefaultWert"]:checked', (els: HTMLInputElement[]) =>
                  els.map((el) => el.value)
                )
                .catch(() => []);
              if (defaultWert.length > 0) {
                freifeldData.defaultWertIndex = defaultWert[0];
              }

              // Navigate back to Freifelder tab
              await page.goto(tabUrl, { waitUntil: 'networkidle', timeout: 15000 });
              await page.waitForTimeout(1000);
            } else if (typ !== 'Auswahl') {
              console.log(`    (Typ=${typ}, kein Auswahl — keine Optionen)`);
            } else {
              console.log(`    (kein Edit-Link gefunden)`);
            }

            tabData.freifelder.push(freifeldData);
          }
        } else {
          console.log('  WARNING: #allfreifelder datagrid not found');
        }
      }

      allData[tabName] = tabData;
    }

    // ========== GRUNDDATEN 1 ==========
    console.log(`\n${'='.repeat(60)}`);
    console.log('BONUS: Grunddaten 1');
    console.log('='.repeat(60));

    await page.goto(GD1_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    await ss(page, 'grunddaten_1');

    const gd1Grids = await getDatagridRows(page);
    const gd1Fields = await getFormFields(page);
    allData['Grunddaten 1'] = {
      url: GD1_URL,
      datagrids: gd1Grids,
      fields: gd1Fields.filter((f: any) => f.name !== 'searchAll'),
    };

    for (const f of gd1Fields.filter((f: any) => f.visible && f.name !== 'searchAll')) {
      console.log(`  Field: ${f.name} = "${f.value}" (${f.type}) [${f.rowLabel || ''}]`);
      if (f.options) {
        console.log(
          `    Options: ${f.options.map((o: any) => `${o.text}${o.selected ? ' *' : ''}`).join(', ')}`
        );
      }
    }

    // ========== SAVE ==========
    writeFileSync(`${SCREENSHOT_DIR}/complete_data.json`, JSON.stringify(allData, null, 2));
    writeFileSync(`${SCREENSHOT_DIR}/final.html`, await page.content());
    console.log(`\n\n=== ALL DATA SAVED TO ${SCREENSHOT_DIR}/complete_data.json ===`);
    console.log('Browser closing in 30s. Ctrl+C to exit.\n');
    await page.waitForTimeout(30000);
  } catch (error) {
    console.error('\nERROR:', error);
    writeFileSync(`${SCREENSHOT_DIR}/partial_data_v2.json`, JSON.stringify(allData, null, 2));
    await ss(page, 'error').catch(() => {});
    try {
      writeFileSync(`${SCREENSHOT_DIR}/error_v2.html`, await page.content());
    } catch {}
    console.log('\nPartial data saved. Browser closing in 30s.');
    await page.waitForTimeout(30000);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
