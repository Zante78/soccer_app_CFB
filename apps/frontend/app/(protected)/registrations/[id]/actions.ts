"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { calculateEligibility } from "@packages/shared-logic";
import type { RegistrationStatus, EligibilityResult } from "@packages/shared-types";

export type RegistrationDetail = {
  id: string;
  player_name: string;
  player_birth_date: string;
  player_dfb_id: string | null;
  status: RegistrationStatus;
  eligibility_date: string | null;
  sperrfrist_start: string | null;
  sperrfrist_end: string | null;
  registration_reason: string;
  player_data: Record<string, any>;
  consent_flags: Record<string, any>;
  document_paths: string[] | null;
  photo_path: string | null;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  created_by_user_id: string;
  team: {
    id: string;
    name: string;
    dfbnet_id: string | null;
  } | null;
  finance_status: {
    is_paid: boolean;
    payment_method: string | null;
    paid_amount: number | null;
    paid_at: string | null;
    payment_reference: string | null;
    verified_by_trainer_id: string | null;
    verified_at: string | null;
  } | null;
  rpa_traces: Array<{
    id: string;
    execution_id: string;
    status: string;
    dfbnet_draft_url: string | null;
    visual_diff_score: number | null;
    error_message: string | null;
    started_at: string;
    completed_at: string | null;
    duration_ms: number | null;
  }>;
  audit_logs: Array<{
    id: string;
    action: string;
    old_value: string | null;
    new_value: string | null;
    timestamp: string;
    user: {
      full_name: string | null;
      role: string;
    } | null;
  }>;
};

export type RegistrationDetailResult = {
  registration: RegistrationDetail;
  eligibility: EligibilityResult;
  photoUrl: string | null;
  documentUrls: string[];
};

/**
 * Lädt vollständige Details einer Registration
 */
export async function getRegistrationDetails(
  id: string
): Promise<RegistrationDetailResult> {
  // Auth Guard
  const user = await requireRole(["SUPER_ADMIN", "PASSWART", "TRAINER"]);

  const supabase = await createSupabaseServerClient();

  // Fetch Registration mit allen Joins
  const { data, error } = await supabase
    .from("registrations")
    .select(
      `
      *,
      teams(*),
      finance_status(*),
      rpa_traces(*),
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

  if (error) {
    console.error("Error fetching registration:", error);
    throw new Error("Registrierung nicht gefunden");
  }

  // RLS Check: Trainer darf nur eigenes Team sehen
  if (user.role === "TRAINER" && user.team_id !== data.team_id) {
    throw new Error("Keine Berechtigung für diese Registrierung");
  }

  // Eligibility berechnen
  const eligibility = calculateEligibility({
    birthDate: data.player_birth_date,
    registrationReason: data.registration_reason as any,
    deregistrationDate: data.player_data?.deregistration_date || null,
    lastGameDate: data.player_data?.last_game_date || null,
  });

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
    team: (data.teams as any)
      ? {
          id: (data.teams as any).id,
          name: (data.teams as any).name,
          dfbnet_id: (data.teams as any).dfbnet_id,
        }
      : null,
    finance_status: (data.finance_status as any)?.[0] || null,
    rpa_traces: (data.rpa_traces as any) || [],
    audit_logs: ((data.audit_logs as any) || []).map((log: any) => ({
      id: log.id,
      action: log.action,
      old_value: log.old_value,
      new_value: log.new_value,
      timestamp: log.timestamp,
      user: log.users
        ? {
            full_name: log.users.full_name,
            role: log.users.role,
          }
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
