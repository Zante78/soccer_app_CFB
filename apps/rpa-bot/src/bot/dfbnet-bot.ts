/**
 * DFBnet RPA Bot — Real Playwright Automation
 *
 * Orchestrates: Login → Navigate → Fill Form → Upload Docs → Visual Check → Save Draft
 *
 * IMPORTANT: This bot operates in DRAFT-ONLY mode.
 * It will NEVER submit/absenden a form — only save as draft.
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { logger, createRegistrationLogger } from '../utils/logger.js';
import { config } from '../config/env.js';
import { BotError, ErrorCategory, categorizePlaywrightError } from '../utils/errors.js';
import { withRetry } from '../utils/retry.js';
import { compareScreenshots } from '../utils/visual-regression.js';
import { loginToDFBnet, type LoginConfig, type IMAPConfig } from '../flows/login.js';
import {
  navigateToSpielerpassForm,
  fillSpielerpassForm,
  uploadDocumentsToForm,
  downloadToTemp,
  cleanupTempFile,
  saveDraft,
  type RegistrationData,
} from '../flows/create-draft.js';
import { SELECTORS } from '../config/selectors.js';
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

      // Try to detect DFBnet version from the page
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
      regLogger.info('Logging in to DFBnet...');
      const loginResult = await loginToDFBnet(page, this.getLoginConfig(registration.id));
      if (!loginResult.success) {
        throw new BotError(
          loginResult.error ?? 'Login failed',
          ErrorCategory.CREDENTIALS
        );
      }

      // 3. Navigate to Spielerpass form
      regLogger.info('Navigating to Spielerpass form...');
      await navigateToSpielerpassForm(page, {
        baseUrl: config.DFBNET_BASE_URL,
        screenshotDir: this.botConfig.screenshotDir,
        registrationId: registration.id,
      });

      // 4. Fill form
      regLogger.info('Filling form...');
      const fillResult = await fillSpielerpassForm(page, registration, {
        screenshotDir: this.botConfig.screenshotDir,
      });

      if (fillResult.warnings.length > 0) {
        regLogger.warn(`Form warnings: ${fillResult.warnings.join('; ')}`);
      }

      // 5. Upload documents (if Supabase is available)
      if (this.supabase && registration.player_data) {
        regLogger.info('Uploading documents...');
        const uploadFiles = await this.prepareUploads(registration, tempFiles);
        if (uploadFiles.length > 0) {
          const uploadResult = await uploadDocumentsToForm(page, uploadFiles);
          if (uploadResult.errors.length > 0) {
            regLogger.warn(`Upload warnings: ${uploadResult.errors.join('; ')}`);
          }
        }
      }

      // 6. Take pre-save screenshot
      const screenshotPath = `${this.botConfig.screenshotDir}/${registration.id}_${executionId}_pre-save.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      regLogger.info(`Screenshot: ${screenshotPath}`);

      // 7. Visual regression check
      const baselinePath = `${this.botConfig.baselineDir}/spielerpass-form.png`;
      const diffResult = await compareScreenshots(screenshotPath, baselinePath, {
        diffThreshold: config.VISUAL_DIFF_THRESHOLD,
        outputDiffPath: `${this.botConfig.screenshotDir}/${registration.id}_${executionId}_diff.png`,
      });

      if (diffResult.threshold_exceeded) {
        // Upload screenshots to Supabase Storage before throwing
        let uploadedActual: string | undefined;
        let uploadedBaseline: string | undefined;
        if (this.supabase) {
          try {
            uploadedActual = await this.uploadScreenshotToStorage(
              screenshotPath,
              `${registration.id}/${executionId}/actual.png`
            );
            uploadedBaseline = await this.uploadScreenshotToStorage(
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

      // 8. Save as draft (NEVER submit!)
      regLogger.info('Saving as draft...');
      const draftResult = await saveDraft(page, {
        screenshotDir: this.botConfig.screenshotDir,
        registrationId: registration.id,
      });

      // 9. Upload screenshots to Supabase Storage
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

      regLogger.info('Draft completed successfully');

      return {
        success: true,
        draft_url: draftResult.draftUrl,
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
   * Prepare document uploads: download from Supabase Storage → temp files.
   */
  private async prepareUploads(
    registration: RegistrationData,
    tempFiles: string[]
  ): Promise<{ localPath: string; inputSelector: string }[]> {
    const uploads: { localPath: string; inputSelector: string }[] = [];

    // Photo
    const photoPath = registration.player_data?.photo_path as string | undefined;
    if (photoPath) {
      try {
        const tempPath = await downloadToTemp(
          config.SUPABASE_URL,
          config.SUPABASE_SERVICE_ROLE_KEY,
          'player-photos',
          photoPath
        );
        tempFiles.push(tempPath);
        uploads.push({
          localPath: tempPath,
          inputSelector: SELECTORS.spielerpassForm.photoUpload,
        });
      } catch (err) {
        logger.warn(`Photo download failed: ${err}`);
      }
    }

    // Documents
    const docPaths = registration.player_data?.document_paths as string[] | undefined;
    if (docPaths) {
      for (const docPath of docPaths) {
        if (!docPath) continue;
        try {
          const tempPath = await downloadToTemp(
            config.SUPABASE_URL,
            config.SUPABASE_SERVICE_ROLE_KEY,
            'player-documents',
            docPath
          );
          tempFiles.push(tempPath);
          uploads.push({
            localPath: tempPath,
            inputSelector: SELECTORS.spielerpassForm.documentUpload,
          });
        } catch (err) {
          logger.warn(`Document download failed (${docPath}): ${err}`);
        }
      }
    }

    return uploads;
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
   */
  private getLoginConfig(registrationId: string): LoginConfig {
    const imapConfig: IMAPConfig | undefined =
      config.IMAP_HOST
        ? {
            host: config.IMAP_HOST,
            port: config.IMAP_PORT,
            username: config.IMAP_USERNAME,
            password: config.IMAP_PASSWORD,
            otpSender: config.IMAP_OTP_SENDER,
          }
        : undefined;

    return {
      baseUrl: config.DFBNET_BASE_URL,
      username: config.DFBNET_USERNAME,
      password: config.DFBNET_PASSWORD,
      screenshotDir: this.botConfig.screenshotDir,
      registrationId,
      headless: this.botConfig.headless,
      imapConfig,
    };
  }
}
