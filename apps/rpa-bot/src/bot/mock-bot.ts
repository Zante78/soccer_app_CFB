import { randomUUID } from "crypto";
import { config } from "../config/env.js";
import { logger } from "../utils/logger.js";

type ExecuteRequest = {
  registration_id: string;
  trace_id: string;
  player_name?: string;
  team_name?: string;
};

type ExecuteResult = {
  success: boolean;
  visual_regression_error?: boolean;
  draft_url?: string | null;
  screenshot_actual?: string | null;
  screenshot_baseline?: string | null;
  visual_diff_score?: number | null;
  duration_ms: number;
  error?: string;
  dfbnet_version?: string;
  mock: true;
};

type HealthCheckResult = {
  success: boolean;
  duration_ms: number;
  dfbnet_version: string;
  mock: true;
  error?: string;
};

/**
 * Mock Bot - Simuliert DFBnet Bot-Ausfuehrung
 *
 * Ergebnis-Verteilung (konfigurierbar via MOCK_SUCCESS_RATE):
 * - 85% SUCCESS: Draft erstellt, Screenshot OK
 * - 10% ERROR: Simulierter Fehler (Login, Timeout, etc.)
 * -  5% VISUAL_REGRESSION_ERROR: UI-Aenderung erkannt
 */
export class MockBot {
  private successRate: number;
  private delayMs: number;

  constructor() {
    this.successRate = config.MOCK_SUCCESS_RATE;
    this.delayMs = config.MOCK_DELAY_MS;
  }

  /**
   * Simuliert eine Bot-Ausfuehrung
   */
  async execute(request: ExecuteRequest): Promise<ExecuteResult> {
    const startTime = Date.now();
    const { registration_id, trace_id, player_name } = request;

    logger.info(
      `[MOCK] Executing for registration ${registration_id} (${player_name || "unknown"})`
    );

    // Simuliere Verarbeitungszeit (2-8 Sekunden)
    const delay = this.delayMs + Math.random() * 5000;
    await this.sleep(delay);

    // Zufaelliges Ergebnis basierend auf Success Rate
    const roll = Math.random();
    const durationMs = Date.now() - startTime;

    // SUCCESS (85%)
    if (roll < this.successRate) {
      const draftId = randomUUID().slice(0, 8);
      logger.info(
        `[MOCK] SUCCESS: Draft created for ${registration_id} (${durationMs}ms)`
      );

      return {
        success: true,
        draft_url: `https://www.dfbnet.org/draft/${draftId}`,
        screenshot_actual: `rpa-screenshots/${registration_id}/actual.png`,
        screenshot_baseline: `rpa-baselines/spielerpass-form.png`,
        visual_diff_score: Math.random() * 0.001, // 0-0.1% (under threshold)
        duration_ms: durationMs,
        dfbnet_version: "DFBnet 4.2.1 (Mock)",
        mock: true,
      };
    }

    // VISUAL REGRESSION ERROR (5%)
    if (roll < this.successRate + 0.05) {
      const diffScore = 0.003 + Math.random() * 0.05; // 0.3-5.3% (over threshold)
      logger.warn(
        `[MOCK] VISUAL_REGRESSION: diff=${(diffScore * 100).toFixed(2)}% for ${registration_id}`
      );

      return {
        success: true,
        visual_regression_error: true,
        screenshot_actual: `rpa-screenshots/${registration_id}/actual.png`,
        screenshot_baseline: `rpa-baselines/spielerpass-form.png`,
        visual_diff_score: diffScore,
        duration_ms: durationMs,
        dfbnet_version: "DFBnet 4.2.1 (Mock)",
        mock: true,
      };
    }

    // ERROR (10%)
    const errorScenarios = [
      "DFBnet login failed: Invalid credentials",
      "Navigation timeout: Spielerpass form not found",
      "Form submission error: Required field 'Geburtsdatum' missing",
      "Browser crashed: Chromium process exited unexpectedly",
      "DFBnet maintenance: System temporarily unavailable",
    ];
    const errorMsg =
      errorScenarios[Math.floor(Math.random() * errorScenarios.length)];

    logger.error(`[MOCK] ERROR: ${errorMsg} for ${registration_id}`);

    return {
      success: false,
      error: errorMsg,
      duration_ms: durationMs,
      mock: true,
    };
  }

  /**
   * Simuliert einen Health Check (DFBnet Login Test)
   */
  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    logger.info("[MOCK] Running health check...");

    // Simuliere Login-Versuch (1-3 Sekunden)
    await this.sleep(1000 + Math.random() * 2000);

    const durationMs = Date.now() - startTime;

    // 95% der Health Checks sind erfolgreich
    if (Math.random() < 0.95) {
      logger.info(`[MOCK] Health check passed (${durationMs}ms)`);
      return {
        success: true,
        duration_ms: durationMs,
        dfbnet_version: "DFBnet 4.2.1 (Mock)",
        mock: true,
      };
    }

    logger.warn(`[MOCK] Health check failed (${durationMs}ms)`);
    return {
      success: false,
      duration_ms: durationMs,
      dfbnet_version: "DFBnet 4.2.1 (Mock)",
      error: "Mock: Simulated DFBnet login failure",
      mock: true,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
