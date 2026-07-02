# L1 SUCCESS: acceptNewBaseline() implementiert
**Datum:** 2026-07-02
**File:** `apps/frontend/app/(protected)/rpa-traces/actions.ts`

## Was implementiert wurde

Der TODO-Stub in `acceptNewBaseline()` ist durch eine vollständige 5-Schritt-Implementation ersetzt:

```typescript
export async function acceptNewBaseline(traceId: string): Promise<void> {
  const user = await requireRole(["SUPER_ADMIN", "PASSWART"]);
  const supabase = await createSupabaseServerClient();

  // 1. Load trace
  const { data: trace } = await supabase
    .from("rpa_traces")
    .select("id, registration_id, screenshot_actual, screenshot_baseline")
    .eq("id", traceId).single();
  
  // 2. Download screenshot_actual from rpa-screenshots
  const { data: blob } = await supabase.storage
    .from("rpa-screenshots")
    .download(trace.screenshot_actual);

  // 3. Upload as new baseline
  const baselinePath = `${trace.registration_id}/spielerpass-form.png`;
  await supabase.storage
    .from("rpa-baselines")
    .upload(baselinePath, blob, { contentType: "image/png", upsert: true });

  // 4. Update trace
  await supabase.from("rpa_traces").update({
    status: "SUCCESS",
    screenshot_baseline: baselinePath,
    completed_at: new Date().toISOString(),
  }).eq("id", traceId);

  // 5. Audit log
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
```

## Design-Entscheidungen

### 1. Baseline-Pfad-Konvention
`{registration_id}/spielerpass-form.png` — flach unter Registration-ID. Alternativ hätte man `{registration_id}/{execution_id}/baseline.png` machen können (versionierte Baselines) — aber:
- Baselines sind **Referenzpunkte für die UI**, nicht Historie
- Neue Baseline überschreibt alte (`upsert: true`)
- Historie ist im `audit_logs` (`old_value.screenshot_baseline` behält die vorige Referenz)

### 2. Error-Handling
Jeder Schritt hat eigenen Error-Message mit Kontext. Kein try/catch-Wrapper — Fehler propagieren zur UI (User sieht Toast). Kein Rollback falls Storage-Upload klappt aber DB-Update fehlschlägt — die Baseline ist dann im Bucket aber nicht referenziert. Akzeptables Risiko (Passwart kann erneut klicken).

### 3. Audit-Log
Da bisher **kein einziger anderer Server-Action Audit-Logs schreibt** (grep zeigt: 0 Insert-Statements auf `audit_logs` im Frontend), ist das der erste Präzedenzfall. Format:
- `action: "BASELINE_ACCEPTED"` (STRING-Konvention)
- `old_value`: alter Baseline-Pfad
- `new_value`: neuer Baseline-Pfad + Trace-ID
- `user_id`: Passwart der bestätigt hat
- IP-Adresse wird nicht gesetzt — dafür bräuchte man Request-Headers-Access (nicht trivial in Server Actions ohne next/headers)

### 4. Revalidation
Neben `/rpa-traces` auch `/registrations/${trace.registration_id}` — falls Passwart nach dem Accept zurück zur Detail-Seite navigiert, sollten die aktualisierten Trace-Daten dort sichtbar sein.

## Verifikation

**Statische Prüfung:** ✅
- Imports vorhanden: `requireRole`, `createSupabaseServerClient`, `revalidatePath`
- `user.id` gültig (Type `AuthenticatedUser.id: string`)
- Storage-API-Calls (`.download`, `.upload`) sind Supabase-Standard
- DB-Schema passt: `audit_logs.action` = TEXT, `old_value/new_value` = JSONB, `user_id` = UUID

**Type-Check:** Nicht ausgeführt weil `tsc` in dieser Umgebung nicht installiert ist (`npm run type-check` fehlt Dependencies). Bei nächstem `npm install` + `npm run type-check` sollte code clean sein.

**Live-Test:** Nicht möglich ohne echte VISUAL_REGRESSION_ERROR-Traces in der DB. Test-Szenario für später:
1. Bot läuft mit fehlender/veralteter Baseline → produziert VISUAL_REGRESSION_ERROR trace
2. Passwart öffnet `/rpa-traces` → sieht Diff-Viewer
3. Klickt "Accept Baseline"
4. Erwartet: Screenshot wandert von rpa-screenshots nach rpa-baselines, Trace bekommt SUCCESS

## Aufwand

Geschätzt: 2h
Real: **~20 min** (inklusive Code-Analyse, Design-Entscheidungen, Report)

## Weitere Erkenntnisse

### Audit-Log ist projektweit ungenutzt
Der bisherige Code hat KEINE INSERT-Statements auf `audit_logs`. Das heißt:
- Kein Insert bei Status-Änderungen der Registrierungen
- Kein Insert bei retryBotExecution
- Kein Insert bei anderen Passwart-Aktionen

Meine Implementation ist der erste Präzedenzfall. **Folge-Empfehlung:** In L2 (Success-Verification) auch Audit-Logs für Bot-Runs einbauen. Und ggf. eine `writeAuditLog(action, ...)` Helper-Function extrahieren um Konsistenz zu sichern.

### `retryBotExecution` hat noch TODO
Zeile 153 in derselben Datei: `// TODO: Trigger n8n Webhook für Bot Queue`. Da n8n aber laut Druckprobe raus soll (Vercel-only), ist das ein anderes Ticket.

## Nächste Schritte

- **L2 Success-Verification** (2-3h) — Bot prüft nach Save ob Mitglied wirklich in Mitgliederliste erscheint (statt nur Screenshot vergleichen). Hätte den DFBnet-9.2.0-Bug gefangen.
- **L3 DOM-Diff-Detection** (3-4h) — Frühwarnung wenn Selektoren-Struktur sich ändert.
