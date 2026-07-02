/**
 * DFBnet DOM Health-Check
 *
 * Frühwarn-System für DFBnet-Updates. Prüft nach dem Login (und optional als
 * Standalone-Script vor jedem Bot-Batch), ob die kritischen DOM-Selektoren
 * noch existieren.
 *
 * Motivation: DFBnet updated regelmäßig (9.1.1 → 9.2.0 → 9.3.0 innerhalb
 * 4 Monaten 2026). Ein Update kann Selektoren umbenennen, Buttons in Modals
 * verschieben, oder Formulare komplett umstrukturieren. Ohne Frühwarnung
 * bemerkt der Passwart das erst wenn die erste Live-Registration fehlschlägt
 * — dann sitzt der Bot mit einem halbfertigen DFBnet-Draft und Kunden warten.
 *
 * Design:
 * - Der Check läuft NACH Login (weil viele Selektoren erst da existieren)
 * - Jeder Selektor wird als CHECK-Objekt registriert mit:
 *     - name: Human-readable ID
 *     - selector: CSS-Selector
 *     - url: URL wo der Selector geprüft werden soll (null = current page)
 *     - severity: 'critical' (blockiert Bot) | 'warning' (nice-to-have)
 * - Bot-Integration: bei mindestens einem 'critical' Miss → BotError SAFETY
 * - Standalone-Mode: bei jedem Miss ein Report in `_stop-the-line/HEALTH-*.md`
 */

import type { Page } from 'playwright';
import { SELECTORS, TIMEOUTS } from '../config/selectors.js';
import { logger } from '../utils/logger.js';

export type HealthCheckSeverity = 'critical' | 'warning';

export type HealthCheckItem = {
  /** Human-readable identifier (z.B. "login.usernameInput") */
  name: string;
  /** CSS-Selector oder Selektor-Ausdruck (Playwright-kompatibel) */
  selector: string;
  /** Wo der Selektor geprüft werden soll:
   * - 'current' = auf der aktuellen Page
   * - 'form' = auf der Spielerpass-Form-Seite (Navigation nötig)
   * - 'mitgliederliste' = auf der Mitgliederliste (ModePage=7)
   */
  page: 'current' | 'form' | 'mitgliederliste';
  /** Wenn critical → Miss blockiert Bot; warning → nur Log-Warning */
  severity: HealthCheckSeverity;
  /** Kurze Beschreibung was der Selector macht (für Alert-Report) */
  purpose: string;
};

export type HealthCheckResult = {
  name: string;
  selector: string;
  severity: HealthCheckSeverity;
  found: boolean;
  page: HealthCheckItem['page'];
  purpose: string;
};

export type HealthCheckReport = {
  timestamp: string;
  totalChecks: number;
  passed: number;
  failedCritical: HealthCheckResult[];
  failedWarning: HealthCheckResult[];
  allResults: HealthCheckResult[];
};

/**
 * Kritische DFBnet-Selektoren die der Bot zum Funktionieren braucht.
 *
 * Die 'critical' Selektoren müssen alle existieren, sonst kann der Bot
 * keine Registration abschließen. 'warning' Selektoren sind für Zusatz-
 * Features die verzichtbar sind (z.B. Verifikation via Mitgliederliste
 * ist ein Nice-to-Have; wenn's fehlt, läuft der Bot mit weniger
 * Sicherheit weiter).
 *
 * Bei DFBnet-Update-Frühwarnung ist das die zentrale Wahrheitsquelle.
 * Bei jedem echten DFBnet-Selektor-Fund im Live-Debug hier aktualisieren.
 */
