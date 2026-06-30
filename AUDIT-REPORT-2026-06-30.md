# CFB Pass-Automation — Gesamt-Audit Report
**Stand:** 2026-06-30  
**Scope:** Pass-Automation ohne Website-Redesign  
**Methodik:** 4 parallele Reviewer-Cluster (Architecture, DB/Security, Frontend, Logic/Ops) → 24 Findings → Dedup → Verify → **Top 8**

---

## Executive Summary

Das Projekt ist substanziell weiter als der Council vermutet hatte — DFBnet-Login gelöst, 3-Phasen-Flow E2E getestet (Mitglied 2026-0034 erstellt+gelöscht). **Aber:** Der Code-Audit deckt **2 Bugs auf die in Produktion sofort schiefgehen** + 6 weitere die das System in 2-12 Monaten kippen lassen. 

**Kritischste Erkenntnis:** Es gibt **drei verschiedene "Es bricht beim ersten Live-Lauf"-Bugs**, einen davon im Auth-Layer (Middleware), einen in der Sperrfristen-Berechnung (Timezone), einen in der Selektor-Strategie (alle als PLACEHOLDER markiert obwohl Memory anderes sagt — Verifikation nötig).

---

## Top 8 Findings — Priorisiert nach Risiko

### 🔴 #1 — Middleware Auth-Bypass via `startsWith`
**File:** `apps/frontend/middleware.ts` Z. 38-54  
**Severity:** KRITISCH (Auth-Bypass, Datenleck)  
**Category:** AUTH

`publicPaths.some(p => path.startsWith(p))` mit Public-Path `"/register"` matched auch `"/registrations"` → **`/registrations` ist als public klassifiziert und jeder anonyme Besucher kann Mitgliederdaten sehen**. Zusätzlich: `path.startsWith("/(protected)")` matched nie, weil Route-Groups in der URL nicht erscheinen. Default-Deny fehlt.

**Failure-Szenario:** Unautorisierter Aufruf von `https://app/registrations` → Middleware lässt durch (matched `/register`) → Server Action liefert Daten aller Registrierungen die RLS für `anon` zulässt → Datenleck Minderjährigen-Daten.

**Fix:**
```ts
const PUBLIC_PATHS = new Set(["/", "/register", "/sign-in", "/sign-up"]);
const isPublic = PUBLIC_PATHS.has(pathname)
  || pathname.startsWith("/status/")
  || pathname.startsWith("/auth/");
if (!isPublic && !user) return NextResponse.redirect(new URL("/sign-in", request.url));
```

---

### 🔴 #2 — Junior-Calculator: Hinrunden-Bug verfälscht Sperrfrist
**File:** `packages/shared-logic/src/eligibility/junior-calculator.ts` Z. 77  
**Severity:** KRITISCH (Compliance, falscher Pass)  
**Category:** COMPLIANCE

`getMonth() >= 6 && <= 11` (Juli-Dez) wird auf `referenceDate` (Anmeldetag) angewandt — sollte aber auf das **letzte Spiel / Abmeldedatum** schauen. Ein U11-Wechsel mit letztem Spiel 25.05.2025 + Anmeldung 02.07.2025 fällt fälschlich in "Hinrunden-Ausnahme" und wird sofort spielberechtigt, obwohl §20 JSpO 1 Monat Sperrfrist verlangt.

**Failure-Szenario:** Falscher Pass → Spielereinsatz → DFB-Strafe für Verein.

**Fix:**
```ts
const triggerDate = dates.length 
  ? new Date(Math.max(...dates.map(d => d.getTime()))) 
  : referenceDate;
const isFirstHalfSeason = triggerDate.getMonth() >= 6 && triggerDate.getMonth() <= 11;
```
Plus: Regel mit Verbandsjurist gegen §20 JSpO Wortlaut prüfen.

---

### 🔴 #3 — Timezone-Bug: Senior/Junior-Klassifikation am 18. Geburtstag falsch
**File:** `packages/shared-logic/src/eligibility/senior-calculator.ts` Z. 144-158 + `junior-calculator.ts` Z. 224-238  
**Severity:** KRITISCH (Compliance, Routing-Fehler)  
**Category:** LOGIC-BUG

