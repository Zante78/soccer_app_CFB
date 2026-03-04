"use server";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import type { RegistrationStatus, RPATraceStatus } from "@packages/shared-types";

// Helper Types
type StatusBreakdown = Record<RegistrationStatus, number>;
type PaymentStats = {
  total: number;
  paid: number;
  unpaid: number;
  paymentRate: number;
};
type BotStats = {
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

type AuditLogEntry = {
  id: string;
  action: string;
  timestamp: string;
  user_name: string | null;
  registration_player_name: string | null;
};

/**
 * Aggregiert Dashboard-Metriken (gecached für Request-Deduplication)
 */
export const getDashboardMetrics = cache(async (): Promise<DashboardMetrics> => {
  // Auth Guard: Nur SUPER_ADMIN und PASSWART
  await requireRole(["SUPER_ADMIN", "PASSWART"]);

  const supabase = await createSupabaseServerClient();

  // Parallel Queries für Performance
  const [
    registrationsResult,
    financeResult,
    rpaTracesResult,
    auditLogsResult,
  ] = await Promise.all([
    // 1. Alle Registrierungen (Status Breakdown)
    supabase.from("registrations").select("status"),

    // 2. Finance Status (Payment Stats)
    supabase.from("finance_status").select("is_paid"),

    // 3. RPA Traces (Bot Success Rate)
    supabase.from("rpa_traces").select("status"),

    // 4. Recent Activity (Last 10 Audit Logs mit User Info)
    supabase
      .from("audit_logs")
      .select(`
        id,
        action,
        timestamp,
        users(full_name),
        registrations(player_name)
      `)
      .order("timestamp", { ascending: false })
      .limit(10),
  ]);

  // Status Breakdown berechnen
  const statusBreakdown = calculateStatusBreakdown(
    registrationsResult.data || []
  );

  // Payment Stats berechnen
  const paymentStats = calculatePaymentStats(financeResult.data || []);

  // Bot Stats berechnen
  const botStats = calculateBotStats(rpaTracesResult.data || []);

  // Recent Activity formatieren
  const recentActivity = formatAuditLogs(auditLogsResult.data || []);

  return {
    totalRegistrations: registrationsResult.data?.length || 0,
    statusBreakdown,
    paymentStats,
    botStats,
    recentActivity,
  };
});

// Helper Functions

function calculateStatusBreakdown(
  registrations: Array<{ status: string }>
): StatusBreakdown {
  const breakdown: Partial<StatusBreakdown> = {};

  registrations.forEach((reg) => {
    const status = reg.status as RegistrationStatus;
    breakdown[status] = (breakdown[status] || 0) + 1;
  });

  // Ensure all statuses are present (even with 0)
  const allStatuses: RegistrationStatus[] = [
    "DRAFT",
    "SUBMITTED",
    "VALIDATION_PENDING",
    "READY_FOR_BOT",
    "BOT_IN_PROGRESS",
    "COMPLETED",
    "ERROR",
    "MANUALLY_PROCESSED",
    "VISUAL_REGRESSION_ERROR",
  ];

  allStatuses.forEach((status) => {
    if (!(status in breakdown)) {
      breakdown[status] = 0;
    }
  });

  return breakdown as StatusBreakdown;
}

function calculatePaymentStats(
  financeData: Array<{ is_paid: boolean }>
): PaymentStats {
  const total = financeData.length;
  const paid = financeData.filter((f) => f.is_paid).length;
  const unpaid = total - paid;
  const paymentRate = total > 0 ? Math.round((paid / total) * 100) : 0;

  return { total, paid, unpaid, paymentRate };
}

function calculateBotStats(
  traces: Array<{ status: string }>
): BotStats {
  const total = traces.length;
  const success = traces.filter((t) => t.status === "SUCCESS").length;
  const failed = traces.filter(
    (t) => t.status === "FAILED" || t.status === "VISUAL_REGRESSION_ERROR"
  ).length;
  const successRate = total > 0 ? Math.round((success / total) * 100) : 0;

  return { total, success, failed, successRate };
}

function formatAuditLogs(logs: any[]): AuditLogEntry[] {
  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    timestamp: log.timestamp,
    user_name: log.users?.full_name || null,
    registration_player_name: log.registrations?.player_name || null,
  }));
}
