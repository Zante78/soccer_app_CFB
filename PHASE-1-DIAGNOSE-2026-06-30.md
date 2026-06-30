# CFB Pass-Automation — Phase 1 Diagnose-Synthese
**Datum:** 2026-06-30
**Skills:** `/refactoring-specialist` + `/site-architecture` + `/db-architect-vdata`
**Status:** ✅ Diagnose abgeschlossen — Plan kann geschrieben werden

---

## Executive Summary — Drei zentrale Diagnosen

### 1. Code-Komplexität (refactoring-specialist)
**254 Zeilen löschbar, 4 Dependencies wegwerfbar, in ~5 Stunden Aufwand.** Top-3: Visual-Regression-Engine löschen (1h), Retry-Wrapper vereinfachen (30min), Registrations-Page von Client zu Server Component (2h). **Quer-Befund:** Kern-Funktion (Antrag in DB speichern) fehlt komplett — `// TODO: Submit to Supabase` in `register/page.tsx:27`.

### 2. Repo-Architektur (site-architecture)
**`packages/shared-logic` + `packages/shared-types` sind Architektur-Theater** — der Bot importiert nichts von beiden, deklariert sie aber als Dependencies. Empfohlene Vereinfachung: Option C (Single-Repo, Packages weg, alles in `apps/frontend/lib/`). ~3h Aufwand. Turborepo gibt es übrigens schon nicht mehr (Phantom-Option A).

### 3. Datenbank (db-architect-vdata)
**8 Tabellen → 4, 20 Policies → 6, 7 RPCs → 2.** Aktueller Zustand ist undurchsichtig: "Du weißt aktuell nicht, welche 20 Policies effektiv aktiv sind" nach 7 Migrations. Konsolidierung mit Helper-Functions `can_read_registration()` + `can_write_registration()`.

---

## Konvergenz der drei Skills

Alle drei kommen unabhängig zu **demselben Befund unter verschiedenen Linsen**:

| Linse | Aussage |
|---|---|
| Code | Kern-Submit fehlt, alles drumherum ist Overkill |
| Architektur | `packages/` ist Theater, Single-Repo reicht |
| DB | 7 Migrations haben undurchsichtigen Zustand erzeugt, Reset auf 4 Tabellen |

**Roter Faden:** Das Projekt wurde wie ein Enterprise-System gebaut (Monorepo, Visual-Regression, 4 RLS-Rollen, n8n self-hosted), obwohl der Use-Case ein Hobby-Verein mit 1-2 Devs ist. **Vereinfachung ist nicht "weniger Features" — es ist "Tech-Stack auf Realität anpassen"**.

---

## Verdikt: Hotspot-Konsolidierung (sortiert nach Impact × Reversibilität)

| Rank | Wer | Was | Aufwand | Reversibel? |
|---|---|---|---|---|
| 1 | code | Visual-Regression KILL (163 LoC + 2 deps) | 1h | ✅ git revert |
| 2 | code | Wizard Submit-Pfad echt implementieren (#TODO) | 2h | ✅ |
| 3 | DB | `bot_execution_lock` + `system_health` droppen | 30min | ✅ Backup |
| 4 | DB | `finance_status` + `rpa_traces` Spalten in `registrations` mergen | 2h | ⚠️ Daten-Migration nötig |
| 5 | DB | RLS auf 6 Policies + 2 Helpers konsolidieren | 3h | ⚠️ Full Reset nötig |
| 6 | arch | `packages/*` → `apps/frontend/lib/*` (Single-Repo) | 3h | ✅ |
| 7 | code | Retry-Wrapper SIMPLIFY (77→10 LoC) | 30min | ✅ |
| 8 | code | Registrations-Page → Server Component | 2h | ✅ |
| 9 | code | TanStack Query rauswerfen (mit #8) | 1h | ✅ |
| 10 | code | Step-4-Upload SVG-Purge + RHF-Controller | 1.5h | ✅ |

**Gesamt: ~16-17 Stunden Reduktions-Arbeit für massive Komplexitäts-Reduktion.**

---

## Was bleibt (KEEP-Liste)

Damit klar ist was NICHT angefasst wird:

| Bereich | Begründung |
|---|---|
| Playwright-Bot Core (`dfbnet-bot.ts`, `create-draft.ts`) | Kern-Wert, funktioniert E2E |
| Sperrfristen-Engine (`packages/shared-logic/eligibility/`) | Domain-Wissen, gut getestet |
| Audit-Logs (mit `old_value`/`new_value`) | DSGVO-Auskunftspflicht, JSONB ist günstig |
| `audit_logs` schlanker variant verschoben auf später | "Risiko vs Nutzen ist asymmetrisch" |
| TRAINER-Rolle | Solange QR-Cash-Workflow geplant — Produkt-Entscheidung |
| Bot-`isProcessing` Singleton-Flag | Bei 1 Antrag/Tag genau richtig |

---

## Pattern-Erkenntnisse (für Phase 2 Plan)

### Pattern 1: Reihenfolge-kritisch
**DB-Reset (#5) muss VOR Schema-Mergen (#4)** laufen, damit man weiß welche Policies man wegwirft.
**Wizard Submit (#2) muss vor Visual-Regression KILL (#1)**, damit man Test-Daten hat um zu prüfen ob alles noch funktioniert.

### Pattern 2: Zwei Migrations-Strategien zur Wahl
**Option A (defensive):** Migration 8 `_schema_collapse` (Daten in registrations mergen) + Migration 9 `_rls_reset` (Policies reset + 6 neu)
**Option B (radikal):** Migration 8 `_full_reset` (alles auf einmal, mit `DO $$` Smoke-Test der bei Fehler ROLLBACKt)

Option A ist sicherer, Option B ist weniger Migrations-Drift langfristig.

### Pattern 3: Was n8n alles obsolet macht
Wenn wir Ops-Vereinfachung (Phase 5) machen — n8n raus, Vercel Cron rein — dann fallen ZUSÄTZLICH weg:
- `bot_execution_lock` Tabelle (kein verteiltes Lock nötig)
- `acquire_bot_lock` + `release_bot_lock` RPCs
- `system_health` Tabelle (Uptime-Robot übernimmt)
- `upsert_system_health` + `mark_health_alert_sent` RPCs
- Komplette `n8n/` Verzeichnis-Wartung

Das macht Phase 5 zum **größten ROI-Hebel**: Eine Entscheidung (n8n raus), 4 DB-Objekte weg + 1 ganze Service-Komponente weg.

---

## Was die Phase-2-Plan-Erstellung beantworten muss

1. **Reihenfolge der 10 Hotspots** — sequenziell vs parallel?
2. **Migrations-Strategie** — A defensive oder B radikal?
3. **n8n-Out-Entscheidung** — wann? (vor oder nach DB-Reset?)
4. **TRAINER-Rolle** — bleibt für QR-Cash oder weg? (Produkt-Entscheidung)
5. **Smoke-Test-Strategie** — wie verifizieren wir nach jeder Reduktion dass nichts kaputt ging?

---

*Phase 1 erstellt mit `/refactoring-specialist`, `/site-architecture`, `/db-architect-vdata` parallel.*
*Audit-Reference: AUDIT-REPORT-2026-06-30.md*
*Council-Reference: cfb-council-review-2026-06-30.md*
