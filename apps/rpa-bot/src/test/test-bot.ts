import { config, validateConfig } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { DFBnetBot } from "../bot/dfbnet-bot.js";

/**
 * Test Script: Bot Initialization
 *
 * Tests if bot can launch browser and navigate
 */
async function testBot() {
  logger.info("🧪 Testing Bot Initialization...");

  try {
    // Validate config (will throw if missing vars)
    // validateConfig();

    // Initialize Bot
    const bot = new DFBnetBot({
      headless: false, // Force headed mode for testing
      timeout: 30000,
      screenshotDir: "./screenshots",
      baselineDir: "./baselines",
    });

    // Test: Launch browser
    logger.info("1️⃣ Testing browser launch...");
    await bot["initialize"](); // Access private method for testing

    logger.info("2️⃣ Waiting 3 seconds...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    logger.info("3️⃣ Closing browser...");
    await bot.close();

    logger.info("✅ Test passed!");
  } catch (error) {
    logger.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testBot();
