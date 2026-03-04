/**
 * Shared TypeScript Types for CFB Pass-Automation System
 *
 * This package contains all shared type definitions used across
 * the monorepo (frontend, rpa-bot, shared-logic).
 */

// ===== ENUMS =====

export enum RegistrationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  VALIDATION_PENDING = 'VALIDATION_PENDING',
  READY_FOR_BOT = 'READY_FOR_BOT',
  BOT_IN_PROGRESS = 'BOT_IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
  MANUALLY_PROCESSED = 'MANUALLY_PROCESSED',
  VISUAL_REGRESSION_ERROR = 'VISUAL_REGRESSION_ERROR'
}

export enum PaymentMethod {
  PAYPAL = 'PAYPAL',
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  EXEMPT = 'EXEMPT'
}

export enum RoleType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  PASSWART = 'PASSWART',
  TRAINER = 'TRAINER',
  ANTRAGSTELLER = 'ANTRAGSTELLER'
}

export enum RegistrationReason {
  NEW_PLAYER = 'NEW_PLAYER',
  TRANSFER = 'TRANSFER',
  RE_REGISTRATION = 'RE_REGISTRATION',
  INTERNATIONAL_TRANSFER = 'INTERNATIONAL_TRANSFER'
}

export enum RPATraceStatus {
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  VISUAL_REGRESSION_ERROR = 'VISUAL_REGRESSION_ERROR',
  TIMEOUT = 'TIMEOUT'
}

// ===== PLAYER DATA =====

export interface PlayerRegistrationData {
  player_name: string;
  player_birth_date: string; // ISO 8601 date
  player_dfb_id?: string;
  team_id: string;
  team_name: string;
  registration_reason: RegistrationReason;
  previous_team_name?: string;
  previous_team_deregistration_date?: string;
  previous_team_last_game?: string;
  player_data: Record<string, unknown>; // JSONB flexibility
  consent_flags: ConsentFlags;
  document_paths: string[];
  photo_path?: string;
}

export interface ConsentFlags {
  dsgvo_consent: boolean;
  eligibility_declaration: boolean;
  accuracy_confirmed: boolean;
  signature_data?: string; // Base64 encoded signature
  signature_timestamp?: string;
}

// ===== ELIGIBILITY =====

export interface EligibilityResult {
  is_eligible: boolean;
  eligibility_date: string; // ISO 8601 date
  sperrfrist_days: number;
  sperrfrist_start: string;
  sperrfrist_end: string;
  calculation_reason: string;
  applied_rule: string; // e.g., "§ 16 SpO (Senioren)"
}

// ===== GUIDED STORY STEPS =====

export interface GuidedStoryStep1 {
  acknowledged: boolean;
}

export interface GuidedStoryStep2 {
  selected_player_id?: string;
  is_new_player: boolean;
}

export interface GuidedStoryStep3 {
  player_name: string;
  player_birth_date: string;
  registration_number?: string;
  team_id: string;
  previous_team_name?: string;
  previous_team_deregistration_date?: string;
  previous_team_last_game?: string;
}

export interface GuidedStoryStep4 {
  photo_uploaded: boolean;
  photo_path: string;
  documents_uploaded: string[];
  quality_check_passed: boolean;
}

export interface GuidedStoryStep5 {
  eligibility_result: EligibilityResult;
  user_acknowledged: boolean;
}

export interface GuidedStoryStep6 {
  consent_flags: ConsentFlags;
  data_review_confirmed: boolean;
}

export interface GuidedStoryStep7 {
  payment_method: PaymentMethod;
  payment_completed: boolean;
  payment_reference?: string;
  qr_code_data?: string;
}

export interface GuidedStoryStep8 {
  magic_link: string;
  magic_link_sent: boolean;
  qr_code_magic_link: string;
}

// ===== DATABASE TYPES =====

export interface Registration {
  id: string; // UUID
  player_name: string;
  player_birth_date: string;
  player_dfb_id?: string;
  team_id: string;
  team_name: string;
  status: RegistrationStatus;
  eligibility_date: string;
  sperrfrist_start: string;
  sperrfrist_end: string;
  registration_reason: RegistrationReason;
  player_data: Record<string, unknown>;
  consent_flags: ConsentFlags;
  document_paths: string[];
  photo_path?: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
  created_by_user_id?: string;
}

export interface AuditLog {
  id: string; // UUID
  registration_id: string;
  action: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  user_id?: string;
  ip_address?: string;
  timestamp: string;
}

export interface RPATrace {
  id: string; // UUID
  registration_id: string;
  execution_id: string;
  status: RPATraceStatus;
  dfbnet_draft_url?: string;
  screenshot_actual?: string;
  screenshot_baseline?: string;
  visual_diff_score?: number;
  error_message?: string;
  error_stacktrace?: string;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  bot_version: string;
}

export interface FinanceStatus {
  registration_id: string;
  payment_method: PaymentMethod;
  is_paid: boolean;
  paid_amount?: number;
  paid_at?: string;
  payment_reference?: string;
  verified_by_trainer_id?: string;
  verified_at?: string;
}

export interface User {
  id: string; // UUID
  email: string;
  role: RoleType;
  full_name: string;
  team_id?: string;
  created_at: string;
  last_login?: string;
  is_active: boolean;
}

export interface Team {
  id: string; // UUID
  name: string;
  dfbnet_id?: string;
  season: number;
  created_at: string;
}

// ===== RPA TYPES =====

export interface VisualDiffResult {
  diff_score: number; // 0.0 to 1.0
  pixel_count_total: number;
  pixel_count_diff: number;
  threshold_exceeded: boolean;
  tolerance: number;
  screenshot_actual_path: string;
  screenshot_baseline_path: string;
  diff_image_path?: string;
}

export interface RPAExecutionTrace {
  execution_id: string;
  registration_id: string;
  steps: RPAStepTrace[];
  final_status: RPATraceStatus;
  total_duration_ms: number;
  error_summary?: string;
}

export interface RPAStepTrace {
  step_name: string;
  step_order: number;
  started_at: string;
  completed_at: string;
  duration_ms: number;
  success: boolean;
  screenshot_path?: string;
  visual_diff_result?: VisualDiffResult;
  error_message?: string;
}

// ===== VALIDATION TYPES =====

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  is_valid: boolean;
  errors: ValidationError[];
}

// ===== API TYPES =====

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface MagicLinkData {
  registration_id: string;
  token: string;
  expires_at: string;
}

// ===== UTILITY TYPES =====

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};