`isSenior`/`isJunior` nutzen `new Date(birthDate)` (UTC-Parsing) während andere Calls `parseDate()` (lokal) verwenden. In DE (UTC+1/+2) wird `"2008-03-04"` als UTC 00:00 → lokal Vortag → `dayDiff` falsch. Universal-Router routet 18-jährige Junioren falsch → falsche Sperrfrist (6 statt 3 Monate oder umgekehrt).

**Failure-Szenario:** Spieler `birthDate=2008-03-04`, Anmeldung am Geburtstag → wird falsch als Senior klassifiziert obwohl noch Junior, oder umgekehrt → §16/§20 SpO falsch angewandt.

**Fix:**
```ts
export function isSenior(birthDate: string, referenceDate?: string): boolean {
  const birth = parseDate(birthDate);  // lokale Zeit, konsistent mit Rest
  const reference = referenceDate ? parseDate(referenceDate) : new Date();
  // ...
}
```

---

### 🔴 #4 — Wizard Submit-Pfad ist `console.log` + `Date.now()`-ID
**File:** `apps/frontend/app/(registration)/register/page.tsx` Z. 26-37  
**Severity:** KRITISCH (kein Persist, Duplikate, kein Idempotency)  
**Category:** FORMS

`onComplete()` macht nur `console.log` + erzeugt `id` via `Date.now()`. **Keine Server Action, keine Zod-Validation, keine Disable-While-Pending.** Magic Link verweist auf nicht-existenten DB-Record. Double-Submit erzeugt Duplikate. `formData: Record<string, any>` umgeht jede Type-Sicherheit.

**Failure-Szenario:** Eltern füllen 8 Schritte aus, sehen "Erfolg", erhalten Magic Link der ins Nichts führt. Oder doppelter Submit erzeugt 2 Registrierungen mit identischer ID.

**Fix:** Echte Server Action `submitRegistration(data)` mit `zod.parse(fullSchema)`, `crypto.randomUUID()` server-seitig, `useTransition()` + `disabled={isPending}`.

---

### 🔴 #5 — Storage-Buckets erlauben Cross-Tenant Upload + fehlende SELECT-Policy
**File:** `supabase/migrations/000001_initial_schema.sql` Z. 365-384  
**Severity:** KRITISCH (Datenleck Minderjährigen-Fotos, DoS)  
**Category:** RLS-SECURITY

`player-photos` und `player-documents` haben INSERT-Policy ohne Owner-Prefix oder Größenlimit, KEINE SELECT-Policy für ANTRAGSTELLER. Jeder authenticated User kann beliebig große Files hochladen (DoS, illegaler Content unter Vereins-Bucket), und Path-Schema ohne User-Prefix erlaubt Path-Guessing.

**Failure-Szenario:** Authenticated User A lädt 10GB Garbage in `player-photos` → Speicher-Bill explodiert. Oder lädt illegalen Content hoch → strafrechtliche Verantwortung des Vereins.

**Fix:**
```sql
DROP POLICY "authenticated_upload_photos" ON storage.objects;
CREATE POLICY "antragsteller_upload_own_photo"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'player-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
-- Plus: Bucket-Konfiguration in Supabase Dashboard: file_size_limit = 5242880
```

---

### 🔴 #6 — Migration 4 droppt INSERT/UPDATE-Policies ohne Ersatz → App bricht
**File:** `supabase/migrations/000004_cleanup_old_policies.sql` Z. 13-14  
**Severity:** KRITISCH (App-Breakage bei Deployment)  
**Category:** MIGRATION

Migration 4 droppt `antragsteller_modify_own` (FOR ALL) — Migration 3 hat aber nur SELECT-Policies definiert. Folge nach `db push`: **Antragsteller können nicht mehr registrieren** (`42501 RLS violation`). Gleiches für `passwart_update_all` → kein Status-Update mehr durch PASSWART.

**Failure-Szenario:** Deployment führt Migrations 1-6 aus. Direkt nach Migration 4 ist die App tot. Auf Vercel-Production unbemerkt bis erster User registriert.

