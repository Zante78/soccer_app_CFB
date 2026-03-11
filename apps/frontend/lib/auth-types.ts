// Auth Types and Constants (separate file because "use server" can't export these)

export type RoleType = "SUPER_ADMIN" | "PASSWART" | "TRAINER" | "ANTRAGSTELLER";

/** All valid role values for runtime validation */
export const VALID_ROLES: RoleType[] = ["SUPER_ADMIN", "PASSWART", "TRAINER", "ANTRAGSTELLER"];

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: RoleType;
  full_name: string | null;
  team_id: string | null;
};

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

/** Alle authentifizierten Rollen */
export const ALL_ROLES: RoleType[] = [
  "SUPER_ADMIN",
  "PASSWART",
  "TRAINER",
  "ANTRAGSTELLER",
];

/** Dashboard-Rollen (ohne ANTRAGSTELLER) */
export const DASHBOARD_ROLES: RoleType[] = [
  "SUPER_ADMIN",
  "PASSWART",
  "TRAINER",
];
