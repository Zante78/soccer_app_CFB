// Registration Detail Types (separate file because "use server" can't export types)

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
    registration_id: string;
    execution_id: string;
    status: string;
    started_at: string;
    completed_at: string | null;
    error_message: string | null;
    screenshot_baseline: string | null;
    screenshot_actual: string | null;
    visual_diff_score: number | null;
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
