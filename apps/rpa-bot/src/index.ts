import { config, validateConfig } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { DFBnetBot } from "./bot/dfbnet-bot.js";
import { SupabaseClient } from "./services/supabase-client.js";
import { withRetry } from "./utils/retry.js";
import { randomUUID } from "crypto";

/**
 * RPA Bot CLI Entry Point
 *
 * Fetches READY_FOR_BOT registrations from Supabase, processes each with retry.
 * In CLI mode, the bot manages its own status updates and RPA traces
 * (unlike server mode where n8n handles that).
 *
 * Usage:
 *   npm run dev              # Watch mode
 *   npm start                # Production mode
 *   BOT_HEADLESS=false npm run dev  # Debug mode (headed)
 */
async function main() {
  logger.info("=".repeat(50));
  logger.info("CFB RPA Bot v2.0.0 (CLI Mode)");
  logger.info(`Environment: ${config.NODE_ENV}`);
  logger.info(`Headless: ${config.BOT_HEADLESS}`);
  logger.info(`Max Retries: ${config.BOT_MAX_RETRIES}`);
  logger.info("=".repeat(50));

  // Validate config for live mode
  validateConfig();

  // Initialize clients
  const supabase = new SupabaseClient(
    config.SUPABASE_URL,
    config.SUPABASE_SERVICE_ROLE_KEY
  );

  const bot = new DFBnetBot(
    {
      headless: config.BOT_HEADLESS,
      timeout: config.BOT_TIMEOUT_MS,
      screenshotDir: config.BOT_SCREENSHOT_DIR,
      baselineDir: config.BOT_BASELINE_DIR,
      maxRetries: config.BOT_MAX_RETRIES,
    },
    supabase
  );

  // Graceful shutdown
  let shutdownRequested = false;
  process.on("SIGINT", () => {
    if (shutdownRequested) {
      logger.warn("Force shutdown");
      process.exit(1);
    }
    shutdownRequested = true;
    logger.info("Shutdown requested — finishing current registration...");
  });

  // Fetch pending registrations
  const pendingRegistrations = await supabase.getPendingRegistrations();

  if (pendingRegistrations.length === 0) {
    logger.info("No pending registrations. Bot idle.");
    return;
  }

  logger.info(`Found ${pendingRegistrations.length} pending registration(s)`);

  // Process each registration sequentially
  let successCount = 0;
  let errorCount = 0;

  for (const registration of pendingRegistrations) {
    if (shutdownRequested) {
      logger.info("Shutdown — skipping remaining registrations");
      break;
    }

    const executionId = randomUUID();
    logger.info(`Processing: ${registration.player_name} (${registration.id})`);

    // Set status to BOT_IN_PROGRESS
    try {
      await supabase.updateRegistrationStatus(registration.id, "BOT_IN_PROGRESS");
    } catch (err) {
      logger.error(`Failed to set BOT_IN_PROGRESS: ${err}`);
    }

    // Create RPA trace
    try {
      await supabase.createRPATrace({
        registration_id: registration.id,
        execution_id: executionId,
        status: "RUNNING",
        started_at: new Date().toISOString(),
      });
    } catch (err) {
      logger.error(`Failed to create RPA trace: ${err}`);
    }

    // Execute with retry
    try {
      const result = await withRetry(
        async () => {
          return bot.execute({
            registration_id: registration.id,
            trace_id: executionId,
            player_name: registration.player_name,
            team_name: registration.team.name,
          });
        },
        {
          maxRetries: config.BOT_MAX_RETRIES,
          baseDelayMs: 5000,
        }
      );

      // Update final status based on result
      if (result.success) {
        await supabase.updateRegistrationStatus(registration.id, "COMPLETED");
        successCount++;
        logger.info(`Success: ${registration.player_name}`);
      } else if (result.visual_regression_error) {
        await supabase.updateRegistrationStatus(registration.id, "VISUAL_REGRESSION_ERROR");
        errorCount++;
        logger.warn(`Visual regression: ${registration.player_name}`);
      } else {
        await supabase.updateRegistrationStatus(registration.id, "ERROR");
        errorCount++;
        logger.error(`Failed: ${registration.player_name} — ${result.error}`);
      }
    } catch (error) {
      await supabase.updateRegistrationStatus(registration.id, "ERROR");
      errorCount++;
      logger.error(
        `Failed: ${registration.player_name}`,
        error
      );
    }
  }

  logger.info("=".repeat(50));
  logger.info(`Bot completed: ${successCount} success, ${errorCount} errors`);
  logger.info("=".repeat(50));
}

// Run bot
main().catch((error) => {
  logger.error("Unhandled error:", error);
  process.exit(1);
});
