"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import type { RegistrationStatus } from "@packages/shared-types";
import type {
  RegistrationListItem,
  GetRegistrationsParams,
  GetRegistrationsResult,
} from "./types";

/**
 * Lädt paginierte Registrierungen mit Filtern
 */
export async function getRegistrations(
  params: GetRegistrationsParams = {}
): Promise<GetRegistrationsResult> {
  // Auth Guard: Alle authentifizierten Rollen (RLS filtert Daten)
  const user = await requireRole(["SUPER_ADMIN", "PASSWART", "TRAINER", "ANTRAGSTELLER"]);

  const {
    page = 1,
    pageSize = 50,
    status,
    teamId,
    searchQuery,
    sortBy = "created_at",
    sortOrder = "desc",
  } = params;

  const supabase = await createSupabaseServerClient();
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  // Base Query mit Joins
  let query = supabase
    .from("registrations")
    .select(
      `
      id,
      player_name,
      player_birth_date,
      player_dfb_id,
      status,
      eligibility_date,
      created_at,
      team_id,
      teams!inner(name),
      finance_status!inner(is_paid, payment_method),
      rpa_traces(status)
    `,
      { count: "exact" }
    );

  // RLS: Trainer sehen nur ihr Team
  if (user.role === "TRAINER" && user.team_id) {
    query = query.eq("team_id", user.team_id);
  }

  // Filter: Status
  if (status) {
    query = query.eq("status", status);
  }

  // Filter: Team (nur für SUPER_ADMIN/PASSWART relevant)
  if (teamId && (user.role === "SUPER_ADMIN" || user.role === "PASSWART")) {
    query = query.eq("team_id", teamId);
  }

  // Filter: Search (Player Name oder DFB-ID)
  if (searchQuery && searchQuery.trim()) {
    query = query.or(
      `player_name.ilike.%${searchQuery}%,player_dfb_id.ilike.%${searchQuery}%`
    );
  }

  // Sorting
  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  // Pagination
  const { data, count, error } = await query.range(start, end);

  if (error) {
    console.error("Error fetching registrations:", error);
    throw new Error("Fehler beim Laden der Registrierungen");
  }

  // Transform Data
  const registrations: RegistrationListItem[] = (data || []).map((reg) => ({
    id: reg.id,
    player_name: reg.player_name,
    player_birth_date: reg.player_birth_date,
    player_dfb_id: reg.player_dfb_id,
    status: reg.status as RegistrationStatus,
    team_name: (reg.teams as any)?.name || null,
    eligibility_date: reg.eligibility_date,
    created_at: reg.created_at,
    is_paid: (reg.finance_status as any)?.is_paid || false,
    payment_method: (reg.finance_status as any)?.payment_method || null,
    rpa_status: (reg.rpa_traces as any)?.[0]?.status || null,
  }));

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    registrations,
    totalCount,
    pageSize,
    currentPage: page,
    totalPages,
  };
}

/**
 * Lädt alle Teams für Filter-Dropdown
 */
export async function getTeams(): Promise<Array<{ id: string; name: string }>> {
  await requireRole(["SUPER_ADMIN", "PASSWART", "TRAINER", "ANTRAGSTELLER"]);

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("teams")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching teams:", error);
    return [];
  }

  return data || [];
}
