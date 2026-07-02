/**
 * Standalone DOM-Health-Check
 *
 * Läuft gegen Live-DFBnet (echtes Login), führt kompletten Selektor-Check aus,
 * schreibt Report als Markdown-Datei nach `_stop-the-line/HEALTH-YYYY-MM-DD-HHmm.md`.
 *
 * Verwendung:
 *   npx tsx src/test/test-health-check.ts
 *
 * Für Nightly-Cron: Aufruf im GitHub-Actions-Workflow oder Vercel-Cron.
 * Bei kritischem Miss: Exit-Code 1 → CI/Cron-Alert triggerbar.
 *
 * Env-Vars (via .env.local):
 *   DFBNET_BASE_URL, DFBNET_USERNAME, DFBNET_PASSWORD
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { loginToDFBnet } from '../flows/login.js';
import { runDomHealthCheck, formatHealthCheckReport } from '../flows/health-check.js';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

async function main(): Promise<void> {
  logger.info('='.repeat(60));
  logger.info('DFBnet DOM Health-Check (Standalone)');
  logger.info('='.repeat(60));

  const outputDir = resolve(process.cwd(), '../..', '_stop-the-line');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, '-').substring(0, 16);
  const reportPath = join(outputDir, `HEALTH-${stamp}.md`);

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
  });
  const page = await context.newPage();

  let exitCode = 0;

  try {
    // 1. Login
    logger.info('Logging in to DFBnet...');
    const loginResult = await loginToDFBnet(page, {
      baseUrl: config.DFBNET_BASE_URL,
      username: config.DFBNET_USERNAME,
      password: config.DFBNET_PASSWORD,
      customerNumber: config.DFBNET_CUSTOMER_NUMBER || undefined,
      screenshotDir: resolve(process.cwd(), 'screenshots', 'health-check'),
      registrationId: 'health-check',
      headless: false,
    });

    if (!loginResult.success) {
      logger.error(`Login failed: ${loginResult.error}`);
      // Kein Health-Check ohne Login. Wir schreiben trotzdem einen Report.
      const failReport = [
        `# DFBnet DOM-Health-Check`,
        `**Zeit:** ${now.toISOString()}`,
        ``,
        `## Verdikt: LOGIN-FEHLER`,
        ``,
        `Der Health-Check konnte nicht starten weil der Login fehlgeschlagen ist:`,
        ``,
        `\`\`\``,
        loginResult.error ?? 'unbekannt',
        `\`\`\``,
        ``,
        `Das kann bedeuten:`,
        `- Login-Selektoren haben sich geändert (DFBnet-Update)`,
        `- 2FA blockiert automatisierten Login`,
        `- Credentials sind veraltet / abgelaufen`,
        `- DFBnet ist nicht erreichbar`,
        ``,
        `Bitte manuell prüfen bevor Bot wieder aktiviert wird.`,
      ].join('\n');
      writeFileSync(reportPath, failReport, 'utf-8');
      logger.error(`Report geschrieben: ${reportPath}`);
      exitCode = 2;
      return;
    }

    // 2. Extract session-encoded URLs from MegaMenu
    // DFBnet URLs sind base64-encoded mit Session-ID (`?ul=...`) — Hardcoded
    // Pfade funktionieren nicht. Wir müssen die realen URLs aus dem geladenen
    // MegaMenu extrahieren (analog zum echten Bot-Flow).
    logger.info('Extracting session-encoded URLs from MegaMenu...');
    const menuUrls: { neuesMitglied?: string; mitgliederliste?: string } = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('#mgmenu1 a[href*="index.php"]')) as HTMLAnchorElement[];
      let neuesMitglied: string | undefined;
      let mitgliederliste: string | undefined;
      for (const a of links) {
        const text = (a.textContent || '').trim();
        if (text === 'Neues Mitglied') neuesMitglied = a.href;
        if (text === 'Mitglieder') mitgliederliste = a.href;
      }
      return { neuesMitglied, mitgliederliste };
    });

    if (!menuUrls.neuesMitglied) {
      logger.warn('MegaMenu-Link "Neues Mitglied" nicht gefunden — Form-Checks werden übersprungen');
    } else {
      logger.info(`Form-URL extrahiert: ${menuUrls.neuesMitglied.substring(0, 80)}...`);
    }

    // 3. Health-Check
    logger.info('Running DOM health-check...');
    const report = await runDomHealthCheck(page, {
      formUrl: menuUrls.neuesMitglied,
      mitgliederlistenUrl: menuUrls.mitgliederliste,
    });

    const markdown = formatHealthCheckReport(report);
    writeFileSync(reportPath, markdown, 'utf-8');
    logger.info(`Report geschrieben: ${reportPath}`);

    // Exit-Code für Cron-Alert
    if (report.failedCritical.length > 0) {
      logger.error(`Health-Check FAILED: ${report.failedCritical.length} kritische Selektoren fehlen`);
      exitCode = 1;
    } else if (report.failedWarning.length > 0) {
      logger.warn(`Health-Check: ${report.failedWarning.length} Warnings — Bot funktioniert eingeschränkt`);
      exitCode = 0; // Warnings sind kein Failure
    } else {
      logger.info(`Health-Check OK: ${report.passed}/${report.totalChecks} Selektoren gefunden`);
      exitCode = 0;
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error(`Health-Check aborted: ${msg}`);
    const errorReport = [
      `# DFBnet DOM-Health-Check`,
      `**Zeit:** ${now.toISOString()}`,
      ``,
      `## Verdikt: UNERWARTETER FEHLER`,
      ``,
      `Der Health-Check ist mit einer Exception abgebrochen:`,
      ``,
      `\`\`\``,
      msg,
      `\`\`\``,
      ``,
      `Stack:`,
      `\`\`\``,
      error instanceof Error ? error.stack ?? '(kein Stack)' : String(error),
      `\`\`\``,
    ].join('\n');
    writeFileSync(reportPath, errorReport, 'utf-8');
    exitCode = 3;
  } finally {
    await browser.close();
  }

  process.exit(exitCode);
}

main().catch((err) => {
  logger.error(`Unhandled: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(4);
});
