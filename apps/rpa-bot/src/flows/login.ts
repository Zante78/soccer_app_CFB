/**
 * DFBnet Login Flow
 *
 * Handles: Navigation → Cookie Banner → Credentials → 2FA (optional) → Verification
 */

import type { Page, Frame } from 'playwright';
import { SELECTORS, TIMEOUTS } from '../config/selectors.js';
import { BotError, ErrorCategory, categorizePlaywrightError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export type LoginConfig = {
  baseUrl: string;
  username: string;
  password: string;
  screenshotDir: string;
  registrationId: string;
  headless: boolean;
  imapConfig?: IMAPConfig;
};

export type IMAPConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  otpSender: string;
};

export type LoginResult = {
  success: boolean;
  screenshotPath: string;
  twoFactorUsed: boolean;
  error?: string;
};

/**
 * Login to DFBnet.
 *
 * Flow:
 * 1. Navigate to login page
 * 2. Dismiss cookie banner (if present)
 * 3. Find login form (may be in iframe)
 * 4. Enter credentials and submit
 * 5. Handle outcome: success / 2FA / error
 * 6. Take screenshot for audit trail
 */
export async function loginToDFBnet(
  page: Page,
  config: LoginConfig
): Promise<LoginResult> {
  const { baseUrl, username, password, screenshotDir, registrationId } = config;
  const screenshotPath = `${screenshotDir}/${registrationId}_login.png`;

  try {
    // 1. Navigate to login page
    logger.info(`Navigating to ${baseUrl}...`);
    await page.goto(baseUrl, {
      waitUntil: 'domcontentloaded',
      timeout: TIMEOUTS.navigation,
    });

    // 2. Dismiss cookie banner
    await dismissCookieBanner(page);

    // 3. Find login form (may be in iframe)
    const loginContext = await findLoginContext(page);

    // 4. Fill credentials
    logger.info('Entering credentials...');
    await loginContext.waitForSelector(SELECTORS.login.usernameInput, {
      state: 'visible',
      timeout: TIMEOUTS.elementVisible,
    });
    await loginContext.fill(SELECTORS.login.usernameInput, username);
    await loginContext.fill(SELECTORS.login.passwordInput, password);

    // 5. Submit login
    await loginContext.click(SELECTORS.login.submitButton);

    // 6. Race: dashboard (success) vs 2FA vs error
    const outcome = await raceLoginOutcome(loginContext);

    if (outcome === 'error') {
      const errorText = await safeTextContent(loginContext, SELECTORS.login.errorMessage);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      throw new BotError(
        `Login failed: ${errorText || 'Unknown error'}`,
        ErrorCategory.CREDENTIALS,
        { screenshotPath }
      );
    }

    let twoFactorUsed = false;

    if (outcome === '2fa') {
      logger.info('2FA detected — handling OTP...');
      twoFactorUsed = true;
      await handle2FA(loginContext, config);

      // After 2FA, wait for dashboard
      await loginContext.waitForSelector(SELECTORS.dashboard.welcomeElement, {
        timeout: TIMEOUTS.loginRace,
      });
    }

    // 7. Take success screenshot
    await page.screenshot({ path: screenshotPath, fullPage: true });
    logger.info('Login successful');

    return {
      success: true,
      screenshotPath,
      twoFactorUsed,
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

/**
 * Dismiss cookie consent banner if present (non-blocking).
 */
async function dismissCookieBanner(page: Page): Promise<void> {
  try {
    const banner = await page.$(SELECTORS.common.cookieBanner);
    if (banner) {
      await page.click(SELECTORS.common.cookieAccept, { timeout: 3000 });
      logger.info('Cookie banner dismissed');
    }
  } catch {
    // Cookie banner not found or already dismissed — continue
  }
}

/**
 * Find the login form context. If the form is inside an iframe,
 * return the frame; otherwise return the page.
 */
async function findLoginContext(page: Page): Promise<Page | Frame> {
  // First check main page
  const mainInput = await page.$(SELECTORS.login.usernameInput);
  if (mainInput) return page;

  // Check iframes
  for (const frame of page.frames()) {
    if (frame === page.mainFrame()) continue;
    const frameInput = await frame.$(SELECTORS.login.usernameInput);
    if (frameInput) {
      logger.info('Login form found in iframe');
      return frame;
    }
  }

  // Fallback: return main page and let the caller handle the timeout
  return page;
}

/**
 * Race between three possible outcomes after clicking login.
 */
async function raceLoginOutcome(
  context: Page | Frame
): Promise<'success' | '2fa' | 'error'> {
  const result = await Promise.race([
    context
      .waitForSelector(SELECTORS.dashboard.welcomeElement, { timeout: TIMEOUTS.loginRace })
      .then(() => 'success' as const),
    context
      .waitForSelector(SELECTORS.login.twoFactorInput, { timeout: TIMEOUTS.loginRace })
      .then(() => '2fa' as const),
    context
      .waitForSelector(SELECTORS.login.errorMessage, { timeout: TIMEOUTS.loginRace })
      .then(() => 'error' as const),
  ]);

  return result;
}

/**
 * Handle 2FA: Try IMAP OTP retrieval, fall back to manual entry in headed mode.
 */
async function handle2FA(
  context: Page | Frame,
  config: LoginConfig
): Promise<void> {
  const { imapConfig, headless } = config;

  if (imapConfig && imapConfig.host) {
    // Attempt automatic OTP retrieval via IMAP
    const otp = await fetchOTPFromEmail(imapConfig);
    if (otp) {
      logger.info(`OTP retrieved: ${otp.replace(/./g, '*')}`);
      await context.fill(SELECTORS.login.twoFactorInput, otp);
      await context.click(SELECTORS.login.twoFactorSubmit);
      return;
    }
    logger.warn('IMAP OTP retrieval failed — falling back');
  }

  if (!headless) {
    // Headed mode: pause for manual entry
    logger.info('2FA required — pausing for manual OTP entry. Enter the code in the browser and press Resume in Playwright Inspector.');
    // page.pause() only works on Page, not Frame
    if ('pause' in context && typeof context.pause === 'function') {
      await (context as Page).pause();
    }
    return;
  }

  // Headless mode without IMAP: can't proceed
  throw new BotError(
    '2FA required but IMAP not configured. Set IMAP_HOST, IMAP_USERNAME, IMAP_PASSWORD in .env, or run in headed mode (BOT_HEADLESS=false) for manual entry.',
    ErrorCategory.TWO_FACTOR
  );
}

/**
 * Fetch OTP code from email via IMAP.
 *
 * Note: imapflow is dynamically imported to avoid requiring it when 2FA is not used.
 * Install with: npm install imapflow
 */
async function fetchOTPFromEmail(imapConfig: IMAPConfig): Promise<string | null> {
  try {
    // Dynamic import — only loaded when actually needed
    const { ImapFlow } = await import('imapflow');

    const client = new ImapFlow({
      host: imapConfig.host,
      port: imapConfig.port,
      secure: true,
      auth: {
        user: imapConfig.username,
        pass: imapConfig.password,
      },
      logger: false,
    });

    await client.connect();

    const lock = await client.getMailboxLock('INBOX');
    try {
      // Search for recent emails from OTP sender (last 5 minutes)
      const since = new Date(Date.now() - 5 * 60 * 1000);
      const messages = await client.search({
        from: imapConfig.otpSender,
        since,
      });

      if (messages.length === 0) {
        logger.warn('No OTP email found');
        return null;
      }

      // Get the most recent message
      const latestUid = messages[messages.length - 1];
      const msg = await client.fetchOne(latestUid, { source: true });
      const body = msg.source.toString();

      // Extract 4-8 digit code from email body
      const otpMatch = body.match(/\b(\d{4,8})\b/);
      return otpMatch ? otpMatch[1] : null;
    } finally {
      lock.release();
    }

    await client.logout();
  } catch (error) {
    logger.error('IMAP OTP retrieval error:', error);
    return null;
  }
}

/**
 * Safely get text content of an element (returns empty string on failure).
 */
async function safeTextContent(
  context: Page | Frame,
  selector: string
): Promise<string> {
  try {
    const el = await context.$(selector);
    return el ? (await el.textContent()) ?? '' : '';
  } catch {
    return '';
  }
}
