// Dashboard Types (separate file because "use server" can't export types)

import type { RegistrationStatus } from "@packages/shared-types";

export type StatusBreakdown = Record<RegistrationStatus, number>;

export type PaymentStats = {
  total: number;
  paid: number;
  unpaid: number;
  paymentRate: number;
};

export type BotStats = {
  total: number;
  success: number;
  failed: number;
  successRate: number;
};

export type DashboardMetrics = {
  totalRegistrations: number;
  statusBreakdown: StatusBreakdown;
  paymentStats: PaymentStats;
  botStats: BotStats;
  recentActivity: AuditLogEntry[];
};

export type AuditLogEntry = {
  id: string;
  action: string;
  timestamp: string;
  user_name: string | null;
  registration_player_name: string | null;
};
