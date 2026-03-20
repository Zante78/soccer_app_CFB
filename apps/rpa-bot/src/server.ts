import express from "express";
import cors from "cors";
import helmet from "helmet";
import crypto from "crypto";
import { z } from "zod";
import { config, validateConfig } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { MockBot } from "./bot/mock-bot.js";
import { DFBnetBot } from "./bot/dfbnet-bot.js";
import { SupabaseClient } from "./services/supabase-client.js";

const app = express();
const mockBot = new MockBot();

// ===== Startup Validation (all modes) =====
validateConfig();

// ===== Live Mode Setup =====
let dfbnetBot: DFBnetBot | null = null;
let processingRegistrationId: string | null = null;

if (config.BOT_MODE === "live") {
  try {
    const supabase = new SupabaseClient(
      config.SUPABASE_URL,
      config.SUPABASE_SERVICE_ROLE_KEY
    );
    dfbnetBot = new DFBnetBot(
      {
        headless: config.BOT_HEADLESS,
        timeout: config.BOT_TIMEOUT_MS,
        screenshotDir: config.BOT_SCREENSHOT_DIR,
        baselineDir: config.BOT_BASELINE_DIR,
        maxRetries: config.BOT_MAX_RETRIES,
      },
      supabase
    );
    logger.info("Live mode initialized — DFBnetBot ready");
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to initialize live mode: ${msg}`);
    process.exit(1);
  }
}

// ===== Middleware =====
app.use(helmet());

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").filter(Boolean);
if (config.NODE_ENV === "production" && (!allowedOrigins || allowedOrigins.length === 0)) {
  logger.error("ALLOWED_ORIGINS must be set in production");
  process.exit(1);
}
app.use(cors({
  origin: allowedOrigins || ["http://localhost:3000"],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "10kb" }));

// ===== Auth Middleware =====
function requireAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing Authorization header" });
    return;
  }

  const token = authHeader.slice(7);
  const expected = config.BOT_API_KEY;

  // Constant-time comparison to prevent timing attacks
  const tokenBuf = Buffer.from(token);
  const expectedBuf = Buffer.from(expected);

  if (tokenBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(tokenBuf, expectedBuf)) {
    logger.warn(`Invalid API key attempt from ${req.ip}`);
    res.status(403).json({ error: "Invalid API key" });
    return;
  }

  next();
}

// ===== Routes =====

/**
 * GET / - Server Status (minimal, unauthenticated)
 */
app.get("/", (_req, res) => {
  res.json({
    service: "CFB Bot Runner",
    status: "running",
  });
});

/**
 * POST /execute - Fuehrt Bot fuer eine Registration aus
 *
 * Body: { registration_id, trace_id, player_name?, team_name? }
 * Response: { success, draft_url?, error?, duration_ms, ... }
 */
const executeSchema = z.object({
  registration_id: z.string().uuid(),
  trace_id: z.string().uuid(),
  player_name: z.string().max(200).optional(),
  team_name: z.string().max(200).optional(),
});

app.post("/execute", requireAuth, async (req, res) => {
  const parsed = executeSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten().fieldErrors });
    return;
  }

  const { registration_id, trace_id, player_name, team_name } = parsed.data;

  logger.info(
    `[API] /execute received: registration=${registration_id}, player=${player_name || "unknown"}, mode=${config.BOT_MODE}`
  );

  try {
    if (config.BOT_MODE === "mock") {
      const result = await mockBot.execute({
        registration_id,
        trace_id,
        player_name,
        team_name,
      });
      res.json(result);
      return;
    }

    // Live mode
    if (!dfbnetBot) {
      res.status(503).json({ error: "Live mode bot not initialized" });
      return;
    }

    if (processingRegistrationId) {
      res.status(429).json({
        error: `Bot is busy processing registration ${processingRegistrationId}`,
        retry_after_seconds: 60,
      });
      return;
    }

    processingRegistrationId = registration_id;
    try {
      const result = await dfbnetBot.execute({
        registration_id,
        trace_id,
        player_name,
        team_name,
      });
      res.json(result);
    } finally {
      processingRegistrationId = null;
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error(`[API] /execute error: ${msg}`);
    res.status(500).json({
      success: false,
      error: "Internal bot execution error",
      duration_ms: 0,
    });
  }
});

/**
 * POST /health-check - Testet DFBnet-Verbindung
 *
 * Body: { check_id? }
 * Response: { success, duration_ms, dfbnet_version }
 */
const healthCheckSchema = z.object({
  check_id: z.string().uuid().optional(),
});

app.post("/health-check", requireAuth, async (req, res) => {
  const parsed = healthCheckSchema.safeParse(req.body);
  const check_id = parsed.success ? parsed.data.check_id : undefined;

  logger.info(
    `[API] /health-check received: check_id=${check_id || "none"}, mode=${config.BOT_MODE}`
  );

  try {
    if (config.BOT_MODE === "mock") {
      const result = await mockBot.healthCheck();
      res.json({ ...result, check_id });
      return;
    }

    // Live mode
    if (!dfbnetBot) {
      res.status(503).json({ error: "Live mode bot not initialized" });
      return;
    }

    const result = await dfbnetBot.healthCheck();
    res.json({ ...result, check_id });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error(`[API] /health-check error: ${msg}`);
    res.status(500).json({
      success: false,
      error: "Internal health check error",
      duration_ms: 0,
    });
  }
});

/**
 * GET /status - Detaillierter Status (fuer Dashboard)
 */
app.get("/status", requireAuth, (_req, res) => {
  res.json({
    service: "CFB Bot Runner",
    version: "2.0.0",
    mode: config.BOT_MODE,
    status: "running",
    is_processing: processingRegistrationId !== null,
    processing_registration_id: processingRegistrationId,
    config: {
      success_rate: config.BOT_MODE === "mock" ? config.MOCK_SUCCESS_RATE : "N/A",
      delay_ms: config.BOT_MODE === "mock" ? config.MOCK_DELAY_MS : "N/A",
      headless: config.BOT_HEADLESS,
      max_retries: config.BOT_MAX_RETRIES,
      timeout_ms: config.BOT_TIMEOUT_MS,
      visual_diff_threshold: config.VISUAL_DIFF_THRESHOLD,
    },
    uptime_seconds: Math.round(process.uptime()),
    memory: process.memoryUsage(),
  });
});

// ===== Start Server =====
app.listen(config.SERVER_PORT, () => {
  logger.info("=".repeat(50));
  logger.info(`CFB Bot Runner v2.0.0`);
  logger.info(`Mode: ${config.BOT_MODE.toUpperCase()}`);
  logger.info(`Port: ${config.SERVER_PORT}`);
  logger.info(`Auth: Bearer token required`);
  logger.info("=".repeat(50));
  logger.info("");
  logger.info("Endpoints:");
  logger.info(`  GET  http://localhost:${config.SERVER_PORT}/`);
  logger.info(`  POST http://localhost:${config.SERVER_PORT}/execute`);
  logger.info(`  POST http://localhost:${config.SERVER_PORT}/health-check`);
  logger.info(`  GET  http://localhost:${config.SERVER_PORT}/status`);
  logger.info("");

  if (config.BOT_MODE === "mock") {
    logger.info(`Mock Config:`);
    logger.info(`  Success Rate: ${(config.MOCK_SUCCESS_RATE * 100).toFixed(0)}%`);
    logger.info(`  Base Delay: ${config.MOCK_DELAY_MS}ms`);
    logger.info("");
  }

  if (config.BOT_MODE === "live") {
    logger.info(`Live Config:`);
    logger.info(`  DFBnet URL: ${config.DFBNET_BASE_URL}`);
    logger.info(`  Headless: ${config.BOT_HEADLESS}`);
    logger.info(`  Max Retries: ${config.BOT_MAX_RETRIES}`);
    logger.info(`  Timeout: ${config.BOT_TIMEOUT_MS}ms`);
    logger.info(`  Visual Diff Threshold: ${(config.VISUAL_DIFF_THRESHOLD * 100).toFixed(1)}%`);
    logger.info("");
  }
});

export default app;
