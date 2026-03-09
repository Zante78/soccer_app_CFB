"use server";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { RoleType, AuthenticatedUser } from "./auth-types";

/**
 * Stellt sicher, dass ein Benutzer authentifiziert ist.
 * Wirft einen Fehler, wenn kein Benutzer eingeloggt ist.
 */
export const requireAuth = cache(async (): Promise<AuthenticatedUser> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Nicht authentifiziert. Bitte melde dich an.");
  }

  // Rolle aus users-Tabelle laden
  const { data: userProfile } = await supabase
    .from("users")
    .select("role, full_name, team_id")
    .eq("id", user.id)
    .maybeSingle();

  const role = (userProfile?.role as RoleType) || "ANTRAGSTELLER"; // Fallback

  return {
    id: user.id,
    email: user.email || "",
    role,
    full_name: userProfile?.full_name || null,
    team_id: userProfile?.team_id || null,
  };
});

/**
 * Stellt sicher, dass der Benutzer eine der erforderlichen Rollen hat.
 * Wirft einen Fehler bei fehlender Berechtigung.
 */
export async function requireRole(
  allowedRoles: RoleType[]
): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    throw new Error(
      `Keine Berechtigung. Erforderliche Rolle: ${allowedRoles.join(", ")}. Deine Rolle: ${user.role}`
    );
  }

  return user;
}
