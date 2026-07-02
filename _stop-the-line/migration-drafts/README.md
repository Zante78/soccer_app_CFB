# Migration Drafts

**Warum liegen die Migrations HIER und nicht in `supabase/migrations/`?**

Diese Files stammen aus dem `origin/master`-Branch, der von `main` divergiert ist.
`master` hat einen parallelen Audit-Sprint durchlaufen (17 Rounds Fixes) und diese
zwei Migrations für DSGVO-Soft-Delete geschrieben.

`main` hat parallel einen anderen Weg genommen (unser aktuelles Migration 7 =
`restore_modify_policies` löst dasselbe Problem anders + strenger + mit
SECURITY-DEFINER-Hardening).

**Konsequenz:** Wir können `master`s 000009 + 000010 NICHT 1:1 nach `supabase/migrations/`
kopieren, weil:

1. Sie referenzieren Policy-Namen die in unserer Struktur nicht garantiert existieren
2. Sie bauen auf `master`s 000007+000008 auf, die wir nicht angewendet haben
3. Sie würden RLS-Regressions einführen (unser 000007 hat bereits Write-Policies,
   `master`s 000008 würde die möglicherweise doppelt anlegen oder überschreiben)

## Was diese Drafts enthalten

### `DRAFT-000008_soft_delete_registrations.sql`
- `registrations.deleted_at` Column + partial Index
- SELECT-Policies neu mit `deleted_at IS NULL` Filter
- Function `soft_delete_expired_registrations(retention_hours)` für 48h-DSGVO-Purge

**Wert:** Bringt echten Soft-Delete, statt harten `DELETE`. Behält Audit-Trail intakt.

### `DRAFT-000009_audit_rls_fixes_dsgvo.sql`
- Restore fehlender TRAINER-audit_logs und ANTRAGSTELLER-rpa_traces Policies
- `audit_logs.deleted_at` für DSGVO
- Cascade-Trigger: Registration soft-deleted → audit_logs mit soft-deleted
- Composite-Index `(status, started_at)` auf rpa_traces
- Storage-Path-Traversal-Guard für player-photos + documents

**Wert:** DSGVO-Cascade + Path-Traversal-Guard (Security-Fix).

## Wann sollten wir diese Migrations echt einspielen?

Frühestens im **DSGVO-Sprint** — dann als **NEUE, saubere Migrations** die vom
aktuellen `main`-Zustand (nach unserem 000007) ausgehen:

- `000008_soft_delete_registrations.sql` (neu geschrieben auf Basis DRAFT)
- `000009_audit_rls_fixes_dsgvo.sql` (neu geschrieben auf Basis DRAFT)

**Checkliste vorm Einspielen:**
- [ ] Alle Policy-Namen in DRAFT gegen aktuelle main-DB verifizieren (`\d+ registrations` in psql)
- [ ] Dry-Run gegen eine DB-Kopie
- [ ] Frontend `registrations`-Query anpassen: alle `SELECT` brauchen `deleted_at IS NULL` Filter (aber RLS macht das serverseitig — trotzdem verifizieren)
- [ ] `retryBotExecution`-Path testen: was passiert wenn Passwart einen soft-deleted Antrag "wiederherstellen" möchte?
- [ ] Bot-Flow prüfen: was passiert bei Save-Verify wenn Mitglied inzwischen soft-deleted ist?
- [ ] Vorstand über die 48h-Retention-Policy informieren (in DS-Erklärung dokumentiert?)

## Verweise

- Herkunft: `origin/master` Commit `2959bfd` (2026-03-20)
- Kollisions-Analyse: Session 2026-07-02 (Selektiver Restore aus master)
- Verwandte Sprint-Themen: [[SL-4_Vorstandsvorlage]] §Frage 2 (AVV/DS-Erklärung)
