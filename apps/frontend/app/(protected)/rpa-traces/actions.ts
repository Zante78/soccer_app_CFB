"use server";

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
          player_name: (trace.registrations as any).player_name,
          player_dfb_id: (trace.registrations as any).player_dfb_id,
          status: (trace.registrations as any).status,
          team: (trace.registrations as any).teams
            ? { name: (trace.registrations as any).teams.name }
            : null,
        },
      };
    })
  );

  return tracesWithUrls;
}

/**
 * Akzeptiert neuen Screenshot als Baseline.
 *
 * Ablauf:
 * 1. Lade Trace + aktuelle screenshot_actual + registration_id
 * 2. Download screenshot_actual aus rpa-screenshots Bucket
 * 3. Upload als neue Baseline in rpa-baselines Bucket (Pfad: {registration_id}/spielerpass-form.png)
 * 4. Update trace: status=SUCCESS + screenshot_baseline=neuer Pfad
 * 5. Schreibe audit_log
 *
 * Wird vom Passwart im Visual-Diff-Viewer aufgerufen wenn UI-Änderung legitim ist.
 */
export async function acceptNewBaseline(traceId: string): Promise<void> {
  const user = await requireRole(["SUPER_ADMIN", "PASSWART"]);
  const supabase = await createSupabaseServerClient();

  // 1. Load trace with screenshot_actual + registration_id
  const { data: trace, error: fetchErr } = await supabase
    .from("rpa_traces")
    .select("id, registration_id, screenshot_actual, screenshot_baseline")
    .eq("id", traceId)
    .single();

  if (fetchErr || !trace) {
    throw new Error(`Trace ${traceId} nicht gefunden: ${fetchErr?.message ?? "unbekannt"}`);
  }

  if (!trace.screenshot_actual) {
    throw new Error(`Trace ${traceId} hat keinen screenshot_actual — nichts zu übernehmen`);
  }

  // 2. Download actual screenshot from rpa-screenshots
  const { data: screenshotBlob, error: downloadErr } = await supabase.storage
    .from("rpa-screenshots")
    .download(trace.screenshot_actual);

  if (downloadErr || !screenshotBlob) {
    throw new Error(`Screenshot-Download fehlgeschlagen: ${downloadErr?.message ?? "kein Blob"}`);
  }

  // 3. Upload as new baseline
  // Convention: baselines liegen unter {registration_id}/spielerpass-form.png
  const baselinePath = `${trace.registration_id}/spielerpass-form.png`;
  const { error: uploadErr } = await supabase.storage
    .from("rpa-baselines")
    .upload(baselinePath, screenshotBlob, {
      contentType: "image/png",
      upsert: true, // Alte Baseline überschreiben
    });

  if (uploadErr) {
    throw new Error(`Baseline-Upload fehlgeschlagen: ${uploadErr.message}`);
  }

  // 4. Update trace: status + neuer baseline-Pfad
  const { error: updateErr } = await supabase
    .from("rpa_traces")
    .update({
      status: "SUCCESS",
      screenshot_baseline: baselinePath,
      completed_at: new Date().toISOString(),
    })
    .eq("id", traceId);

  if (updateErr) {
    throw new Error(`Trace-Update fehlgeschlagen: ${updateErr.message}`);
  }

  // 5. Audit log — wer hat wann welche Baseline akzeptiert
  await supabase.from("audit_logs").insert({
    registration_id: trace.registration_id,
    action: "BASELINE_ACCEPTED",
    old_value: { screenshot_baseline: trace.screenshot_baseline },
    new_value: { screenshot_baseline: baselinePath, trace_id: traceId },
    user_id: user.id,
  });

  revalidatePath("/rpa-traces");
  revalidatePath(`/registrations/${trace.registration_id}`);
}

/**
 * Startet Bot erneut für eine Registration
 */
export async function retryBotExecution(registrationId: string): Promise<void> {
  await requireRole(["SUPER_ADMIN", "PASSWART"]);

  const supabase = await createSupabaseServerClient();

  // Update Registration Status zu READY_FOR_BOT
  const { error } = await supabase
    .from("registrations")
    .update({ status: "READY_FOR_BOT" })
    .eq("id", registrationId);

  if (error) {
    throw new Error(error.message);
  }

  // TODO: Trigger n8n Webhook für Bot Queue

  revalidatePath("/rpa-traces");
  revalidatePath("/registrations");
}
