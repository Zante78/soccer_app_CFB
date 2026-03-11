import { createClient, SupabaseClient as SupabaseClientType } from "@supabase/supabase-js";
import { z } from "zod";
import { logger } from "../utils/logger.js";

/**
 * Supabase Client für RPA Bot
 * Verwendet Service Role Key für Admin-Zugriff (bypasses RLS)
 */
export class SupabaseClient {
  private client: SupabaseClientType;

  constructor(url: string, serviceRoleKey: string) {
    this.client = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    logger.info("✅ Supabase Client initialized");
  }

  /**
   * Holt alle Registrierungen mit Status READY_FOR_BOT
   */
  async getPendingRegistrations() {
    const teamSchema = z.object({
      id: z.string(),
      name: z.string(),
      dfbnet_id: z.string().nullable(),
    });

    const { data, error } = await this.client
      .from("registrations")
      .select(
        `
        id,
        player_name,
        player_birth_date,
        player_dfb_id,
        status,
        registration_reason,
        player_data,
        team_id,
        teams!inner(id, name, dfbnet_id)
      `
      )
      .eq("status", "READY_FOR_BOT")
      .order("created_at", { ascending: true })
      .limit(10); // Max 10 pro Batch

    if (error) {
      logger.error("Error fetching pending registrations:", error);
      throw new Error(error.message);
    }

    return data.map((reg) => {
      const teamsRaw = Array.isArray(reg.teams) ? reg.teams[0] : reg.teams;
      const team = teamSchema.parse(teamsRaw);
      return {
        id: reg.id,
        player_name: reg.player_name,
        player_birth_date: reg.player_birth_date,
        player_dfb_id: reg.player_dfb_id,
        status: reg.status,
        registration_reason: reg.registration_reason,
        player_data: reg.player_data,
        team_id: reg.team_id,
        team: {
          id: team.id,
          name: team.name,
          dfbnet_id: team.dfbnet_id,
        },
      };
    });
  }

  /**
   * Erstellt einen neuen RPA Trace Eintrag
   */
  async createRPATrace(data: {
    registration_id: string;
    execution_id: string;
    status: string;
    started_at: string;
  }) {
    const { error } = await this.client.from("rpa_traces").insert(data);

    if (error) {
      logger.error("Error creating RPA trace:", error);
      throw new Error(error.message);
    }
  }

  /**
   * Updated RPA Trace Status
   */
  async updateRPATrace(
    traceId: string,
    data: {
      status: string;
      completed_at?: string;
      error_message?: string;
      visual_diff_score?: number;
      screenshot_baseline?: string;
      screenshot_actual?: string;
    }
  ) {
    const { error } = await this.client
      .from("rpa_traces")
      .update(data)
      .eq("id", traceId);

    if (error) {
      logger.error("Error updating RPA trace:", error);
      throw new Error(error.message);
    }
  }

  /**
   * Updated Registration Status
   */
  async updateRegistrationStatus(
    registrationId: string,
    status: string
  ) {
    const { error } = await this.client
      .from("registrations")
      .update({ status })
      .eq("id", registrationId);

    if (error) {
      logger.error("Error updating registration status:", error);
      throw new Error(error.message);
    }
  }

  /**
   * Upload Screenshot to Supabase Storage
   */
  async uploadScreenshot(
    bucket: string,
    path: string,
    file: Buffer
  ): Promise<string> {
    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(path, file, {
        contentType: "image/png",
        upsert: true,
      });

    if (error) {
      logger.error(`Error uploading to ${bucket}/${path}:`, error);
      throw new Error(error.message);
    }

    return data.path;
  }
}
