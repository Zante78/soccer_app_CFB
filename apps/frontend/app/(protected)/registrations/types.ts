// Registrations Types (separate file because "use server" can't export types)

import type { RegistrationStatus } from "@packages/shared-types";

export type RegistrationListItem = {
  id: string;
  player_name: string;
  player_birth_date: string;
  player_dfb_id: string | null;
  status: RegistrationStatus;
  team_name: string | null;
  eligibility_date: string | null;
  created_at: string | null;
  is_paid: boolean;
  payment_method: string | null;
  rpa_status: string | null;
};

export type GetRegistrationsParams = {
  page?: number;
  pageSize?: number;
  status?: RegistrationStatus | null;
  teamId?: string | null;
  searchQuery?: string | null;
  sortBy?: "created_at" | "player_name" | "eligibility_date" | "status";
  sortOrder?: "asc" | "desc";
};

export type GetRegistrationsResult = {
  registrations: RegistrationListItem[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
};
