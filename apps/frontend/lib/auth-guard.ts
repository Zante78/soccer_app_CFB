"use server";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// CFB-spezifische Rollen aus der Datenbank
export type RoleType = "SUPER_ADMIN" | "PASSWART" | "TRAINER" | "ANTRAGSTELLER";

type AuthenticatedUser = {
  id: string;
  email: string;
  role: RoleType;
  full_name: string | null;
  team_id: string | null;
};

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

/** Rollen die alle Registrierungen sehen dürfen */
export const ADMIN_ROLES: RoleType[] = ["SUPER_ADMIN", "PASSWART"];

/** Rollen die Team-Registrierungen sehen dürfen */
export const TEAM_ACCESS_ROLES: RoleType[] = [
  "SUPER_ADMIN",
  "PASSWART",
  "TRAINER",
];

/** Rollen die RPA Traces verwalten dürfen */
export const RPA_ADMIN_ROLES: RoleType[] = ["SUPER_ADMIN", "PASSWART"];

/** Rollen die Registrierungsstatus ändern dürfen */
export const STATUS_CHANGE_ROLES: RoleType[] = ["SUPER_ADMIN", "PASSWART"];

/** Rollen die Zahlungen verifizieren dürfen (Cash/QR) */
export const PAYMENT_VERIFY_ROLES: RoleType[] = [
  "SUPER_ADMIN",
  "PASSWART",
  "TRAINER",
];
