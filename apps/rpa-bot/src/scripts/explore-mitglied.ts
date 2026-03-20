/**
 * DFBnet Verein — Explore Mitglied Form (New Member + Edit)
 *
 * Discovers all form fields including Freifelder (ZD_* selectors)
 * in both "Neues Mitglied" and existing member edit forms.
 *
 * Usage: npx tsx src/scripts/explore-mitglied.ts
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

// Known URLs from dashboard exploration
const URLS = {
  neuesMitglied:
    'https://verein.dfbnet.org/index.php?ul=OGYzYWE3Y2U4MzcyODNlNTk1ZDQwYmU3NWM1MDU1MjM_TW9kZVBhZ2U9OCZPcGhJZD02ZjZlNmQ2YzZkNmU2ZjZkJmRmYm5ldHZ2PTdiYTgyMTFiNjAyOTZiNDQ5OTQ4YmViYzc1Yjg5NzM3',
  mitgliederListe:
    'https://verein.dfbnet.org/index.php?ul=MjI1ZTRhNTA0OWQ0YjJjMGFiMjFiOWQ5MDAzNjNhZjE_TW9kZVBhZ2U9NyZPcGhJZD02ZjZlNmQ2YzZkNmU2ZjZkJmRmYm5ldHZ2PTYwYmU5MzA2YWFlYzI5ZGJiNDg5NTgyYjM0ZGJlYjE5',
  mitgliedSuchen:
    'https://verein.dfbnet.org/index.php?ul=YjBmODdjNWJjMzQ3MzAxNzdiMjI5ZmMzZDkzZTRlNzk_TW9kZVBhZ2U9OSZPcGhJZD02ZjZlNmQ2YzZkNmU2ZjZkJmRmYm5ldHZ2PWRkODRjNzAwZDdmODgyMWRjMzNiZGU4ZWNkYTQ5YTRk',
};

const allData: Record<string, any> = {};

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
        const labelTd = tds[0];
        return {
          tag: el.tagName,
          id: el.id,
          name: (el as HTMLInputElement).name,
          type: (el as HTMLInputElement).type,
          value: (el as HTMLInputElement).value?.substring(0, 300),
          rowLabel: labelTd?.textContent?.trim()?.substring(0, 120),
          visible: el.offsetParent !== null,
          disabled: (el as HTMLInputElement).disabled,
          readOnly: (el as HTMLInputElement).readOnly,
          checked: (el as HTMLInputElement).checked,
          required: (el as HTMLInputElement).required,
          className: el.className?.substring(0, 80),
          maxLength: (el as HTMLInputElement).maxLength > 0 ? (el as HTMLInputElement).maxLength : undefined,
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

async function getHiddenFields(page: any) {
  return page.$$eval('input[type="hidden"]', (els: HTMLInputElement[]) =>
    els.map((el) => ({
      name: el.name,
      id: el.id,
      value: el.value?.substring(0, 200),
    }))
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

async function getPageHeadings(page: any) {
  return page.$$eval(
    'h1, h2, h3, h4, td.txt-title, td.txt-subtitle, legend, .txt-clickpath',
    (els: HTMLElement[]) =>
      els
        .filter((el) => el.offsetParent !== null && el.textContent?.trim())
        .map((el) => ({
          tag: el.tagName,
          cls: el.className?.substring(0, 40),
          text: el.textContent?.trim()?.substring(0, 200),
        }))
  );
}

async function main() {
  console.log('=== DFBnet Verein — Mitglied Form Exploration ===\n');

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

    // ========== 1. "NEUES MITGLIED" FORM ==========
    console.log('='.repeat(70));
    console.log('1. NEUES MITGLIED (New Member Form)');
    console.log('='.repeat(70));

    await page.goto(URLS.neuesMitglied, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await ss(page, 'neues_mitglied');

    // Headings
    const nmHeadings = await getPageHeadings(page);
    console.log('\n  Page Headings:');
    for (const h of nmHeadings) {
      console.log(`    <${h.tag}.${h.cls}> ${h.text}`);
    }

    // Tab links on this page
    const nmTabs = await getTabLinks(page);
    if (nmTabs.length > 0) {
      console.log('\n  Tabs:');
      for (const t of nmTabs) {
        console.log(`    ${t.active ? '>>>' : '   '} ${t.text} → ${t.href.substring(0, 80)}...`);
      }
    }

    // All form fields
    const nmFields = await getAllFormFields(page);
    const nmVisible = nmFields.filter((f: any) => f.visible && f.name !== 'searchAll');
    const nmHidden = await getHiddenFields(page);

    allData['neuesMitglied'] = {
      url: URLS.neuesMitglied,
      headings: nmHeadings,
      tabs: nmTabs,
      visibleFields: nmVisible,
      allFields: nmFields.filter((f: any) => f.name !== 'searchAll'),
      hiddenFields: nmHidden,
    };

    console.log(`\n  Visible fields: ${nmVisible.length}`);
    console.log(`  Hidden fields: ${nmHidden.length}`);
    console.log(`  Total fields: ${nmFields.length}\n`);

    // Print ALL visible fields with details
    console.log('  --- VISIBLE FIELDS ---');
    for (const f of nmVisible) {
      const extra = [];
      if (f.disabled) extra.push('DISABLED');
      if (f.readOnly) extra.push('READONLY');
      if (f.required) extra.push('REQUIRED');
      if (f.maxLength) extra.push(`maxLen=${f.maxLength}`);
      console.log(
        `  ${f.tag} name="${f.name}" id="${f.id}" type=${f.type} value="${f.value}" [${f.rowLabel || ''}] ${extra.join(' ')}`
      );
      if (f.options) {
        console.log(
          `    OPTIONS: ${f.options.map((o: any) => `"${o.text}"=${o.value}${o.selected ? '*' : ''}`).join(', ')}`
        );
      }
    }

    // Print ZD_ fields specifically (Freifelder)
    const zdFields = nmFields.filter((f: any) => f.name?.startsWith('ZD_') || f.name?.startsWith('strZD_') || f.id?.startsWith('ZD_'));
    if (zdFields.length > 0) {
      console.log(`\n  --- FREIFELDER (ZD_* fields): ${zdFields.length} ---`);
      for (const f of zdFields) {
        console.log(`  ${f.tag} name="${f.name}" id="${f.id}" type=${f.type} visible=${f.visible} [${f.rowLabel || ''}]`);
        if (f.options) {
          for (const o of f.options) {
            console.log(`    "${o.text}" = ${o.value}${o.selected ? ' (DEFAULT)' : ''}`);
          }
        }
      }
    } else {
      console.log('\n  No ZD_ fields found — checking if Freifelder are on a sub-tab...');
    }

    // Hidden fields (often contain form state)
    console.log('\n  --- HIDDEN FIELDS ---');
    for (const h of nmHidden.filter((f: any) => f.name)) {
      console.log(`  hidden: name="${h.name}" id="${h.id}" value="${h.value}"`);
    }

    // ========== EXPLORE SUB-TABS OF NEW MEMBER ==========
    if (nmTabs.length > 0) {
      for (const tab of nmTabs) {
        if (tab.active) continue; // Skip currently active tab

        console.log(`\n  ${'─'.repeat(50)}`);
        console.log(`  SUB-TAB: ${tab.text}`);
        console.log(`  ${'─'.repeat(50)}`);

        await page.goto(tab.href, { waitUntil: 'networkidle', timeout: 20000 });
        await page.waitForTimeout(1500);
        await ss(page, `nm_tab_${tab.text?.replace(/[^a-zA-Z0-9]/g, '_')}`);

        const tabFields = await getAllFormFields(page);
        const tabVisible = tabFields.filter((f: any) => f.visible && f.name !== 'searchAll');
        const tabHidden = await getHiddenFields(page);

        allData[`neuesMitglied_tab_${tab.text}`] = {
          url: tab.href,
          visibleFields: tabVisible,
          allFields: tabFields.filter((f: any) => f.name !== 'searchAll'),
          hiddenFields: tabHidden,
        };

        console.log(`  Visible: ${tabVisible.length}, Hidden: ${tabHidden.length}`);

        for (const f of tabVisible) {
          const extra = [];
          if (f.disabled) extra.push('DISABLED');
          if (f.readOnly) extra.push('READONLY');
          if (f.required) extra.push('REQUIRED');
          console.log(
            `  ${f.tag} name="${f.name}" id="${f.id}" type=${f.type} value="${f.value}" [${f.rowLabel || ''}] ${extra.join(' ')}`
          );
          if (f.options) {
            console.log(
              `    OPTIONS: ${f.options.map((o: any) => `"${o.text}"=${o.value}${o.selected ? '*' : ''}`).join(', ')}`
            );
          }
        }

        // Check for ZD_ fields on this sub-tab
        const tabZd = tabFields.filter((f: any) => f.name?.startsWith('ZD_') || f.name?.startsWith('strZD_') || f.id?.startsWith('ZD_'));
        if (tabZd.length > 0) {
          console.log(`\n  !!! FREIFELDER FOUND ON THIS TAB: ${tabZd.length} !!!`);
          for (const f of tabZd) {
            console.log(`  ${f.tag} name="${f.name}" id="${f.id}" type=${f.type} visible=${f.visible} [${f.rowLabel || ''}]`);
            if (f.options) {
              for (const o of f.options) {
                console.log(`    "${o.text}" = ${o.value}${o.selected ? ' (DEFAULT)' : ''}`);
              }
            }
          }
        }
      }
    }

    // ========== 2. EXISTING MEMBER (Edit Form) ==========
    console.log(`\n${'='.repeat(70)}`);
    console.log('2. EXISTING MEMBER (Find first member and open edit form)');
    console.log('='.repeat(70));

    // Go to member list
    await page.goto(URLS.mitgliederListe, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await ss(page, 'mitglieder_liste');

    // Find the first member link in the list
    const memberLinks = await page.$$eval('table.datagrid a', (els: HTMLAnchorElement[]) =>
      els
        .filter((el) => el.href.includes('index.php') && !el.href.includes('Delete'))
        .map((el) => ({
          text: el.textContent?.trim()?.substring(0, 100),
          href: el.href,
        }))
        .slice(0, 10)
    );

    console.log(`\n  Members found: ${memberLinks.length}`);
    for (const m of memberLinks.slice(0, 5)) {
      console.log(`    "${m.text}" → ${m.href.substring(0, 80)}...`);
    }

    if (memberLinks.length > 0) {
      // Click the first member to open their detail/edit page
      const firstMember = memberLinks[0];
      console.log(`\n  Opening: "${firstMember.text}"...`);
      await page.goto(firstMember.href, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      await ss(page, 'mitglied_detail');

      // Page headings
      const mdHeadings = await getPageHeadings(page);
      console.log('\n  Page Headings:');
      for (const h of mdHeadings) {
        console.log(`    <${h.tag}.${h.cls}> ${h.text}`);
      }

      // Tabs
      const mdTabs = await getTabLinks(page);
      if (mdTabs.length > 0) {
        console.log('\n  Tabs:');
        for (const t of mdTabs) {
          console.log(`    ${t.active ? '>>>' : '   '} ${t.text}`);
        }
      }

      // Fields on main tab
      const mdFields = await getAllFormFields(page);
      const mdVisible = mdFields.filter((f: any) => f.visible && f.name !== 'searchAll');
      const mdHidden = await getHiddenFields(page);

      allData['existingMember_main'] = {
        memberName: firstMember.text,
        url: firstMember.href,
        headings: mdHeadings,
        tabs: mdTabs,
        visibleFields: mdVisible,
        allFields: mdFields.filter((f: any) => f.name !== 'searchAll'),
        hiddenFields: mdHidden,
      };

      console.log(`\n  Visible: ${mdVisible.length}, Hidden: ${mdHidden.length}`);

      for (const f of mdVisible) {
        const extra = [];
        if (f.disabled) extra.push('DISABLED');
        if (f.readOnly) extra.push('READONLY');
        console.log(
          `  ${f.tag} name="${f.name}" id="${f.id}" type=${f.type} value="${f.value?.substring(0, 60)}" [${f.rowLabel || ''}] ${extra.join(' ')}`
        );
        if (f.options && f.options.length <= 20) {
          console.log(
            `    OPTIONS: ${f.options.map((o: any) => `"${o.text}"=${o.value}${o.selected ? '*' : ''}`).join(', ')}`
          );
        } else if (f.options) {
          console.log(`    OPTIONS: ${f.options.length} items (first 5: ${f.options.slice(0, 5).map((o: any) => o.text).join(', ')}...)`);
        }
      }

      // ZD_ fields
      const mdZd = mdFields.filter((f: any) => f.name?.startsWith('ZD_') || f.name?.startsWith('strZD_') || f.id?.startsWith('ZD_'));
      if (mdZd.length > 0) {
        console.log(`\n  !!! FREIFELDER ON MEMBER DETAIL: ${mdZd.length} !!!`);
        for (const f of mdZd) {
          console.log(`  ${f.tag} name="${f.name}" id="${f.id}" type=${f.type} visible=${f.visible} value="${f.value}" [${f.rowLabel || ''}]`);
          if (f.options) {
            for (const o of f.options) {
              console.log(`    "${o.text}" = ${o.value}${o.selected ? ' (DEFAULT)' : ''}`);
            }
          }
        }
      }

      // Explore ALL sub-tabs of existing member
      for (const tab of mdTabs) {
        if (tab.active) continue;

        console.log(`\n  ${'─'.repeat(50)}`);
        console.log(`  MEMBER SUB-TAB: ${tab.text}`);
        console.log(`  ${'─'.repeat(50)}`);

        await page.goto(tab.href, { waitUntil: 'networkidle', timeout: 20000 });
        await page.waitForTimeout(1500);
        await ss(page, `member_tab_${tab.text?.replace(/[^a-zA-Z0-9]/g, '_')}`);

        const tFields = await getAllFormFields(page);
        const tVisible = tFields.filter((f: any) => f.visible && f.name !== 'searchAll');

        allData[`existingMember_tab_${tab.text}`] = {
          tabName: tab.text,
          url: tab.href,
          visibleFields: tVisible,
          allFields: tFields.filter((f: any) => f.name !== 'searchAll'),
        };

        console.log(`  Visible: ${tVisible.length}`);

        for (const f of tVisible) {
          const extra = [];
          if (f.disabled) extra.push('DISABLED');
          if (f.readOnly) extra.push('READONLY');
          console.log(
            `  ${f.tag} name="${f.name}" id="${f.id}" type=${f.type} value="${f.value?.substring(0, 60)}" [${f.rowLabel || ''}] ${extra.join(' ')}`
          );
          if (f.options && f.options.length <= 20) {
            console.log(
              `    OPTIONS: ${f.options.map((o: any) => `"${o.text}"=${o.value}${o.selected ? '*' : ''}`).join(', ')}`
            );
          } else if (f.options) {
            console.log(`    OPTIONS: ${f.options.length} items`);
          }
        }

        // ZD_ fields
        const tZd = tFields.filter((f: any) => f.name?.startsWith('ZD_') || f.name?.startsWith('strZD_') || f.id?.startsWith('ZD_'));
        if (tZd.length > 0) {
          console.log(`\n  !!! FREIFELDER FOUND: ${tZd.length} !!!`);
          for (const f of tZd) {
            console.log(`  ${f.tag} name="${f.name}" id="${f.id}" type=${f.type} visible=${f.visible} value="${f.value}" [${f.rowLabel || ''}]`);
            if (f.options) {
              for (const o of f.options) {
                console.log(`    "${o.text}" = ${o.value}${o.selected ? ' (DEFAULT)' : ''}`);
              }
            }
          }
        }
      }
    }

    // ========== SAVE ==========
    writeFileSync(`${SCREENSHOT_DIR}/mitglied_form_data.json`, JSON.stringify(allData, null, 2));
    writeFileSync(`${SCREENSHOT_DIR}/final.html`, await page.content());
    console.log(`\n\n=== ALL DATA SAVED TO ${SCREENSHOT_DIR}/mitglied_form_data.json ===`);
    console.log('Browser closing in 15s.\n');
    await page.waitForTimeout(15000);
  } catch (error) {
    console.error('\nERROR:', error);
    writeFileSync(`${SCREENSHOT_DIR}/partial_data.json`, JSON.stringify(allData, null, 2));
    await ss(page, 'error').catch(() => {});
    try { writeFileSync(`${SCREENSHOT_DIR}/error.html`, await page.content()); } catch {}
    console.log('\nPartial data saved. Browser closing in 15s.');
    await page.waitForTimeout(15000);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
