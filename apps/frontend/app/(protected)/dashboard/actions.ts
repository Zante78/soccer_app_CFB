"use server";

import { cache } from "react";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { DASHBOARD_ROLES } from "@/lib/auth-types";
import { RegistrationStatus } from "@packages/shared-types";

const FinanceStatusSchema = z.object({ is_paid: z.boolean() });
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

  // Parallel Queries für Performance — konsolidiert (4→2)
  // Query 1: Alle Registrierungen mit Finance + RPA Traces (single query statt 3)
  // Query 2: Recent Audit Logs (separate Tabelle, muss eigener Query bleiben)
  const [
    registrationsResult,
    auditLogsResult,
  ] = await Promise.all([
    supabase
      .from("registrations")
      .select("status, id, finance_status(is_paid), rpa_traces(status)")
      .is("deleted_at", null),

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

  const allRegistrations = registrationsResult.data || [];

  // Status Breakdown berechnen
  const statusBreakdown = calculateStatusBreakdown(allRegistrations);

  // Payment Stats berechnen (finance_status ist nested) — Zod-validated
  const paymentStats = calculatePaymentStats(
    allRegistrations
      .map(reg => FinanceStatusSchema.safeParse(reg.finance_status))
      .filter(r => r.success)
      .map(r => r.data)
  );

  // Bot Stats berechnen (rpa_traces ist nested array)
  const allTraces = allRegistrations
    .flatMap(reg => reg.rpa_traces || [])
    .filter(Boolean);
  const botStats = calculateBotStats(allTraces);

  // Recent Activity formatieren - Direct query, RLS filtered
  const recentActivity = formatAuditLogs(auditLogsResult.data || []);

  return {
    totalRegistrations: allRegistrations.length,
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
  // Initialize all statuses to 0 first for type-safe StatusBreakdown
  const allStatuses = Object.values(RegistrationStatus);
  const breakdown = Object.fromEntries(
    allStatuses.map(status => [status, 0])
  ) as StatusBreakdown;

  registrations.forEach((reg) => {
    if (reg.status in breakdown) {
      breakdown[reg.status as RegistrationStatus] += 1;
    }
  });

  return breakdown;
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
