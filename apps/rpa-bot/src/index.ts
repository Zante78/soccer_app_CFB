import { config } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { DFBnetBot } from "./bot/dfbnet-bot.js";
import { SupabaseClient } from "./services/supabase-client.js";

/**
 * RPA Bot Entry Point
 *
 * Usage:
 *   npm run dev              # Watch mode
 *   npm start                # Production mode
 *   BOT_HEADLESS=false npm run dev  # Debug mode (headed)
 */
async function main() {
  logger.info("🤖 CFB RPA Bot Starting...");
  logger.info(`Environment: ${config.NODE_ENV}`);
  logger.info(`Headless Mode: ${config.BOT_HEADLESS}`);

  try {
    // Initialize Supabase Client
    const supabase = new SupabaseClient(
      config.SUPABASE_URL,
      config.SUPABASE_SERVICE_ROLE_KEY
    );

    // Initialize Bot
    const bot = new DFBnetBot({
      headless: config.BOT_HEADLESS,
      timeout: config.BOT_TIMEOUT_MS,
      screenshotDir: config.BOT_SCREENSHOT_DIR,
      baselineDir: config.BOT_BASELINE_DIR,
    });

    // Fetch pending registrations (status: READY_FOR_BOT)
    const pendingRegistrations = await supabase.getPendingRegistrations();

    if (pendingRegistrations.length === 0) {
      logger.info("✅ No pending registrations. Bot idle.");
      return;
    }

    logger.info(
      `📋 Found ${pendingRegistrations.length} pending registration(s)`
    );

    // Process each registration
    for (const registration of pendingRegistrations) {
      logger.info(`🔄 Processing: ${registration.player_name}`);

      try {
        await bot.processRegistration(registration);
        logger.info(`✅ Success: ${registration.player_name}`);
      } catch (error) {
        logger.error(
          `❌ Failed: ${registration.player_name}`,
          error
        );
      }
    }

    logger.info("🎉 Bot completed all tasks");
  } catch (error) {
    logger.error("💥 Bot crashed:", error);
    process.exit(1);
  }
}

// Run bot
main().catch((error) => {
  logger.error("Unhandled error:", error);
  process.exit(1);
});
