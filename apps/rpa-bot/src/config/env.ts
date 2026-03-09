import dotenv from "dotenv";
import { resolve } from "path";

// Load .env file
dotenv.config({ path: resolve(process.cwd(), ".env") });

/**
 * Centralized Configuration
 */
export const config = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || "development",

  // Server
  SERVER_PORT: parseInt(process.env.SERVER_PORT || "3001", 10),
  BOT_API_KEY: process.env.BOT_API_KEY || "dev-secret-key",
  BOT_MODE: (process.env.BOT_MODE || "mock") as "mock" | "live",

  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",

  // DFBnet
  DFBNET_USERNAME: process.env.DFBNET_USERNAME || "",
  DFBNET_PASSWORD: process.env.DFBNET_PASSWORD || "",
  DFBNET_BASE_URL:
    process.env.DFBNET_BASE_URL || "https://www.dfbnet.org",

  // IMAP for 2FA OTP retrieval (optional — only needed if DFBnet uses 2FA)
  IMAP_HOST: process.env.IMAP_HOST || "",
  IMAP_PORT: parseInt(process.env.IMAP_PORT || "993", 10),
  IMAP_USERNAME: process.env.IMAP_USERNAME || "",
  IMAP_PASSWORD: process.env.IMAP_PASSWORD || "",
  IMAP_OTP_SENDER: process.env.IMAP_OTP_SENDER || "noreply@dfbnet.org",

  // Bot
  BOT_HEADLESS: process.env.BOT_HEADLESS !== "false", // Default: true
  BOT_SCREENSHOT_DIR: process.env.BOT_SCREENSHOT_DIR || "./screenshots",
  BOT_BASELINE_DIR: process.env.BOT_BASELINE_DIR || "./baselines",
  BOT_MAX_RETRIES: parseInt(process.env.BOT_MAX_RETRIES || "3", 10),
  BOT_TIMEOUT_MS: parseInt(process.env.BOT_TIMEOUT_MS || "30000", 10),

  // Mock Bot
  MOCK_SUCCESS_RATE: parseFloat(process.env.MOCK_SUCCESS_RATE || "0.85"),
  MOCK_DELAY_MS: parseInt(process.env.MOCK_DELAY_MS || "3000", 10),

  // Visual Regression
  VISUAL_DIFF_THRESHOLD: parseFloat(
    process.env.VISUAL_DIFF_THRESHOLD || "0.002"
  ), // 0.2%

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  LOG_FILE: process.env.LOG_FILE || "./logs/bot.log",
} as const;

/**
 * Validate required config for live mode
 */
export function validateConfig() {
  if (config.BOT_MODE === "mock") {
    // Mock mode only needs Supabase (optional)
    return;
  }

  const required = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "DFBNET_USERNAME",
    "DFBNET_PASSWORD",
  ] as const;

  const missing = required.filter((key) => !config[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}
