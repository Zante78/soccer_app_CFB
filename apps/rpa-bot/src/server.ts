import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { MockBot } from "./bot/mock-bot.js";

const app = express();
const mockBot = new MockBot();

// ===== Middleware =====
app.use(helmet());
app.use(cors());
app.use(express.json());

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
  if (token !== config.BOT_API_KEY) {
    res.status(403).json({ error: "Invalid API key" });
    return;
  }

  next();
}

// ===== Routes =====

/**
 * GET / - Server Status
 */
app.get("/", (_req, res) => {
  res.json({
    service: "CFB Bot Runner",
    version: "1.1.0",
    mode: config.BOT_MODE,
    status: "running",
    uptime: process.uptime(),
  });
});

/**
 * POST /execute - Fuehrt Bot fuer eine Registration aus
 *
 * Body: { registration_id, trace_id, player_name?, team_name? }
 * Response: { success, draft_url?, error?, duration_ms, ... }
 */
app.post("/execute", requireAuth, async (req, res) => {
  const { registration_id, trace_id, player_name, team_name } = req.body;

  if (!registration_id) {
    res.status(400).json({ error: "Missing registration_id" });
    return;
  }

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

    // Live mode: use DFBnetBot (TODO: implement when DFBnet credentials available)
    res.status(501).json({
      error: "Live mode not yet implemented. Use BOT_MODE=mock.",
    });
  } catch (error: any) {
    logger.error(`[API] /execute error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
      duration_ms: 0,
    });
  }
});

/**
 * POST /health-check - Testet DFBnet-Verbindung
 *
 * Body: { check_id?, mode? }
 * Response: { success, duration_ms, dfbnet_version }
 */
app.post("/health-check", requireAuth, async (req, res) => {
  const { check_id, mode } = req.body;

  logger.info(
    `[API] /health-check received: check_id=${check_id || "none"}, mode=${config.BOT_MODE}`
  );

  try {
    if (config.BOT_MODE === "mock") {
      const result = await mockBot.healthCheck();
      res.json({ ...result, check_id });
      return;
    }

    // Live mode: actual DFBnet login test
    res.status(501).json({
      error: "Live mode not yet implemented. Use BOT_MODE=mock.",
    });
  } catch (error: any) {
    logger.error(`[API] /health-check error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
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
    version: "1.1.0",
    mode: config.BOT_MODE,
    status: "running",
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
  logger.info(`CFB Bot Runner v1.1.0`);
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
});

export default app;
