"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { calculateEligibility } from "@packages/shared-logic";
import { notFound } from "next/navigation";
import type { RegistrationStatus, EligibilityResult } from "@packages/shared-types";
import type { RegistrationDetail, RegistrationDetailResult } from "./types";

const uuidSchema = z.string().uuid();

/**
 * Lädt vollständige Details einer Registration
 */
export async function getRegistrationDetails(
  id: string
): Promise<RegistrationDetailResult> {
  // 1. Input-Validierung
  const parseResult = uuidSchema.safeParse(id);
  if (!parseResult.success) {
    notFound();
  }

  // 2. Auth Guard
  const user = await requireRole(["SUPER_ADMIN", "PASSWART", "TRAINER", "ANTRAGSTELLER"]);

  const supabase = await createSupabaseServerClient();

  // Fetch Registration mit allen Joins
  const { data, error } = await supabase
    .from("registrations")
    .select(
      `
      id,
      player_name,
      player_birth_date,
      player_dfb_id,
      status,
      eligibility_date,
      sperrfrist_start,
      sperrfrist_end,
      registration_reason,
      player_data,
      consent_flags,
      document_paths,
      photo_path,
      created_at,
      updated_at,
      submitted_at,
      created_by_user_id,
      team_id,
      teams(id, name, dfbnet_id),
      finance_status(is_paid, payment_method, paid_amount, paid_at, payment_reference, verified_by_trainer_id, verified_at),
      rpa_traces(id, registration_id, execution_id, status, started_at, completed_at, error_message, screenshot_baseline, screenshot_actual, visual_diff_score),
      audit_logs(
        id,
        action,
        old_value,
        new_value,
        timestamp,
        users(full_name, role)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error fetching registration:", error);
    notFound();
  }

  // RLS Check: Trainer darf nur eigenes Team sehen
  if (user.role === "TRAINER" && user.team_id !== data.team_id) {
    notFound();
  }

  // RLS Check: Antragsteller darf nur eigene Registrierungen sehen
  if (user.role === "ANTRAGSTELLER" && data.created_by_user_id !== user.id) {
    notFound();
  }

  // TEMP FIX: Eligibility-Berechnung deaktiviert wegen Datum-Problem
  const eligibility = {
    is_eligible: false,
    eligibility_date: "",
    sperrfrist_days: 0,
    sperrfrist_start: "",
    sperrfrist_end: "",
    calculation_reason: "Berechnung temporär deaktiviert",
    applied_rule: "Debug Mode",
  };

  // Supabase Storage URLs (Signed URLs für private Buckets)
  const photoUrl = data.photo_path
    ? await getSignedUrl("player-photos", data.photo_path)
    : null;

  const documentUrls = data.document_paths
    ? await Promise.all(
        data.document_paths.map((path: string) =>
          getSignedUrl("player-documents", path)
        )
      )
    : [];

  // Transform Data
  const teams = data.teams as unknown as { id: string; name: string; dfbnet_id: string | null } | null;
  const financeStatus = data.finance_status as unknown as RegistrationDetail["finance_status"];
  const rpaTraces = (data.rpa_traces || []) as unknown as Array<{
    id: string; registration_id: string; execution_id: string; status: string;
    started_at: string; completed_at: string | null; error_message: string | null;
    screenshot_baseline: string | null; screenshot_actual: string | null; visual_diff_score: number | null;
  }>;
  const auditLogs = (data.audit_logs || []) as unknown as Array<{
    id: string; action: string; old_value: string | null; new_value: string | null;
    timestamp: string; users: { full_name: string | null; role: string } | null;
  }>;

  const registration: RegistrationDetail = {
    id: data.id,
    player_name: data.player_name,
    player_birth_date: data.player_birth_date,
    player_dfb_id: data.player_dfb_id,
    status: data.status as RegistrationStatus,
    eligibility_date: data.eligibility_date,
    sperrfrist_start: data.sperrfrist_start,
    sperrfrist_end: data.sperrfrist_end,
    registration_reason: data.registration_reason,
    player_data: data.player_data || {},
    consent_flags: data.consent_flags || {},
    document_paths: data.document_paths,
    photo_path: data.photo_path,
    created_at: data.created_at,
    updated_at: data.updated_at,
    submitted_at: data.submitted_at,
    created_by_user_id: data.created_by_user_id,
    team: teams ? { id: teams.id, name: teams.name, dfbnet_id: teams.dfbnet_id } : null,
    finance_status: financeStatus || null,
    rpa_traces: rpaTraces.map((trace) => ({
      id: trace.id,
      registration_id: trace.registration_id,
      execution_id: trace.execution_id,
      status: trace.status,
      started_at: trace.started_at,
      completed_at: trace.completed_at,
      error_message: trace.error_message,
      screenshot_baseline: trace.screenshot_baseline,
      screenshot_actual: trace.screenshot_actual,
      visual_diff_score: trace.visual_diff_score,
    })),
    audit_logs: auditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      old_value: log.old_value,
      new_value: log.new_value,
      timestamp: log.timestamp,
      user: log.users
        ? { full_name: log.users.full_name, role: log.users.role }
        : null,
    })),
  };

  return {
    registration,
    eligibility,
    photoUrl,
    documentUrls,
  };
}

/**
 * Helper: Erstellt Signed URL für Supabase Storage
 */
async function getSignedUrl(bucket: string, path: string): Promise<string> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600); // 1 hour expiry

  if (error) {
    console.error(`Error creating signed URL for ${bucket}/${path}:`, error);
    return "";
  }

  return data.signedUrl;
}
