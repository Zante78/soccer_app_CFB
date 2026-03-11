"use server";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { DASHBOARD_ROLES } from "@/lib/auth-types";
import { RegistrationStatus } from "@packages/shared-types";
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
  await requireRole(DASHBOARD_ROLES);

  const supabase = await createSupabaseServerClient();

  // Parallel Queries für Performance
  // WICHTIG: Alle Queries müssen über registrations gehen, damit RLS greift!
  const [
    registrationsResult,
    financeResult,
    rpaTracesResult,
    auditLogsResult,
  ] = await Promise.all([
    // 1. Alle Registrierungen (Status Breakdown) — exclude soft-deleted
    supabase.from("registrations").select("status, id").is("deleted_at", null),

    // 2. Finance Status (Payment Stats) - left join to include registrations without payment
    supabase
      .from("registrations")
      .select("finance_status(is_paid)")
      .is("deleted_at", null),

    // 3. RPA Traces (Bot Success Rate) - via registrations Join — exclude soft-deleted
    supabase
      .from("registrations")
      .select("rpa_traces(status)")
      .is("deleted_at", null),

    // 4. Recent Activity (Audit Logs) - via registrations join to exclude soft-deleted
    supabase
      .from("audit_logs")
      .select(`
        id,
        action,
        timestamp,
        users(full_name),
        registrations!inner(player_name)
      `)
      .is("registrations.deleted_at", null)
      .order("timestamp", { ascending: false })
      .limit(10),
  ]);

  // Status Breakdown berechnen
  const statusBreakdown = calculateStatusBreakdown(
    registrationsResult.data || []
  );

  // Payment Stats berechnen (finance_status ist nested)
  const paymentStats = calculatePaymentStats(
    (financeResult.data || []).map(reg => reg.finance_status).filter(Boolean) as Array<{ is_paid: boolean }>
  );

  // Bot Stats berechnen (rpa_traces ist nested array)
  const allTraces = (rpaTracesResult.data || [])
    .flatMap(reg => reg.rpa_traces || [])
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
  const allStatuses = Object.values(RegistrationStatus);

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

function formatAuditLogs(logs: Array<{
  id: string;
  action: string;
  timestamp: string | null;
  users: { full_name: string } | null;
  registrations: { player_name: string } | null;
}>): AuditLogEntry[] {
  return logs.map((log) => {
    return {
      id: log.id,
      action: log.action,
      timestamp: log.timestamp || "",
      user_name: log.users?.full_name || null,
      registration_player_name: log.registrations?.player_name || null,
    };
  });
}