**Fix:** Migration 4 in `BEGIN/COMMIT`-Block, vor Drop neue Policies anlegen:
```sql
BEGIN;
CREATE POLICY "antragsteller_insert_own" ON registrations FOR INSERT TO authenticated
  WITH CHECK (created_by_user_id = (select auth.uid()));
CREATE POLICY "antragsteller_update_draft" ON registrations FOR UPDATE TO authenticated
  USING (created_by_user_id = (select auth.uid()) AND status IN ('DRAFT','SUBMITTED'));
CREATE POLICY "passwart_update_all" ON registrations FOR UPDATE TO authenticated
  USING ((select get_user_role((select auth.uid()))) IN ('PASSWART','SUPER_ADMIN'));
DROP POLICY "antragsteller_modify_own" ON registrations;
COMMIT;
```

---

### 🟠 #7 — RPA-Selektoren als `[PLACEHOLDER]` markiert (Memory sagt: verifiziert — Widerspruch klären!)
**File:** `apps/rpa-bot/src/config/selectors.ts` Z. 16-115  
**Severity:** HOCH (Operationsausfall) / **Memory-Widerspruch klären**  
**Category:** SELEKTOR

Reviewer fand alle ~25 Selektoren als `[PLACEHOLDER]` markiert + Vermutungen über "typische deutsche Behörden-Web-Anwendungen". **ABER:** Memory `cfb-projekt.md` Z. 268-269 sagt: "E2E Test BESTANDEN (2026-03-19): 8/8 Schritte PASS, 41 Sekunden, Mitglied 2026-0034 erstellt".

**Was passiert sein muss:** Entweder die Selektoren wurden verifiziert aber Datei nicht aktualisiert, oder die Verifikation lief gegen andere File-Version. **Klärungsbedarf vor weiteren Live-Runs.**

**Fix:** 1 Stunde mit `BOT_HEADLESS=false` + DevTools: alle 25 Selektoren prüfen, PLACEHOLDER-Kommentare entfernen, robustere Locator (`page.getByLabel('Geburtsdatum')` + `page.getByRole('button', {name: /entwurf/i})`) als Primary, ID-Selektoren als Fallback.

---

### 🟠 #8 — Login-Flow leakt IMAP-Verbindungen (unreachable `client.logout()`)
**File:** `apps/rpa-bot/src/flows/login.ts` Z. 273-281  
**Severity:** HOCH (silent failure nach 10-100 Logins)  
**Category:** CODE-SMELL / RESOURCE-LEAK

`client.logout()` steht **nach** `return` im try-Block plus `finally { lock.release() }` — der Code ist unreachable. Bei jedem 2FA-Login wird die IMAP-Verbindung nicht geschlossen. Provider-Connection-Limit (Resend, Gmail) erreicht nach 10-100 Login-Versuchen → "Too many connections" → Bot bleibt im Retry-Loop hängen, keine Spielerpässe mehr.

**Failure-Szenario:** Heartbeat-Workflow läuft alle 4h → 6 Logins/Tag → nach ~17 Tagen IMAP-Pool erschöpft → silent failure.

**Fix:**
```ts
let client;
try {
  client = await connectImap();
  try {
    const lock = await client.getMailboxLock("INBOX");
    try {
      // OTP-Suche
      return otp;
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();  // jetzt erreichbar
  }
} catch (err) { ... }
```

---

## 5 Weitere wichtige Findings (knapp unter Top-8)

| # | File | Issue | Severity |
|---|---|---|---|
| 9 | `actions.ts` (registrations/[id]) | Post-Fetch RLS-Check lädt fremde Daten in Memory bevor sie gefiltert werden | HOCH |
| 10 | Migration 6 | 5 `SECURITY DEFINER` Funktionen ohne `SET search_path = public, pg_temp` → Privilege-Escalation-Vektor | HOCH |
| 11 | Migration 1 | `auth.uid()` direkt statt `(select auth.uid())` → keine Subquery-Caching, RLS-Performance schlecht ab 200 Rows | HOCH |
| 12 | Migration 1 | `audit_logs.registration_id ON DELETE CASCADE` → DSGVO-Auskunftspflicht nicht erfüllbar nach Purge | HOCH |
| 13 | `validators/index.ts` Z.127 | `validateBirthDate` Timezone-Bug + `age = today.getFullYear() - birth.getFullYear()` ignoriert Monat/Tag | HOCH |

