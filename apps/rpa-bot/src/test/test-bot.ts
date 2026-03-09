import { logger } from "../utils/logger.js";
import { DFBnetBot } from "../bot/dfbnet-bot.js";

/**
 * Test Script: Bot Health Check
 *
 * Tests if bot can launch browser, navigate to DFBnet, and attempt login.
 * Run with: npx tsx src/test/test-bot.ts
 */
async function testBot() {
  logger.info("Testing Bot Health Check...");

  try {
    const bot = new DFBnetBot({
      headless: false, // Force headed mode for testing
      timeout: 30000,
      screenshotDir: "./screenshots",
      baselineDir: "./baselines",
      maxRetries: 0, // No retries for testing
    });

    logger.info("1. Running health check (headed mode)...");
    const result = await bot.healthCheck();

    logger.info(`2. Result: success=${result.success}, duration=${result.duration_ms}ms`);
    if (result.error) {
      logger.warn(`   Error: ${result.error}`);
    }
    if (result.dfbnet_version) {
      logger.info(`   DFBnet Version: ${result.dfbnet_version}`);
    }

    logger.info("Test completed!");
  } catch (error) {
    logger.error("Test failed:", error);
    process.exit(1);
  }
}

testBot();
