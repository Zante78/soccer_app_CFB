export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          id: string
          ip_address: unknown
          new_value: Json | null
          old_value: Json | null
          registration_id: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          old_value?: Json | null
          registration_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          old_value?: Json | null
          registration_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_execution_lock: {
        Row: {
          expires_at: string | null
          id: number
          locked_at: string | null
          locked_by: string | null
          registration_id: string | null
        }
        Insert: {
          expires_at?: string | null
          id?: number
          locked_at?: string | null
          locked_by?: string | null
          registration_id?: string | null
        }
        Update: {
          expires_at?: string | null
          id?: number
          locked_at?: string | null
          locked_by?: string | null
          registration_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bot_execution_lock_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_status: {
        Row: {
          is_paid: boolean
          paid_amount: number | null
          paid_at: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_reference: string | null
          registration_id: string
          verified_at: string | null
          verified_by_trainer_id: string | null
        }
        Insert: {
          is_paid?: boolean
          paid_amount?: number | null
          paid_at?: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_reference?: string | null
          registration_id: string
          verified_at?: string | null
          verified_by_trainer_id?: string | null
        }
        Update: {
          is_paid?: boolean
          paid_amount?: number | null
          paid_at?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_reference?: string | null
          registration_id?: string
          verified_at?: string | null
          verified_by_trainer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "finance_status_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: true
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_status_verified_by_trainer_id_fkey"
            columns: ["verified_by_trainer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          consent_flags: Json | null
          created_at: string | null
          created_by_user_id: string | null
          deleted_at: string | null
          document_paths: string[] | null
          eligibility_date: string | null
          id: string
          photo_path: string | null
          player_birth_date: string
          player_data: Json | null
          player_dfb_id: string | null
          player_name: string
          previous_team_deregistration_date: string | null
          previous_team_last_game: string | null
          previous_team_name: string | null
          registration_reason: Database["public"]["Enums"]["registration_reason"]
          sperrfrist_end: string | null
          sperrfrist_start: string | null
          status: Database["public"]["Enums"]["registration_status"]
          submitted_at: string | null
          team_id: string
          team_name: string
          updated_at: string | null
        }
        Insert: {
          consent_flags?: Json | null
          created_at?: string | null
          created_by_user_id?: string | null
          deleted_at?: string | null
          document_paths?: string[] | null
          eligibility_date?: string | null
          id?: string
          photo_path?: string | null
          player_birth_date: string
          player_data?: Json | null
          player_dfb_id?: string | null
          player_name: string
          previous_team_deregistration_date?: string | null
          previous_team_last_game?: string | null
          previous_team_name?: string | null
          registration_reason?: Database["public"]["Enums"]["registration_reason"]
          sperrfrist_end?: string | null
          sperrfrist_start?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          submitted_at?: string | null
          team_id: string
          team_name: string
          updated_at?: string | null
        }
        Update: {
          consent_flags?: Json | null
          created_at?: string | null
          created_by_user_id?: string | null
          deleted_at?: string | null
          document_paths?: string[] | null
          eligibility_date?: string | null
          id?: string
          photo_path?: string | null
          player_birth_date?: string
          player_data?: Json | null
          player_dfb_id?: string | null
          player_name?: string
          previous_team_deregistration_date?: string | null
          previous_team_last_game?: string | null
          previous_team_name?: string | null
          registration_reason?: Database["public"]["Enums"]["registration_reason"]
          sperrfrist_end?: string | null
          sperrfrist_start?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          submitted_at?: string | null
          team_id?: string
          team_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      rpa_traces: {
        Row: {
          bot_version: string
          completed_at: string | null
          dfbnet_draft_url: string | null
          duration_ms: number | null
          error_message: string | null
          error_stacktrace: string | null
          execution_id: string
          id: string
          registration_id: string
          screenshot_actual: string | null
          screenshot_baseline: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["rpa_trace_status"]
          visual_diff_score: number | null
        }
        Insert: {
          bot_version?: string
          completed_at?: string | null
          dfbnet_draft_url?: string | null
          duration_ms?: number | null
          error_message?: string | null
          error_stacktrace?: string | null
          execution_id?: string
          id?: string
          registration_id: string
          screenshot_actual?: string | null
          screenshot_baseline?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["rpa_trace_status"]
          visual_diff_score?: number | null
        }
        Update: {
          bot_version?: string
          completed_at?: string | null
          dfbnet_draft_url?: string | null
          duration_ms?: number | null
          error_message?: string | null
          error_stacktrace?: string | null
          execution_id?: string
          id?: string
          registration_id?: string
          screenshot_actual?: string | null
          screenshot_baseline?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["rpa_trace_status"]
          visual_diff_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rpa_traces_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_health: {
        Row: {
          check_id: string | null
          checked_at: string | null
          consecutive_failures: number | null
          created_at: string | null
          details: Json | null
          last_alert_sent_at: string | null
          message: string | null
          service_name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          check_id?: string | null
          checked_at?: string | null
          consecutive_failures?: number | null
          created_at?: string | null
          details?: Json | null
          last_alert_sent_at?: string | null
          message?: string | null
          service_name: string
          status: string
          updated_at?: string | null
        }
        Update: {
          check_id?: string | null
          checked_at?: string | null
          consecutive_failures?: number | null
          created_at?: string | null
          details?: Json | null
          last_alert_sent_at?: string | null
          message?: string | null
          service_name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          created_at: string | null
          dfbnet_id: string | null
          id: string
          metadata: Json | null
          name: string
          season: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dfbnet_id?: string | null
          id?: string
          metadata?: Json | null
          name: string
          season?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dfbnet_id?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          season?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          last_login: string | null
          role: Database["public"]["Enums"]["role_type"]
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          role?: Database["public"]["Enums"]["role_type"]
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          role?: Database["public"]["Enums"]["role_type"]
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      acquire_bot_lock: {
        Args: {
          p_locked_by?: string
          p_registration_id: string
          p_timeout_minutes?: number
        }
        Returns: boolean
      }
      get_expired_records: {
        Args: { p_retention_hours?: number }
        Returns: {
          completed_at: string
          document_paths: string[]
          photo_path: string
          player_name: string
          registration_id: string
        }[]
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["role_type"]
      }
      get_user_team_id: { Args: { user_uuid: string }; Returns: string }
      mark_health_alert_sent: {
        Args: { p_service_name: string }
        Returns: undefined
      }
      release_bot_lock: {
        Args: { p_registration_id?: string }
        Returns: boolean
      }
      soft_delete_expired_registrations: {
        Args: { p_retention_hours?: number }
        Returns: number
      }
      upsert_system_health: {
        Args: {
          p_check_id?: string
          p_details?: Json
          p_message?: string
          p_service_name: string
          p_status: string
        }
        Returns: {
          consecutive_failures: number
          last_alert_sent_at: string
          should_alert: boolean
        }[]
      }
    }
    Enums: {
      payment_method: "PAYPAL" | "CASH" | "BANK_TRANSFER" | "EXEMPT"
      registration_reason:
        | "NEW_PLAYER"
        | "TRANSFER"
        | "RE_REGISTRATION"
        | "INTERNATIONAL_TRANSFER"
      registration_status:
        | "DRAFT"
        | "SUBMITTED"
        | "VALIDATION_PENDING"
        | "READY_FOR_BOT"
        | "BOT_IN_PROGRESS"
        | "COMPLETED"
        | "ERROR"
        | "MANUALLY_PROCESSED"
        | "VISUAL_REGRESSION_ERROR"
      role_type: "SUPER_ADMIN" | "PASSWART" | "TRAINER" | "ANTRAGSTELLER"
      rpa_trace_status:
        | "QUEUED"
        | "RUNNING"
        | "SUCCESS"
        | "FAILED"
        | "VISUAL_REGRESSION_ERROR"
        | "TIMEOUT"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      payment_method: ["PAYPAL", "CASH", "BANK_TRANSFER", "EXEMPT"],
      registration_reason: [
        "NEW_PLAYER",
        "TRANSFER",
        "RE_REGISTRATION",
        "INTERNATIONAL_TRANSFER",
      ],
      registration_status: [
        "DRAFT",
        "SUBMITTED",
        "VALIDATION_PENDING",
        "READY_FOR_BOT",
        "BOT_IN_PROGRESS",
        "COMPLETED",
        "ERROR",
        "MANUALLY_PROCESSED",
        "VISUAL_REGRESSION_ERROR",
      ],
      role_type: ["SUPER_ADMIN", "PASSWART", "TRAINER", "ANTRAGSTELLER"],
      rpa_trace_status: [
        "QUEUED",
        "RUNNING",
        "SUCCESS",
        "FAILED",
        "VISUAL_REGRESSION_ERROR",
        "TIMEOUT",
      ],
    },
  },
} as const