export const HEALTH_CHECKS: HealthCheckItem[] = [
  // ===== Login (bereits bestanden wenn wir Health-Check laufen) =====
  // Nicht zu prüfen — der Login-Flow wirft schon selbst wenn ein Selektor fehlt.

  // ===== MegaMenu / Navigation =====
  {
    name: 'nav.mgmenu1',
    selector: '#mgmenu1',
    page: 'current',
    severity: 'critical',
    purpose: 'MegaMenu-Container. Wenn weg, gesamte Navigation kaputt.',
  },
  {
    name: 'nav.mitgliederLink',
    selector: '#mgmenu1 a',
    page: 'current',
    severity: 'warning',
    purpose: 'Mitgliederliste-Link für L2-Success-Verification.',
  },

  // ===== Spielerpass-Formular (Adress-Tab) =====
  {
    name: 'form.container',
    selector: SELECTORS.spielerpassForm.formContainer,
    page: 'form',
    severity: 'critical',
    purpose: 'Formular-Container. Ohne ihn kein Formular-Fill möglich.',
  },
  {
    name: 'form.lastName',
    selector: SELECTORS.spielerpassForm.lastName,
    page: 'form',
    severity: 'critical',
    purpose: 'Nachname-Feld (Pflicht-Feld).',
  },
  {
    name: 'form.firstName',
    selector: SELECTORS.spielerpassForm.firstName,
    page: 'form',
    severity: 'critical',
    purpose: 'Vorname-Feld (Pflicht-Feld).',
  },
  {
    name: 'form.birthDate',
    selector: SELECTORS.spielerpassForm.birthDate,
    page: 'form',
    severity: 'critical',
    purpose: 'Geburtsdatum-Feld (Pflicht-Feld).',
  },
  {
    name: 'form.team',
    selector: SELECTORS.spielerpassForm.team,
    page: 'form',
    severity: 'critical',
    purpose: 'Mannschaft-Dropdown (Pflicht-Feld).',
  },
  {
    name: 'form.reason',
    selector: SELECTORS.spielerpassForm.reason,
    page: 'form',
    severity: 'critical',
    purpose: 'Antragsgrund-Dropdown (Pflicht-Feld).',
  },
  {
    name: 'form.saveDraftButton',
    selector: SELECTORS.spielerpassForm.saveDraftButton,
    page: 'form',
    severity: 'critical',
    purpose: 'Entwurf-Speichern-Button. SAFETY-CRITICAL.',
  },
];

/**
 * Führt den Health-Check gegen die aktuelle Session aus.
 *
 * @param page — Playwright Page, bereits eingeloggt
 * @param options.formUrl — Direkte URL zur Spielerpass-Form (für 'form'-Checks)
 * @param options.mitgliederlistenUrl — URL zur Mitgliederliste (für 'mitgliederliste'-Checks)
 * @returns Report mit allen Check-Ergebnissen
 */
