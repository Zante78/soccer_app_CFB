/**
 * DFBnet RPA Bot — Real Playwright Automation
 *
 * Orchestrates: Login → Navigate → Fill Adresse → Save → Reopen → Fill Zusatzdaten → Upload Photo → Save
 *
 * Three-phase member creation (verified 2026-03-19):
 * Phase 1: Navigate to "Neues Mitglied" → Fill Adresse tab → Speichern
 *          (confirm dialog auto-accepted, member created with Mitgliedsnummer)
 * Phase 2: Open the created member in Edit mode (via search / member list)
 *          (Edit mode shows ALL tabs including red Zusatzdaten tab)
 * Phase 3: Click Zusatzdaten tab → Fill Freifelder → Upload photo → Speichern
 *
 * Key Discovery: The "Neues Mitglied" form only shows the Adresse tab.
 * The Zusatzdaten tab (with Freifelder) only appears in Edit mode.
 *
 * IMPORTANT: The "Freigabe" Freifeld is set to "Nein" — the Passwart
 * must manually approve by setting it to "Ja". No auto-submit.
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { logger, createRegistrationLogger } from '../utils/logger.js';
import { config } from '../config/env.js';
import { BotError, ErrorCategory, categorizePlaywrightError } from '../utils/errors.js';
import { withRetry } from '../utils/retry.js';
import { compareScreenshots } from '../utils/visual-regression.js';
import { loginToDFBnet, type LoginConfig } from '../flows/login.js';
import {
  navigateToMemberForm,
  openCreatedMember,
  fillAdresseTab,
  fillZusatzdatenTab,
  uploadPhotoToForm,
  saveForm,
  downloadToTemp,
  cleanupTempFile,
  type RegistrationData,
} from '../flows/create-draft.js';
import type { SupabaseClient } from '../services/supabase-client.js';
import type { ExecuteRequest, ExecuteResult, HealthCheckResult } from '../types/bot-types.js';

// ===== Types =====

export type BotConfig = {
  headless: boolean;
  timeout: number;
  screenshotDir: string;
  baselineDir: string;
  maxRetries: number;
};

// ===== Bot Class =====

export class DFBnetBot {
  private botConfig: BotConfig;
  private supabase: SupabaseClient | null;

  constructor(botConfig: BotConfig, supabase?: SupabaseClient) {
    this.botConfig = botConfig;
    this.supabase = supabase ?? null;

    // Ensure screenshot directories exist
    if (!existsSync(botConfig.screenshotDir)) {
      mkdirSync(botConfig.screenshotDir, { recursive: true });
    }
    if (!existsSync(botConfig.baselineDir)) {
      mkdirSync(botConfig.baselineDir, { recursive: true });
    }
  }

  /**
   * Execute bot for a single registration.
   * Always returns a structured result — never throws.
   * This is the API contract for server.ts (/execute endpoint).
   */
  async execute(request: ExecuteRequest): Promise<ExecuteResult> {
    const startTime = Date.now();
    const regLogger = createRegistrationLogger(request.registration_id);

    regLogger.info(`Starting execution (live mode) for: ${request.player_name ?? 'unknown'}`);

    try {
      // Fetch full registration data from Supabase
      let registration: RegistrationData;
      if (this.supabase) {
        const regs = await this.supabase.getPendingRegistrations();
        const found = regs.find((r) => r.id === request.registration_id);
        if (!found) {
          return {
            success: false,
            error: `Registration ${request.registration_id} not found or not in READY_FOR_BOT status`,
            duration_ms: Date.now() - startTime,
            mock: false,
          };
        }
        registration = found;
      } else {
        // Fallback: construct minimal registration from request data
        registration = {
          id: request.registration_id,
          player_name: request.player_name ?? 'Unknown',
          player_birth_date: '',
          player_dfb_id: null,
          registration_reason: 'NEW_PLAYER',
          player_data: {},
          team: { id: '', name: request.team_name ?? '', dfbnet_id: null },
        };
      }

      // Run with retry
      const result = await withRetry(
        () => this.processRegistration(registration),
        {
          maxRetries: this.botConfig.maxRetries,
          baseDelayMs: 5000,
          maxDelayMs: 60_000,
          onRetry: (error, attempt) => {
            regLogger.warn(`Retry ${attempt}: ${error instanceof Error ? error.message : error}`);
          },
        }
      );

      return {
        ...result,
        duration_ms: Date.now() - startTime,
        mock: false,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const isVisualRegression =
        error instanceof BotError && error.category === ErrorCategory.VISUAL_REGRESSION;

      regLogger.error(`Execution failed: ${errorMsg}`);

      return {
        success: false,
        visual_regression_error: isVisualRegression,
        screenshot_actual: error instanceof BotError ? error.screenshotPath : undefined,
        visual_diff_score: isVisualRegression ? undefined : null,
        error: errorMsg,
        duration_ms: Date.now() - startTime,
        mock: false,
      };
    }
  }

  /**
   * Health check: test DFBnet login without filling any forms.
   */
  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    let browser: Browser | null = null;
    try {
      browser = await chromium.launch({ headless: this.botConfig.headless });
      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        locale: 'de-DE',
        timezoneId: 'Europe/Berlin',
      });
      const page = await context.newPage();
      page.setDefaultTimeout(this.botConfig.timeout);

      const loginResult = await loginToDFBnet(page, this.getLoginConfig('health-check'));

      if (!loginResult.success) {
        return {
          success: false,
          duration_ms: Date.now() - startTime,
          error: loginResult.error ?? 'Login failed',
          mock: false,
        };
      }

      // Try to detect DFBnet version from the page footer
      let dfbnetVersion: string | undefined;
      try {
        const versionEl = await page.$('.version, .footer-version, #version');
        if (versionEl) {
          dfbnetVersion = (await versionEl.textContent())?.trim();
        }
      } catch { /* version detection is optional */ }

      return {
        success: true,
        duration_ms: Date.now() - startTime,
        dfbnet_version: dfbnetVersion,
        mock: false,
      };
    } catch (error) {
      return {
        success: false,
        duration_ms: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
        mock: false,
      };
    } finally {
      if (browser) await browser.close();
    }
  }

  /**
   * Full registration processing pipeline.
   * Called by execute() with retry wrapper.
   *
   * 3-Phase Pipeline (verified 2026-03-19):
   * 1. Launch browser
   * 2. Login to DFBnet Verein (3-field login)
   * 3. Navigate to "Neues Mitglied" form (extract URL from MegaMenu DOM)
   * Phase 1: Fill Adresse tab → Speichern (confirm dialog → member created)
   * Phase 2: Open created member in Edit mode (via search/member list)
   * Phase 3: Click Zusatzdaten tab → Fill Freifelder → Upload photo → Speichern
   * 4. Visual regression check
   * 5. Upload screenshots to Supabase Storage
   */
  private async processRegistration(
    registration: RegistrationData
  ): Promise<Omit<ExecuteResult, 'duration_ms' | 'mock'>> {
    const regLogger = createRegistrationLogger(registration.id);
    const executionId = randomUUID();

    let browser: Browser | null = null;
    const tempFiles: string[] = [];

    try {
      // 1. Launch browser
      regLogger.info('Launching browser...');
      browser = await chromium.launch({
        headless: this.botConfig.headless,
        slowMo: this.botConfig.headless ? 0 : 100,
      });

      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        locale: 'de-DE',
        timezoneId: 'Europe/Berlin',
      });

      const page = await context.newPage();
      page.setDefaultTimeout(this.botConfig.timeout);

      // 2. Login
      regLogger.info('Logging in to DFBnet Verein...');
      const loginResult = await loginToDFBnet(page, this.getLoginConfig(registration.id));
      if (!loginResult.success) {
        throw new BotError(
          loginResult.error ?? 'Login failed',
          ErrorCategory.CREDENTIALS
        );
      }

      // === Phase 1: Create member via "Neues Mitglied" ===

      // 3. Navigate to "Neues Mitglied" form (extract URL from MegaMenu DOM)
      regLogger.info('Navigating to Neues Mitglied form...');
      const navConfig = {
        baseUrl: config.DFBNET_BASE_URL,
        screenshotDir: this.botConfig.screenshotDir,
        registrationId: registration.id,
      };
      await navigateToMemberForm(page, navConfig);

      // 4. Fill Adresse tab (personal data — only tab available in "Neues Mitglied")
      regLogger.info('Filling Adresse tab...');
      const adresseResult = await fillAdresseTab(page, registration, {
        screenshotDir: this.botConfig.screenshotDir,
      });

      if (adresseResult.warnings.length > 0) {
        regLogger.warn(`Adresse warnings: ${adresseResult.warnings.join('; ')}`);
      }

      // 5. Save Adresse → member is created (confirm dialog auto-accepted)
      regLogger.info('Saving Adresse (creating member — confirm dialog will be auto-accepted)...');
      const adresseSaveResult = await saveForm(page, {
        screenshotDir: this.botConfig.screenshotDir,
        registrationId: registration.id,
        stepName: 'adresse',
      });

      if (adresseSaveResult.mitgliedsnummer) {
        regLogger.info(`Member created with Mitgliedsnummer: ${adresseSaveResult.mitgliedsnummer}`);
      }

      // === Phase 2 (conditional): Reopen member in Edit mode ===
      // After saving "Neues Mitglied", DFBnet MAY stay in Edit mode (all tabs visible)
      // or MAY stay in "Neues Mitglied" mode (only Adresse tab). Check first.
      const zusatzdatenTabExists = await page.$(
        'a[class*="tabbutton-txt"]:has-text("Zusatzdaten")'
      );

      if (zusatzdatenTabExists) {
        regLogger.info('Zusatzdaten tab already available — skipping Phase 2 (reopen)');
      } else {
        regLogger.info('Zusatzdaten tab not found — reopening member in Edit mode (Phase 2)...');
        const openResult = await openCreatedMember(page, registration, navConfig);

        if (!openResult.success) {
          throw new BotError(
            `Failed to reopen member in Edit mode: ${openResult.error ?? 'unknown error'}`,
            ErrorCategory.NAVIGATION
          );
        }
      }

      // === Phase 3: Fill Zusatzdaten + Photo + Save ===

      // 6. Fill Zusatzdaten tab (clicks red tab internally, fills Freifelder)
      regLogger.info('Filling Zusatzdaten tab (Freifelder)...');
      const zusatzdatenResult = await fillZusatzdatenTab(page, registration, {
        screenshotDir: this.botConfig.screenshotDir,
      });

      if (zusatzdatenResult.warnings.length > 0) {
        regLogger.warn(`Zusatzdaten warnings: ${zusatzdatenResult.warnings.join('; ')}`);
      }

      // 7. Upload photo (if available)
      if (this.supabase) {
        const photoPath = registration.player_data?.photo_path as string | undefined;
        if (photoPath) {
          regLogger.info('Uploading photo...');
          try {
            const tempPath = await downloadToTemp(
              config.SUPABASE_URL,
              config.SUPABASE_SERVICE_ROLE_KEY,
              'player-photos',
              photoPath
            );
            tempFiles.push(tempPath);
            const uploadResult = await uploadPhotoToForm(page, tempPath);
            if (uploadResult.errors.length > 0) {
              regLogger.warn(`Photo upload warnings: ${uploadResult.errors.join('; ')}`);
            }
          } catch (err) {
            regLogger.warn(`Photo download/upload failed: ${err}`);
          }
        }
      }

      // 8. Save Zusatzdaten
      regLogger.info('Saving Zusatzdaten...');
      const zusatzdatenSaveResult = await saveForm(page, {
        screenshotDir: this.botConfig.screenshotDir,
        registrationId: registration.id,
        stepName: 'zusatzdaten',
      });

      // 9. Take final screenshot for visual regression
      const screenshotPath = `${this.botConfig.screenshotDir}/${registration.id}_${executionId}_final.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      regLogger.info(`Final screenshot: ${screenshotPath}`);

      // Visual regression check
      const baselinePath = `${this.botConfig.baselineDir}/member-form.png`;
      const diffResult = await compareScreenshots(screenshotPath, baselinePath, {
        diffThreshold: config.VISUAL_DIFF_THRESHOLD,
        outputDiffPath: `${this.botConfig.screenshotDir}/${registration.id}_${executionId}_diff.png`,
      });

      if (diffResult.threshold_exceeded) {
        if (this.supabase) {
          try {
            await this.uploadScreenshotToStorage(
              screenshotPath,
              `${registration.id}/${executionId}/actual.png`
            );
            await this.uploadScreenshotToStorage(
              baselinePath,
              `${registration.id}/${executionId}/baseline.png`
            );
          } catch { /* non-critical */ }
        }

        throw new BotError(
          `Visual regression: ${(diffResult.diff_score * 100).toFixed(3)}% diff exceeds ${(config.VISUAL_DIFF_THRESHOLD * 100).toFixed(1)}% threshold`,
          ErrorCategory.VISUAL_REGRESSION,
          { screenshotPath }
        );
      }

      // 10. Upload screenshots to Supabase Storage
      let screenshotActualPath: string | undefined;
      let screenshotBaselinePath: string | undefined;
      if (this.supabase) {
        try {
          screenshotActualPath = await this.uploadScreenshotToStorage(
            screenshotPath,
            `${registration.id}/${executionId}/actual.png`
          );
          if (existsSync(baselinePath)) {
            screenshotBaselinePath = await this.uploadScreenshotToStorage(
              baselinePath,
              `${registration.id}/${executionId}/baseline.png`
            );
          }
        } catch (err) {
          regLogger.warn(`Screenshot upload failed: ${err}`);
        }
      }

      regLogger.info('Member created successfully');

      return {
        success: true,
        draft_url: zusatzdatenSaveResult.draftUrl,
        screenshot_actual: screenshotActualPath ?? screenshotPath,
        screenshot_baseline: screenshotBaselinePath ?? baselinePath,
        visual_diff_score: diffResult.diff_score,
        dfbnet_version: undefined,
      };
    } finally {
      // Cleanup
      if (browser) await browser.close();
      for (const tempFile of tempFiles) cleanupTempFile(tempFile);
    }
  }

  /**
   * Upload a local screenshot file to Supabase Storage.
   */
  private async uploadScreenshotToStorage(
    localPath: string,
    storagePath: string
  ): Promise<string> {
    if (!this.supabase) throw new Error('Supabase client not available');
    const buffer = readFileSync(localPath);
    return this.supabase.uploadScreenshot('rpa-screenshots', storagePath, buffer);
  }

  /**
   * Build login config from environment.
   * DFBnet Verein uses 3-field login: username, password, Kundennummer.
   * No IMAP/2FA needed.
   */
  private getLoginConfig(registrationId: string): LoginConfig {
    return {
      baseUrl: config.DFBNET_BASE_URL,
      username: config.DFBNET_USERNAME,
      password: config.DFBNET_PASSWORD,
      kundennummer: config.DFBNET_KUNDENNUMMER,
      screenshotDir: this.botConfig.screenshotDir,
      registrationId,
      headless: this.botConfig.headless,
    };
  }
}