---

## Patterns über alle Cluster

### Pattern 1: **Timezone-Inkonsistenz**
Drei verschiedene Date-Parser im selben Codebase (`parseDate` local, `new Date(string)` UTC, `Date.now()`). Saisonübergreifend zwischen Sommer- und Winterzeit produziert das Off-by-One-Bugs an Geburtstagen und Sperrfristen-Stichtagen.

**Empfohlene Maßnahme:** Eine kanonische `date-utils.ts` mit `parseDate`, `formatDate`, `addMonths`, `isSameDay` als single source of truth. Alle anderen Date-Konstruktionen entfernen.

### Pattern 2: **Zod fehlt an Boundaries**
- Calculator-API ohne Zod (Cluster 4 #6)
- Wizard `formData: Record<string, any>` (Cluster 3 #5)
- `RoleType` als `any` in `role-gate.tsx` (Cluster 3 #3)

**Empfohlene Maßnahme:** Zod als Runtime-Dep installieren. Jede Server Action, jede Sub-Komponenten-Boundary, jede External Input-API mit `z.parse`.

### Pattern 3: **Defense-in-Depth fehlt**
Die App vertraut auf RLS — was richtig ist — aber wenn RLS jemals bricht (Service-Key-Leak, Migration-Fehler), gibt es keinen zweiten Wall. App-Level-Checks NACH Fetch (Cluster 2 #2) sind kein Ersatz.

**Empfohlene Maßnahme:** WHERE-Clause auf `team_id`/`created_by_user_id` zusätzlich zu RLS in jeder Server Action.

### Pattern 4: **Über-Engineering im Bot, Unter-Engineering im Frontend**
Bot hat Visual-Regression mit Pixelmatch (Overkill), IMAP-2FA (komplex), Singleton-Lock per DB (gut). Frontend hat keinen funktionierenden Submit (Cluster 3 #2), keine Zod-Validation, broken Middleware.

**Empfohlene Maßnahme:** Bot vereinfachen (Visual-Regression auf Smoke reduzieren), Frontend härten (echter Submit + Zod + Type-safe Wizard).

---

## Reihenfolge der Fixes

| Reihenfolge | Was | Warum |
|---|---|---|
| 1 | #6 Migration 4 Fix | Sonst kann **niemand** registrieren nach Deploy |
| 2 | #1 Middleware startsWith | Datenleck — sofort fixen |
| 3 | #5 Storage-Bucket-RLS | Datenleck Minderjährige + DoS-Risiko |
| 4 | #4 Wizard Submit | Wizard ist sonst nur Show |
| 5 | #2 + #3 + #13 Timezone/Hinrunden | Compliance-Bugs — Audit-Trail einrichten bevor first real cases |
| 6 | #7 Selektor-Verifikation | Klären, sonst Live-Run-Risiko |
| 7 | #8 IMAP-Leak | Slow burn, aber unausweichlich |
| 8 | Rest (Patterns) | Sprint danach |

---

## Empfohlener Skill-Stack für die Fixes

| Phase | Skill | Wofür |
|---|---|---|
| Diagnose (done) | `/llm-council` + `/refactoring-specialist` + `/db-architect-vdata` | ✅ |
| Plan | `/writing-plans` | Fix-Sprint formal aufschreiben |
| Migration-Fix | `/db-architect-vdata` + `/using-git-worktrees` | Migration 7+8 schreiben, isoliert testen |
| Frontend-Fix | `/refactoring-specialist` + `/ui-designer-vux` | Wizard Submit + Middleware |
| Logic-Fix | `/test-engineer-vitest` + `/systematic-debugging` | Timezone + Hinrunden mit Tests |
| Bot-Verifikation | `/playwright-cli` + `/webapp-testing` | Selektoren live prüfen |
| Verification | `/verification-before-completion` | Vor Merge |
| Ship | `/finishing-a-development-branch` | Squash + PR |

---

*Methodik: 4 parallele Reviewer mit unterschiedlichen Skill-Triggern (Refactor/Debug, DB/Security, Frontend/UX, Logic/Tests). 24 Findings → Dedup → Top-8 priorisiert. CONFIRMED via Stichproben-Read der Middleware.ts.*