export async function runDomHealthCheck(
  page: Page,
  options: {
    formUrl?: string;
    mitgliederlistenUrl?: string;
  } = {}
): Promise<HealthCheckReport> {
  const timestamp = new Date().toISOString();
  const results: HealthCheckResult[] = [];

  // Group checks by page so we navigate as little as possible
  const byPage = {
    current: [] as HealthCheckItem[],
    form: [] as HealthCheckItem[],
    mitgliederliste: [] as HealthCheckItem[],
  };
  for (const check of HEALTH_CHECKS) {
    byPage[check.page].push(check);
  }

  // 1. Current page (bereits geladen, meist Dashboard nach Login)
  for (const check of byPage.current) {
    results.push(await checkSelector(page, check));
  }

  // 2. Form page — nur wenn URL vorhanden
  if (byPage.form.length > 0) {
    if (!options.formUrl) {
      // Skip: nicht als 'failed' markieren, aber warnen
      logger.warn(
        `Health-Check: formUrl nicht angegeben — ${byPage.form.length} Form-Checks übersprungen`
      );
      for (const check of byPage.form) {
        results.push({
          name: check.name,
          selector: check.selector,
          severity: check.severity,
          found: true, // skip = pass (kein false-positive)
          page: check.page,
          purpose: `${check.purpose} [SKIPPED — formUrl nicht bereitgestellt]`,
        });
      }
    } else {
      try {
        await page.goto(options.formUrl, {
          waitUntil: 'domcontentloaded',
          timeout: TIMEOUTS.navigation,
        });
        await page.waitForTimeout(1_500);
        for (const check of byPage.form) {
          results.push(await checkSelector(page, check));
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        logger.error(`Health-Check: Form-Navigation fehlgeschlagen: ${msg}`);
        for (const check of byPage.form) {
          results.push({
            name: check.name,
            selector: check.selector,
            severity: check.severity,
            found: false,
            page: check.page,
            purpose: `${check.purpose} [FEHLER: Form-Navigation gescheitert]`,
          });
        }
      }
    }
  }

  // 3. Mitgliederliste page — nur wenn URL vorhanden
  if (byPage.mitgliederliste.length > 0 && options.mitgliederlistenUrl) {
    try {
      await page.goto(options.mitgliederlistenUrl, {
        waitUntil: 'domcontentloaded',
        timeout: TIMEOUTS.navigation,
      });
      await page.waitForTimeout(1_500);
      for (const check of byPage.mitgliederliste) {
        results.push(await checkSelector(page, check));
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error(`Health-Check: Mitgliederliste-Navigation gescheitert: ${msg}`);
      for (const check of byPage.mitgliederliste) {
        results.push({
          name: check.name,
          selector: check.selector,
          severity: check.severity,
          found: false,
          page: check.page,
          purpose: `${check.purpose} [FEHLER: Navigation gescheitert]`,
        });
      }
    }
  }

  const failedCritical = results.filter((r) => !r.found && r.severity === 'critical');
  const failedWarning = results.filter((r) => !r.found && r.severity === 'warning');
  const passed = results.filter((r) => r.found).length;

  const report: HealthCheckReport = {
    timestamp,
    totalChecks: results.length,
    passed,
    failedCritical,
    failedWarning,
    allResults: results,
  };

  // Log summary
  if (failedCritical.length > 0) {
    logger.error(
      `Health-Check FAILED: ${failedCritical.length} kritische Selektoren FEHLEN. ` +
        `Betroffen: ${failedCritical.map((c) => c.name).join(', ')}`
    );
  } else if (failedWarning.length > 0) {
    logger.warn(
      `Health-Check: ${failedWarning.length} Warning-Selektoren fehlen. ` +
        `Betroffen: ${failedWarning.map((c) => c.name).join(', ')}`
    );
  } else {
    logger.info(`Health-Check OK: ${passed}/${results.length} Selektoren gefunden`);
  }

  return report;
}

/**
 * Prüft einen einzelnen Selektor mit kurzem Timeout.
 * Return: found=true wenn mindestens 1 Element matched.
 */
async function checkSelector(page: Page, check: HealthCheckItem): Promise<HealthCheckResult> {
  try {
    const count = await page.locator(check.selector).count();
    return {
      name: check.name,
      selector: check.selector,
      severity: check.severity,
      found: count > 0,
      page: check.page,
      purpose: check.purpose,
    };
  } catch (error) {
    // Locator-Error → Selector syntaktisch kaputt oder Page tot
    const msg = error instanceof Error ? error.message : String(error);
    logger.warn(`Selector-Check-Error "${check.name}": ${msg}`);
    return {
      name: check.name,
      selector: check.selector,
      severity: check.severity,
      found: false,
      page: check.page,
      purpose: `${check.purpose} [ERROR: ${msg}]`,
    };
  }
}

/**
 * Formatiert den Report als Markdown-Text für Stop-the-line-Docs oder
 * Alert-Mails an den Passwart.
 */
export function formatHealthCheckReport(report: HealthCheckReport): string {
  const lines: string[] = [];
  lines.push(`# DFBnet DOM-Health-Check`);
  lines.push(`**Zeit:** ${report.timestamp}`);
  lines.push(`**Total:** ${report.passed}/${report.totalChecks} Selektoren gefunden`);
  lines.push('');

  if (report.failedCritical.length === 0 && report.failedWarning.length === 0) {
    lines.push(`## Verdikt: OK`);
    lines.push(`Alle Selektoren gefunden. Bot ist voll einsatzbereit.`);
    return lines.join('\n');
  }

  if (report.failedCritical.length > 0) {
    lines.push(`## Verdikt: KRITISCH — Bot wird blockiert`);
    lines.push('');
    lines.push(`${report.failedCritical.length} kritische Selektoren FEHLEN. Der Bot kann keine`);
    lines.push(`Registrations mehr durchführen bis diese wieder verfügbar sind.`);
    lines.push('');
    lines.push(`### Fehlende kritische Selektoren`);
    lines.push('');
    lines.push(`| Name | Selector | Zweck |`);
    lines.push(`|---|---|---|`);
    for (const c of report.failedCritical) {
      lines.push(`| ${c.name} | \`${c.selector}\` | ${c.purpose} |`);
    }
    lines.push('');
  }

  if (report.failedWarning.length > 0) {
    lines.push(`## Warnings`);
    lines.push('');
    lines.push(`${report.failedWarning.length} nicht-kritische Selektoren fehlen. Bot läuft weiter,`);
    lines.push(`aber Zusatz-Features (z.B. Success-Verification) sind eingeschränkt.`);
    lines.push('');
    lines.push(`| Name | Selector | Zweck |`);
    lines.push(`|---|---|---|`);
    for (const c of report.failedWarning) {
      lines.push(`| ${c.name} | \`${c.selector}\` | ${c.purpose} |`);
    }
    lines.push('');
  }

  lines.push(`## Handlungsempfehlung`);
  lines.push('');
  lines.push(`1. **DFBnet manuell öffnen** (verein.dfbnet.org) und prüfen ob ein Update stattfand`);
  lines.push(`2. **DevTools (F12)** die fehlenden Selektoren neu identifizieren`);
  lines.push(`3. **\`apps/rpa-bot/src/config/selectors.ts\`** mit neuen Selektoren aktualisieren`);
  lines.push(`4. **Live-Test** mit Debug-Registration bevor Bot wieder scharfgeschaltet wird`);
  lines.push(`5. **Memory update** in \`cfb-dfbnet-felder.md\` mit neuen Selektoren + Version`);
  lines.push('');

  return lines.join('\n');
}
