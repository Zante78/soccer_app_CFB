"use server";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import type { RegistrationStatus, RPATraceStatus } from "@packages/shared-types";
import type {
  DashboardMetrics,
  StatusBreakdown,
  PaymentStats,
  BotStats,
  AuditLogEntry,
} from "./types";

/**
 * Aggregiert Dashboard-Metriken (gecached für Request-Deduplication)
 * RLS filtert automatisch die Daten je nach Rolle
 */
export const getDashboardMetrics = cache(async (): Promise<DashboardMetrics> => {
  // Auth Guard: Alle authentifizierten Rollen (RLS filtert Daten)
  await requireRole(["SUPER_ADMIN", "PASSWART", "TRAINER", "ANTRAGSTELLER"]);

  const supabase = await createSupabaseServerClient();

  // Parallel Queries für Performance
  // WICHTIG: Alle Queries müssen über registrations gehen, damit RLS greift!
  const [
    registrationsResult,
    financeResult,
    rpaTracesResult,
  ] = await Promise.all([
    // 1. Alle Registrierungen (Status Breakdown)
    supabase.from("registrations").select("status, id"),

    // 2. Finance Status (Payment Stats) - via registrations Join
    supabase
      .from("registrations")
      .select("finance_status!inner(is_paid)"),

    // 3. RPA Traces (Bot Success Rate) - via registrations Join
    supabase
      .from("registrations")
      .select("rpa_traces(status)"),
  ]);

  // 4. Recent Activity (Audit Logs) - Load directly with RLS
  // RLS policies on audit_logs will filter based on role
  const auditLogsResult = await supabase
    .from("audit_logs")
    .select(`
      id,
      action,
      timestamp,
      users(full_name),
      registrations(player_name)
    `)
    .order("timestamp", { ascending: false })
    .limit(10);

  // Status Breakdown berechnen
  const statusBreakdown = calculateStatusBreakdown(
    registrationsResult.data || []
  );

  // Payment Stats berechnen (finance_status ist nested)
  const paymentStats = calculatePaymentStats(
    (financeResult.data || []).map(reg => {
      const fs = reg.finance_status as unknown as { is_paid: boolean } | null;
      return fs;
    }).filter(Boolean) as Array<{ is_paid: boolean }>
  );

  // Bot Stats berechnen (rpa_traces ist nested array)
  const allTraces = (rpaTracesResult.data || [])
    .flatMap(reg => {
      const traces = reg.rpa_traces as unknown as Array<{ status: string }> | null;
      return traces || [];
    })
    .filter(Boolean);
  const botStats = calculateBotStats(allTraces);

  // Recent Activity formatieren - Direct query, RLS filtered
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
  const breakdown: Record<string, number> = {};

  registrations.forEach((reg) => {
    breakdown[reg.status] = (breakdown[reg.status] || 0) + 1;
  });

  // Ensure all statuses are present (even with 0)
  const allStatuses = [
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

function formatAuditLogs(logs: unknown[]): AuditLogEntry[] {
  return logs.map((raw) => {
    const log = raw as {
      id: string;
      action: string;
      timestamp: string;
      users: { full_name: string } | { full_name: string }[] | null;
      registrations: { player_name: string } | { player_name: string }[] | null;
    };
    const user = Array.isArray(log.users) ? log.users[0] : log.users;
    const reg = Array.isArray(log.registrations) ? log.registrations[0] : log.registrations;
    return {
      id: log.id,
      action: log.action,
      timestamp: log.timestamp,
      user_name: user?.full_name || null,
      registration_player_name: reg?.player_name || null,
    };
  });
}
