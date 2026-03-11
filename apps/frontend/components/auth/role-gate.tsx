"use client";

import { useAuth, type UserProfile } from "@/components/providers/auth-provider";
import { RoleType, canViewRegistration, canEditRegistration, canViewRPATraces, canVerifyPayment } from "@/config/roles";

type RoleGateProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  // Einfacher Rollen-Check
  requiredRole?: RoleType | RoleType[];
  // Context-basierte Checks
  registrationContext?: {
    type: "view" | "edit" | "verifyPayment";
    registration?: { team_id?: string; created_by_user_id?: string; status?: string };
  };
  // Custom Check-Funktion
  check?: (profile: UserProfile) => boolean;
};

export function RoleGate({
  children,
  fallback = null,
  requiredRole,
  registrationContext,
  check,
}: RoleGateProps) {
  const { profile, isLoading } = useAuth();

  // Loading State
  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!profile) {
    return <>{fallback}</>;
  }

  // 1. Custom Check Function
  if (check) {
    return check(profile) ? <>{children}</> : <>{fallback}</>;
  }

  // 2. Context-based Check (Registration-spezifisch)
  if (registrationContext) {
    const userProfile = {
      id: profile.id,
      name: profile.full_name || profile.email,
      role: profile.role,
      team_id: profile.team_id,
    };

    switch (registrationContext.type) {
      case "view":
        if (registrationContext.registration && canViewRegistration(userProfile, registrationContext.registration)) {
          return <>{children}</>;
        }
        break;
      case "edit":
        if (registrationContext.registration && canEditRegistration(userProfile, registrationContext.registration)) {
          return <>{children}</>;
        }
        break;
      case "verifyPayment":
        if (canVerifyPayment(userProfile, registrationContext.registration)) {
          return <>{children}</>;
        }
        break;
    }
    return <>{fallback}</>;
  }

  // 3. Simple Role Check
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (roles.includes(profile.role)) {
      return <>{children}</>;
    }
  }

  return <>{fallback}</>;
}
