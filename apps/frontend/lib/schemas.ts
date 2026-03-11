import { z } from "zod";

/**
 * Zod schemas for JSONB fields in the database.
 * These validate the structure of player_data and consent_flags
 * at runtime, replacing unsafe `as Record<string, unknown>` casts.
 */

export const PlayerDataSchema = z
  .object({
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    previous_club_name: z.string().optional(),
    previous_club_id: z.string().optional(),
    deregistration_date: z.string().optional(),
    last_game_date: z.string().optional(),
    previous_team_deregistration_date: z.string().optional(),
    previous_team_last_game: z.string().optional(),
  })
  .passthrough(); // Allow additional fields from DB

export type PlayerData = z.infer<typeof PlayerDataSchema>;

export const ConsentFlagsSchema = z
  .object({
    dsgvo_consent: z.boolean().optional(),
    eligibility_declaration: z.boolean().optional(),
    accuracy_confirmed: z.boolean().optional(),
    signature_data: z.string().optional(),
    signature_timestamp: z.string().optional(),
  })
  .passthrough();

export type ConsentFlags = z.infer<typeof ConsentFlagsSchema>;
