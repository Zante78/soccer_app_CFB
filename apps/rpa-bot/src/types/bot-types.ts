/**
 * Shared types for Mock Bot and DFBnet Bot
 */

export type ExecuteRequest = {
  registration_id: string;
  trace_id: string;
  player_name?: string;
  team_name?: string;
};

export type ExecuteResult = {
  success: boolean;
  visual_regression_error?: boolean;
  draft_url?: string | null;
  screenshot_actual?: string | null;
  screenshot_baseline?: string | null;
  visual_diff_score?: number | null;
  duration_ms: number;
  error?: string;
  dfbnet_version?: string;
  mock: boolean;
};

export type HealthCheckResult = {
  success: boolean;
  duration_ms: number;
  dfbnet_version?: string;
  mock: boolean;
  error?: string;
};
