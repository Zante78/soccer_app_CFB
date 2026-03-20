"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { RPA_ADMIN_ROLES } from "@/lib/auth-types";
import { getSignedUrl } from "@/lib/supabase/storage";
import { revalidatePath } from "next/cache";

export type RPATraceWithUrls = {
  id: string;
  registration_id: string;
  execution_id: string;
  status: string;
  started_at: string | null;
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
  await requireRole(RPA_ADMIN_ROLES);

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
    .is("registrations.deleted_at", null)
    .order("started_at", { ascending: false });

  if (error) {
    console.error("Error fetching RPA traces:", error);
    throw new Error("Fehler beim Laden der RPA-Traces");
  }

  // Generate Signed URLs für Screenshots — batch all calls
  const traces = data || [];
  const urlPromises = traces.flatMap((trace) => [
    trace.screenshot_baseline
      ? getSignedUrl("rpa-baselines", trace.screenshot_baseline)
      : Promise.resolve(null),
    trace.screenshot_actual
      ? getSignedUrl("rpa-screenshots", trace.screenshot_actual)
      : Promise.resolve(null),
  ]);
  const urls = await Promise.all(urlPromises);

  const tracesWithUrls = traces.map((trace, i) => {
    const reg = trace.registrations;

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
      baselineUrl: urls[i * 2],
      actualUrl: urls[i * 2 + 1],
      registration: {
        player_name: reg.player_name,
        player_dfb_id: reg.player_dfb_id,
        status: reg.status,
        team: reg.teams ? { name: reg.teams.name } : null,
      },
    };
  });

  return tracesWithUrls;
}

const traceIdSchema = z.string().uuid();
const registrationIdSchema = z.string().uuid();

/**
 * Akzeptiert neuen Screenshot als Baseline
 */
export async function acceptNewBaseline(traceId: string): Promise<void> {
  const parsed = traceIdSchema.safeParse(traceId);
  if (!parsed.success) throw new Error("Ungültige Trace-ID");
  const validId = parsed.data;
  await requireRole(RPA_ADMIN_ROLES);

  const supabase = await createSupabaseServerClient();

  // 1. Fetch trace to get screenshot paths
  const { data: trace, error: fetchError } = await supabase
    .from("rpa_traces")
    .select("screenshot_actual, screenshot_baseline, registration_id")
    .eq("id", validId)
    .single();

  if (fetchError || !trace) {
    throw new Error("Trace nicht gefunden");
  }

  if (!trace.screenshot_actual) {
    throw new Error("Kein aktueller Screenshot vorhanden");
  }

  // 2. Download actual screenshot
  const { data: fileData, error: downloadError } = await supabase.storage
    .from("rpa-screenshots")
    .download(trace.screenshot_actual);

  if (downloadError || !fileData) {
    throw new Error("Screenshot konnte nicht heruntergeladen werden");
  }

  // 3. Upload as new baseline (overwrite existing or create new)
  const baselinePath = trace.screenshot_baseline || `baseline-${trace.registration_id}-${Date.now()}.png`;
  const { error: uploadError } = await supabase.storage
    .from("rpa-baselines")
    .upload(baselinePath, fileData, {
      contentType: "image/png",
      upsert: true,
    });

  if (uploadError) {
    throw new Error("Baseline konnte nicht aktualisiert werden");
  }

  // 4. Update trace: set status to SUCCESS and update baseline path
  const { error } = await supabase
    .from("rpa_traces")
    .update({
      status: "SUCCESS",
      screenshot_baseline: baselinePath,
    })
    .eq("id", validId);

  if (error) {
    throw new Error("Fehler beim Aktualisieren des Trace-Status");
  }

  revalidatePath("/rpa-traces");
}

/**
 * Startet Bot erneut für eine Registration
 */
export async function retryBotExecution(registrationId: string): Promise<void> {
  const parsed = registrationIdSchema.safeParse(registrationId);
  if (!parsed.success) throw new Error("Ungültige Registrierungs-ID");
  const validId = parsed.data;
  await requireRole(RPA_ADMIN_ROLES);

  const supabase = await createSupabaseServerClient();

  // Update Registration Status zu READY_FOR_BOT
  const { error } = await supabase
    .from("registrations")
    .update({ status: "READY_FOR_BOT" })
    .eq("id", validId)
    .is("deleted_at", null);

  if (error) {
    console.error("Error retrying bot execution:", error);
    throw new Error("Fehler beim Neustarten der Bot-Ausführung");
  }

  revalidatePath("/rpa-traces");
  revalidatePath("/registrations");
}
