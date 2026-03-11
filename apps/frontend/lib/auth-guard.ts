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

  const VALID_ROLES: RoleType[] = ["SUPER_ADMIN", "PASSWART", "TRAINER", "ANTRAGSTELLER"];
  const rawRole = userProfile?.role;
  const role: RoleType = typeof rawRole === "string" && VALID_ROLES.includes(rawRole as RoleType)
    ? (rawRole as RoleType)
    : "ANTRAGSTELLER";

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
    if (process.env.NODE_ENV === "development") {
      console.error(
        `Auth denied: User ${user.id} has role ${user.role}, required: ${allowedRoles.join(", ")}`
      );
    }
    throw new Error("Keine Berechtigung für diese Aktion.");
  }

  return user;
}
