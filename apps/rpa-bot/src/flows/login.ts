/**
 * DFBnet Verein Login Flow
 *
 * Handles: Navigation → 3-Field Credentials → Error Detection → Verification
 * Portal: verein.dfbnet.org (PHP login, not SpielPLUS/Keycloak)
 */

import type { Page } from 'playwright';
import { SELECTORS, TIMEOUTS } from '../config/selectors.js';
import { BotError, ErrorCategory, categorizePlaywrightError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export type LoginConfig = {
  baseUrl: string;
  username: string;
  password: string;
  kundennummer: string;
  screenshotDir: string;
  registrationId: string;
  headless: boolean;
};

export type LoginResult = {
  success: boolean;
  screenshotPath: string;
  twoFactorUsed: boolean;
  error?: string;
};

/**
 * Login to DFBnet Verein.
 *
 * Flow:
 * 1. Navigate to verein.dfbnet.org/login/
 * 2. Enter 3-field credentials (username, password, Kundennummer)
 * 3. Submit via JavaScript link
 * 4. Wait for title change (success) or error message
 * 5. Take screenshot for audit trail
 *
 * Note: DFBnet Verein uses a 3-field PHP login (not SpielPLUS/Keycloak).
 * No 2FA, no cookie banner, no iframes.
 */
export async function loginToDFBnet(
  page: Page,
  config: LoginConfig
): Promise<LoginResult> {
  const { baseUrl, username, password, kundennummer, screenshotDir, registrationId } = config;
  const loginUrl = `${baseUrl}/login/`;
  const screenshotPath = `${screenshotDir}/${registrationId}_login.png`;

  try {
    // 1. Navigate to login page
    logger.info(`Navigating to ${loginUrl}...`);
    await page.goto(loginUrl, {
      waitUntil: 'networkidle',
      timeout: TIMEOUTS.navigation,
    });

    // 2. Fill 3-field login form
    logger.info('Entering credentials...');
    await page.waitForSelector(SELECTORS.login.usernameInput, {
      state: 'visible',
      timeout: TIMEOUTS.elementVisible,
    });
    await page.fill(SELECTORS.login.usernameInput, username);
    await page.fill(SELECTORS.login.passwordInput, password);
    await page.fill(SELECTORS.login.kundennummerInput, kundennummer);

    // 3. Submit (JavaScript link, not form submit)
    await page.click(SELECTORS.login.submitButton);

    // 4. Wait for page to settle after login
    await page.waitForTimeout(TIMEOUTS.loginSettle);
    await page.waitForLoadState('networkidle').catch((err) => {
      logger.debug(`networkidle timeout after login (expected): ${err.message}`);
    });

    // 5. Check for errors
    const bodyText = await page.textContent('body').catch(() => '') ?? '';
    if (bodyText.includes('Benutzer oder Passwort falsch') || bodyText.includes('ungültig')) {
      await page.screenshot({ path: screenshotPath, fullPage: true });
      throw new BotError(
        'Login failed: wrong credentials',
        ErrorCategory.CREDENTIALS,
        { screenshotPath }
      );
    }
    if (bodyText.includes('Für diesen Verein wurden noch keine Benutzer angelegt')) {
      await page.screenshot({ path: screenshotPath, fullPage: true });
      throw new BotError(
        'Login failed: no users configured for this club (check Kundennummer)',
        ErrorCategory.CREDENTIALS,
        { screenshotPath }
      );
    }

    // 6. Verify success by checking page title
    const title = await page.title();
    if (!title.includes('CfB') && !title.includes('Ford') && !title.includes('Niehl')) {
      logger.warn(`Unexpected page title after login: "${title}"`);
    }

    // 7. Take success screenshot
    await page.screenshot({ path: screenshotPath, fullPage: true });
    logger.info(`Login successful — title: "${title}"`);

    return {
      success: true,
      screenshotPath,
      twoFactorUsed: false,
    };
  } catch (error) {
    if (error instanceof BotError) throw error;

    // Take error screenshot
    try {
      await page.screenshot({ path: screenshotPath, fullPage: true });
    } catch {
      // Screenshot may fail if browser is in bad state
    }

    throw categorizePlaywrightError(error);
  }
}
