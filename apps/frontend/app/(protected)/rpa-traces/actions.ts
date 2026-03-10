"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { getSignedUrl } from "@/lib/supabase/storage";
import { revalidatePath } from "next/cache";

export type RPATraceWithUrls = {
  id: string;
  registration_id: string;
  execution_id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
  visual_diff_score: number | null;
  screenshot_baseline: string | null;
  screenshot_actual: string | null;
  baselineUrl: string | null;
  actualUrl: string | null;
  registration: {
    player_name: string;
    player_dfb_id: string | null;
    status: string;
    team: {
      name: string;
    } | null;
  };
};

/**
 * Lädt alle RPA Traces mit Visual Regression Errors
 */
export async function getRPATraces(): Promise<RPATraceWithUrls[]> {
  await requireRole(["SUPER_ADMIN", "PASSWART"]);

  const supabase = await createSupabaseServerClient();

  // Fetch RPA Traces mit Visual Regression Errors
  const { data, error } = await supabase
    .from("rpa_traces")
    .select(
      `
      id,
      registration_id,
      execution_id,
      status,
      started_at,
      completed_at,
      error_message,
      visual_diff_score,
      screenshot_baseline,
      screenshot_actual,
      registrations!inner(
        player_name,
        player_dfb_id,
        status,
        teams(name)
      )
    `
    )
    .eq("status", "VISUAL_REGRESSION_ERROR")
    .order("started_at", { ascending: false });

  if (error) {
    console.error("Error fetching RPA traces:", error);
    throw new Error(error.message);
  }

  // Generate Signed URLs für Screenshots
  const tracesWithUrls = await Promise.all(
    (data || []).map(async (trace) => {
      const baselineUrl = trace.screenshot_baseline
        ? await getSignedUrl("rpa-baselines", trace.screenshot_baseline)
        : null;

      const actualUrl = trace.screenshot_actual
        ? await getSignedUrl("rpa-screenshots", trace.screenshot_actual)
        : null;

      const reg = trace.registrations as unknown as {
        player_name: string;
        player_dfb_id: string | null;
        status: string;
        teams: { name: string } | null;
      };

      return {
        id: trace.id,
        registration_id: trace.registration_id,
        execution_id: trace.execution_id,
        status: trace.status,
        started_at: trace.started_at,
        completed_at: trace.completed_at,
        error_message: trace.error_message,
        visual_diff_score: trace.visual_diff_score,
        screenshot_baseline: trace.screenshot_baseline,
        screenshot_actual: trace.screenshot_actual,
        baselineUrl,
        actualUrl,
        registration: {
          player_name: reg.player_name,
          player_dfb_id: reg.player_dfb_id,
          status: reg.status,
          team: reg.teams ? { name: reg.teams.name } : null,
        },
      };
    })
  );

  return tracesWithUrls;
}

const traceIdSchema = z.string().uuid();
const registrationIdSchema = z.string().uuid();

/**
 * Akzeptiert neuen Screenshot als Baseline
 */
export async function acceptNewBaseline(traceId: string): Promise<void> {
  const validId = traceIdSchema.parse(traceId);
  await requireRole(["SUPER_ADMIN", "PASSWART"]);

  const supabase = await createSupabaseServerClient();

  // TODO: Implement - Copy screenshot_actual to rpa-baselines bucket
  // TODO: Update trace status to SUCCESS
  // For now, just log
  console.log("Accept new baseline for trace:", traceId);

  // Update status
  const { error } = await supabase
    .from("rpa_traces")
    .update({ status: "SUCCESS" })
    .eq("id", validId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/rpa-traces");
}

/**
 * Startet Bot erneut für eine Registration
 */
export async function retryBotExecution(registrationId: string): Promise<void> {
  const validId = registrationIdSchema.parse(registrationId);
  await requireRole(["SUPER_ADMIN", "PASSWART"]);

  const supabase = await createSupabaseServerClient();

  // Update Registration Status zu READY_FOR_BOT
  const { error } = await supabase
    .from("registrations")
    .update({ status: "READY_FOR_BOT" })
    .eq("id", validId);

  if (error) {
    throw new Error(error.message);
  }

  // TODO: Trigger n8n Webhook für Bot Queue

  revalidatePath("/rpa-traces");
  revalidatePath("/registrations");
}
