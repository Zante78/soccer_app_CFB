// CFB Pass-Automation Rollen
import type { RoleType } from "@/lib/auth-types";
import type { UserProfile } from "@/components/providers/auth-provider";

export type { RoleType, UserProfile };

/** Minimal shape for role-based permission checks */
type RoleCheckUser = Pick<UserProfile, "id" | "role" | "team_id">;

// Helper-Funktionen für Rollen-Checks

/**
 * Prüft ob der User Admin-Rechte hat (SUPER_ADMIN oder PASSWART)
 */
export function isAdmin(user: RoleCheckUser | null): boolean {
  if (!user) return false;
  return user.role === "SUPER_ADMIN" || user.role === "PASSWART";
}

/**
 * Prüft ob der User eine bestimmte Registrierung sehen darf
 */
export function canViewRegistration(
  user: RoleCheckUser | null,
  registration: { team_id?: string; created_by_user_id?: string }
): boolean {
  if (!user) return false;

  // SUPER_ADMIN und PASSWART sehen alles
  if (isAdmin(user)) return true;

  // TRAINER sieht nur eigenes Team
  if (user.role === "TRAINER" && user.team_id) {
    return registration.team_id === user.team_id;
  }

  // ANTRAGSTELLER sieht nur eigene Registrierungen
  if (user.role === "ANTRAGSTELLER") {
    return registration.created_by_user_id === user.id;
  }

  return false;
}

/**
 * Prüft ob der User eine Registrierung bearbeiten darf
 */
export function canEditRegistration(
  user: RoleCheckUser | null,
  registration: { team_id?: string; created_by_user_id?: string; status?: string }
): boolean {
  if (!user) return false;

  // Nur SUPER_ADMIN und PASSWART dürfen bearbeiten
  if (isAdmin(user)) return true;

  // ANTRAGSTELLER darf nur eigene DRAFT/SUBMITTED Registrierungen bearbeiten
  if (user.role === "ANTRAGSTELLER") {
    const isDraftOrSubmitted = registration.status === "DRAFT" || registration.status === "SUBMITTED";
    return registration.created_by_user_id === user.id && isDraftOrSubmitted;
  }

  return false;
}

/**
 * Prüft ob der User RPA Traces sehen darf
 */
export function canViewRPATraces(user: RoleCheckUser | null): boolean {
  if (!user) return false;
  return isAdmin(user);
}

/**
 * Prüft ob der User Zahlungen verifizieren darf
 */
export function canVerifyPayment(
  user: RoleCheckUser | null,
  registration?: { team_id?: string }
): boolean {
  if (!user) return false;

  // SUPER_ADMIN und PASSWART dürfen alle Zahlungen verifizieren
  if (isAdmin(user)) return true;

  // TRAINER darf nur Zahlungen seines Teams verifizieren
  if (user.role === "TRAINER" && user.team_id && registration) {
    return registration.team_id === user.team_id;
  }

  return false;
}
