/**
 * DFBnet Draft Creation Flow
 *
 * Navigation → Form Filling → Document Upload → Draft Save (NEVER Submit)
 */

import type { Page } from 'playwright';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { SELECTORS, REASON_LABELS, TIMEOUTS } from '../config/selectors.js';
import { BotError, ErrorCategory, categorizePlaywrightError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

// ===== Types =====

export type RegistrationData = {
  id: string;
  player_name: string;
  player_birth_date: string;
  player_dfb_id: string | null;
  registration_reason: string;
  player_data: Record<string, unknown>;
  team: {
    id: string;
    name: string;
    dfbnet_id: string | null;
  };
};

export type NavigationConfig = {
  baseUrl: string;
  screenshotDir: string;
  registrationId: string;
};

export type NavigationResult = {
  success: boolean;
  screenshotPath: string;
  error?: string;
};

export type FillConfig = {
  screenshotDir: string;
};

export type FillResult = {
  success: boolean;
  filledFields: string[];
  skippedFields: string[];
  warnings: string[];
  screenshotPath: string;
};

export type UploadResult = {
  success: boolean;
  uploadedFiles: number;
  errors: string[];
};

export type DraftResult = {
  success: boolean;
  draftUrl: string | null;
  screenshotPath: string;
  error?: string;
};

// ===== Field Mapping =====

type FieldType = 'text' | 'date' | 'select';

type FieldMapping = {
  selector: string;
  type: FieldType;
  getValue: (reg: RegistrationData) => string | null;
  label: string;
  optional: boolean;
};

/**
 * Declarative mapping: registration data → DFBnet form fields
 */
function getFieldMappings(): FieldMapping[] {
  return [
    {
      selector: SELECTORS.spielerpassForm.lastName,
      type: 'text',
      getValue: (reg) => {
        const parts = reg.player_name.split(' ');
        return parts.length > 1 ? parts.slice(-1)[0] : reg.player_name;
      },
      label: 'Nachname',
      optional: false,
    },
    {
      selector: SELECTORS.spielerpassForm.firstName,
      type: 'text',
      getValue: (reg) => {
        const parts = reg.player_name.split(' ');
        return parts.length > 1 ? parts.slice(0, -1).join(' ') : '';
      },
      label: 'Vorname',
      optional: false,
    },
    {
      selector: SELECTORS.spielerpassForm.birthDate,
      type: 'date',
      getValue: (reg) => reg.player_birth_date,
      label: 'Geburtsdatum',
      optional: false,
    },
    {
      selector: SELECTORS.spielerpassForm.team,
      type: 'select',
      getValue: (reg) => reg.team.name,
      label: 'Mannschaft',
      optional: false,
    },
    {
      selector: SELECTORS.spielerpassForm.registrationNumber,
      type: 'text',
      getValue: (reg) => reg.player_dfb_id,
      label: 'Spielernummer',
      optional: true,
    },
    {
      selector: SELECTORS.spielerpassForm.reason,
      type: 'select',
      getValue: (reg) => REASON_LABELS[reg.registration_reason] ?? null,
      label: 'Antragsgrund',
      optional: false,
    },
    {
      selector: SELECTORS.spielerpassForm.previousTeam,
      type: 'text',
      getValue: (reg) => (reg.player_data?.previous_team_name as string) ?? null,
      label: 'Vorheriger Verein',
      optional: true,
    },
    {
      selector: SELECTORS.spielerpassForm.deregistrationDate,
      type: 'date',
      getValue: (reg) => (reg.player_data?.previous_team_deregistration_date as string) ?? null,
      label: 'Abmeldedatum',
      optional: true,
    },
  ];
}

// ===== Navigation =====

/**
 * Navigate to the Spielerpass form.
 * Strategy: Direct URL first, menu navigation as fallback.
 */
export async function navigateToSpielerpassForm(
  page: Page,
  config: NavigationConfig
): Promise<NavigationResult> {
  const { baseUrl, screenshotDir, registrationId } = config;
  const screenshotPath = `${screenshotDir}/${registrationId}_navigation.png`;

  try {
    // Strategy 1: Direct URL
    const directUrl = `${baseUrl}${SELECTORS.dashboard.spielerpassFormPath}`;
    logger.info(`Navigating directly to: ${directUrl}`);

    await page.goto(directUrl, {
      waitUntil: 'domcontentloaded',
      timeout: TIMEOUTS.navigation,
    });

    // Check if form loaded
    const formFound = await page.$(SELECTORS.spielerpassForm.formContainer);
    if (formFound) {
      await page.screenshot({ path: screenshotPath, fullPage: true });
      logger.info('Form found via direct URL');
      return { success: true, screenshotPath };
    }

    // Strategy 2: Menu navigation fallback
    logger.info('Direct URL failed, trying menu navigation...');
    await page.click(SELECTORS.dashboard.spielerverwaltungLink, {
      timeout: TIMEOUTS.elementVisible,
    });
    await page.click(SELECTORS.dashboard.spielerpassBeantragen, {
      timeout: TIMEOUTS.elementVisible,
    });

    await page.waitForSelector(SELECTORS.spielerpassForm.formContainer, {
      timeout: TIMEOUTS.elementVisible,
    });

    await page.screenshot({ path: screenshotPath, fullPage: true });
    logger.info('Form found via menu navigation');
    return { success: true, screenshotPath };
  } catch (error) {
    try {
      await page.screenshot({ path: screenshotPath, fullPage: true });
    } catch { /* ignore screenshot failure */ }

    const botError = categorizePlaywrightError(error);
    botError.screenshotPath = screenshotPath;
    throw new BotError(
      `Navigation to Spielerpass form failed: ${botError.message}`,
      ErrorCategory.NAVIGATION,
      { screenshotPath, cause: error }
    );
  }
}

// ===== Form Filling =====

/**
 * Fill the Spielerpass form with registration data.
 * Partial filling is allowed (draft mode) — warnings are returned for skipped fields.
 */
export async function fillSpielerpassForm(
  page: Page,
  registration: RegistrationData,
  config: FillConfig
): Promise<FillResult> {
  const { screenshotDir } = config;
  const screenshotPath = `${screenshotDir}/${registration.id}_form-filled.png`;
  const filledFields: string[] = [];
  const skippedFields: string[] = [];
  const warnings: string[] = [];

  const mappings = getFieldMappings();

  for (const mapping of mappings) {
    const value = mapping.getValue(registration);

    // Skip null/empty optional fields
    if (!value) {
      if (mapping.optional) {
        skippedFields.push(mapping.label);
        continue;
      }
      warnings.push(`Required field "${mapping.label}" has no value`);
      skippedFields.push(mapping.label);
      continue;
    }

    try {
      await fillField(page, mapping.selector, value, mapping.type, mapping.label);
      filledFields.push(mapping.label);
    } catch (error) {
      const msg = `Could not fill "${mapping.label}": ${error instanceof Error ? error.message : error}`;
      warnings.push(msg);
      skippedFields.push(mapping.label);
      logger.warn(msg);
    }
  }

  await page.screenshot({ path: screenshotPath, fullPage: true });

  logger.info(
    `Form filled: ${filledFields.length} fields, ${skippedFields.length} skipped, ${warnings.length} warnings`
  );

  return {
    success: warnings.filter((w) => w.startsWith('Required')).length === 0,
    filledFields,
    skippedFields,
    warnings,
    screenshotPath,
  };
}

/**
 * Fill a single form field by type.
 */
async function fillField(
  page: Page,
  selector: string,
  value: string,
  type: FieldType,
  label: string
): Promise<void> {
  await page.waitForSelector(selector, {
    state: 'visible',
    timeout: TIMEOUTS.elementVisible,
  });

  switch (type) {
    case 'text':
      await page.fill(selector, value);
      break;

    case 'date':
      // Convert ISO date (YYYY-MM-DD) to German format (DD.MM.YYYY)
      await page.fill(selector, formatDateDE(value));
      break;

    case 'select':
      await fillSelect(page, selector, value, label);
      break;
  }
}

/**
 * Fill a select/dropdown — handles both native <select> and custom dropdowns.
 */
async function fillSelect(
  page: Page,
  selector: string,
  value: string,
  label: string
): Promise<void> {
  const el = await page.$(selector);
  if (!el) throw new Error(`Select element not found: ${selector}`);

  const tagName = await el.evaluate((node) => node.tagName.toLowerCase());

  if (tagName === 'select') {
    // Native <select> — try by label text first, then by value
    try {
      await page.selectOption(selector, { label: value });
    } catch {
      await page.selectOption(selector, { value });
    }
  } else {
    // Custom dropdown — click to open, then select option by text
    await el.click();
    await page.click(`text="${value}"`, { timeout: TIMEOUTS.elementVisible });
  }

  logger.info(`Selected "${value}" for "${label}"`);
}

// ===== Document Upload =====

/**
 * Upload files to the DFBnet form.
 * Downloads from Supabase Storage URLs to temp, then uses page.setInputFiles().
 */
export async function uploadDocumentsToForm(
  page: Page,
  filePaths: { localPath: string; inputSelector: string }[]
): Promise<UploadResult> {
  let uploadedFiles = 0;
  const errors: string[] = [];

  for (const { localPath, inputSelector } of filePaths) {
    try {
      // Reveal hidden file input (if behind a drag-and-drop zone)
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      await page.evaluate(`
        (function() {
          var input = document.querySelector('${inputSelector.replace(/'/g, "\\'")}');
          if (input) {
            input.style.display = 'block';
            input.style.opacity = '1';
            input.style.position = 'static';
          }
        })()
      `);

      await page.setInputFiles(inputSelector, localPath, {
        timeout: TIMEOUTS.fileUpload,
      });

      uploadedFiles++;
      logger.info(`Uploaded: ${localPath}`);
    } catch (error) {
      const msg = `Upload failed for ${localPath}: ${error instanceof Error ? error.message : error}`;
      errors.push(msg);
      logger.warn(msg);
    }
  }

  return {
    success: errors.length === 0,
    uploadedFiles,
    errors,
  };
}

/**
 * Download a file from Supabase Storage to a temp directory.
 */
export async function downloadToTemp(
  supabaseUrl: string,
  serviceRoleKey: string,
  bucket: string,
  storagePath: string
): Promise<string> {
  const url = `${supabaseUrl}/storage/v1/object/${bucket}/${storagePath}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${serviceRoleKey}` },
  });

  if (!response.ok) {
    throw new Error(`Download failed (${response.status}): ${storagePath}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const tempDir = join(tmpdir(), 'cfb-rpa');
  if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

  const filename = storagePath.split('/').pop() ?? 'file';
  const tempPath = join(tempDir, `${Date.now()}_${filename}`);
  writeFileSync(tempPath, buffer);

  return tempPath;
}

/**
 * Clean up temp files after upload.
 */
export function cleanupTempFile(filePath: string): void {
  try {
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  } catch {
    logger.warn(`Failed to clean up temp file: ${filePath}`);
  }
}

// ===== Draft Save (SAFETY CRITICAL) =====

/**
 * Save the form as draft. NEVER submits the form.
 *
 * Safety checks:
 * 1. Button text MUST contain "Entwurf" (case-insensitive)
 * 2. Button text MUST NOT contain "Absenden" or "Einreichen"
 * 3. Only after both checks pass, the button is clicked
 */
export async function saveDraft(
  page: Page,
  config: { screenshotDir: string; registrationId: string }
): Promise<DraftResult> {
  const { screenshotDir, registrationId } = config;
  const screenshotPath = `${screenshotDir}/${registrationId}_draft-saved.png`;

  try {
    // Find the draft button
    await page.waitForSelector(SELECTORS.spielerpassForm.saveDraftButton, {
      state: 'visible',
      timeout: TIMEOUTS.elementVisible,
    });

    // SAFETY CHECK 1: Button text must contain "Entwurf"
    const buttonText = await page.textContent(SELECTORS.spielerpassForm.saveDraftButton) ?? '';
    const normalizedText = buttonText.trim().toLowerCase();

    if (!normalizedText.includes('entwurf')) {
      throw new BotError(
        `SAFETY: Draft button text "${buttonText}" does not contain "Entwurf". Refusing to click.`,
        ErrorCategory.SAFETY,
        { screenshotPath }
      );
    }

    // SAFETY CHECK 2: Button text must NOT contain submit keywords
    const submitKeywords = ['absenden', 'einreichen', 'submit'];
    for (const keyword of submitKeywords) {
      if (normalizedText.includes(keyword)) {
        throw new BotError(
          `SAFETY: Button text "${buttonText}" contains "${keyword}". This might be a submit button. Refusing to click.`,
          ErrorCategory.SAFETY,
          { screenshotPath }
        );
      }
    }

    // Both checks passed — click the button
    logger.info(`Clicking draft button: "${buttonText.trim()}"`);
    await page.click(SELECTORS.spielerpassForm.saveDraftButton);

    // Wait for success confirmation
    await page.waitForSelector(SELECTORS.spielerpassForm.successMessage, {
      timeout: TIMEOUTS.formSave,
    });

    // Extract draft URL
    let draftUrl: string | null = null;
    try {
      const urlElement = await page.$(SELECTORS.spielerpassForm.draftUrlElement);
      if (urlElement) {
        draftUrl = await urlElement.getAttribute('href');
        if (!draftUrl) {
          draftUrl = await urlElement.textContent();
        }
      }
    } catch {
      logger.warn('Could not extract draft URL from success message');
    }

    await page.screenshot({ path: screenshotPath, fullPage: true });
    logger.info(`Draft saved successfully${draftUrl ? `: ${draftUrl}` : ''}`);

    return {
      success: true,
      draftUrl,
      screenshotPath,
    };
  } catch (error) {
    if (error instanceof BotError) throw error;

    try {
      await page.screenshot({ path: screenshotPath, fullPage: true });
    } catch { /* ignore */ }

    throw categorizePlaywrightError(error);
  }
}

// ===== Helpers =====

/**
 * Convert ISO date (YYYY-MM-DD) to German format (DD.MM.YYYY)
 */
function formatDateDE(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}.${month}.${year}`;
}
