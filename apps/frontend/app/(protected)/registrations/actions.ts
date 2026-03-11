"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { RegistrationStatus } from "@packages/shared-types";
import type {
  RegistrationListItem,
  GetRegistrationsParams,
  GetRegistrationsResult,
} from "./types";

const registrationStatusValues = Object.values(RegistrationStatus) as string[];

function parseRegistrationStatus(value: string): RegistrationStatus {
  if (registrationStatusValues.includes(value)) {
    return value as RegistrationStatus;
  }
  return RegistrationStatus.DRAFT;
}

const getRegistrationsSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional().default(50),
  status: z.nativeEnum(RegistrationStatus).nullable().optional(),
  teamId: z.string().uuid().nullable().optional(),
  searchQuery: z.string().max(200).nullable().optional(),
  sortBy: z.enum(["created_at", "player_name", "eligibility_date", "status"]).optional().default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

/**
 * Lädt paginierte Registrierungen mit Filtern
 */
export async function getRegistrations(
  params: GetRegistrationsParams = {}
): Promise<GetRegistrationsResult> {
  // 1. Input-Validierung
  const parseResult = getRegistrationsSchema.safeParse(params);
  if (!parseResult.success) {
    return {
      registrations: [],
      totalCount: 0,
      pageSize: 50,
      currentPage: 1,
      totalPages: 0,
    };
  }
  const validated = parseResult.data;

  // 2. Auth Guard: Alle authentifizierten Rollen (RLS filtert Daten)
  const user = await requireRole(["SUPER_ADMIN", "PASSWART", "TRAINER", "ANTRAGSTELLER"]);

  const {
    page,
    pageSize,
    status,
    teamId,
    searchQuery,
    sortBy,
    sortOrder,
  } = validated;

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
    )
    .is("deleted_at", null);

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

  // Filter: Search (Player Name oder DFB-ID) — sanitized
  if (searchQuery && searchQuery.trim()) {
    // Escape PostgREST special chars: %, _, \, commas and dots (filter operators)
    const sanitized = searchQuery.trim().replace(/[%_\\.,()]/g, "\\$&");
    query = query.or(
      `player_name.ilike.%${sanitized}%,player_dfb_id.ilike.%${sanitized}%`
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
  const registrations: RegistrationListItem[] = (data || []).map((reg) => {
    const teams = reg.teams;
    const financeStatus = reg.finance_status;
    const rpaTraces = reg.rpa_traces;

    return {
      id: reg.id,
      player_name: reg.player_name,
      player_birth_date: reg.player_birth_date,
      player_dfb_id: reg.player_dfb_id,
      status: parseRegistrationStatus(reg.status),
      team_name: teams?.name || null,
      eligibility_date: reg.eligibility_date,
      created_at: reg.created_at,
      is_paid: financeStatus?.is_paid || false,
      payment_method: financeStatus?.payment_method || null,
      rpa_status: rpaTraces?.[0]?.status || null,
    };
  });

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
