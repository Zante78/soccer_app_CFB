# Vorstandsvorlage — CFB Digitale Passstelle
**Datum:** 2026-07-02
**Zweck:** 20-Minuten-Termin, drei Ja/Nein-Entscheidungen
**Zielgruppe:** Vorstand CfB Ford Köln-Niehl 09/52 e.V.
**Vorlage:** Simon Kritikos

> **Diese Vorlage verdichtet:** VISION.md · Konzeption Februar 2026 (`CFB Projekt/`) · SL-2/SL-4/SL-5 · Council-Verdikt 2026-06-30 · E2E-Analyse 2026-07-02 · Live-Test 2026-07-02

---

## 1. Um was es geht (1 Satz)

**Wir automatisieren Vereins-Neuaufnahmen End-to-End, damit Passwart-Zeit für Kinder frei wird statt für Bürokratie.**

Nicht: "Wollt ihr diesen Bot?" (Feature-Frage)
Sondern: **"Wollt ihr die administrative Last des Vereins-Ehrenamts halbieren?"** (Vision-Frage)

---

## 2. Was auf dem Spiel steht (1 Zahl)

**~25 Stunden Passwart-Zeit pro Saison sparen.**

- **Heute (Ist):** 21 Mannschaften × ~100 Passvorgänge/Saison × 15 min Papier + DFBnet-Eingabe + Sperrfrist-Rechnung = **~25h Ehrenamt/Saison**
- **Ziel (Soll):** Wizard erledigt Datenerfassung und Sperrfrist automatisch. Passwart bestätigt und übergibt an DFBnet. Regelfall: **< 1 Minute pro Vorgang.**
- **Struktureller Effekt:** Passwart-Amt wandert von "Data-Entry" zu "Exception-Handling" — dauerhaft nachfolgetauglich.

(Zahlen konsistent mit `CFB Projekt/praesentation.html` aus Februar 2026.)

---

## 3. Ist-Stand ehrlich (Ampel)

| Vision-Schritt | Status | Was fehlt konkret |
|---|---|---|
| 1-3 Wizard (Website → Formulardaten) | 🟢 gebaut | 8 Schritte fertig, klare Sprache. **Bestehende-Spieler-Suche noch Stub.** |
| 4 Sperrfristen-Check (§16 SpO / §20 JSpO) | 🟢 fertig | Getestet, production-ready |
| 5 DSGVO-Consent | 🟡 Struktur da | Deutsche Datenschutzerklärung auf Vereins-Website fehlt |
| 6 Zahlung (PayPal/QR-Cash) | 🔴 Stub | UI da, keine echte Payment-Integration |
| 7 Magic-Link | 🟡 Struktur da | Email-Versand fehlt |
| 8 Wizard → DB-Submit | 🔴 **Ein-Zeilen-Stub** | `console.log` statt echter Server-Action (`register/page.tsx:27`) |
| 9-10 Bot & Passwart-Check | 🟢 gebaut | DFBnet 9.3.0 verifiziert 2026-07-02. Health-Check + Success-Verification eingebaut. |
| 11 Aktivierung | 🟡 Grenze | Passwart klickt den letzten "Absenden"-Button manuell — **so gewollt (Safety-First)** |
| 12 Auto-Kommunikation | 🔴 fehlt | Email an Eltern + Trainer nicht gebaut |

**Fortschritt gegen Vision: 45-50%.** Ehrliche Zahl. Frühere "62%" zählten nur den Bot-Teil.

---

## 4. Was wir vom Vorstand brauchen (3 Ja/Nein)

### Frage 1 — Mandat

> **Zieht der Verein dieses System offiziell ein? Übernimmt der Vorstand die Verantwortung nach §26 BGB?**

- **Wenn Ja:** Vorstandsbeschluss dokumentiert (Vorlage `_stop-the-line/SL-4_Vorstandsmandat-AVV.md`), Simon Kritikos als Technischer Umsetzer benannt, zweiter Vorstands-Ansprechpartner bestimmt.
- **Wenn Nein:** Projekt eingefroren, Frontend + Bot bleiben lokal für Lern-Zwecke.

### Frage 2 — Rechtliche Absicherung (AVV + DS-Erklärung)

> **Unterzeichnet Vorstand AVV-Verträge mit Supabase und Vercel und stimmt zu dass die Datenschutzerklärung auf cfb-fordniehl.de aktualisiert wird?**

Was der Vorstand wissen sollte:
- Wir verarbeiten Kinder-Daten (Name, Geburtsdatum, Adresse, Foto) — heute schon auf Papier, künftig digital
- **Digital wird nicht risikoreicher, es wird transparenter.** DSGVO fordert Formalisierung was heute informell läuft
- AVV zu Supabase (Standard-Template, EU-Datenstandort Frankfurt): einmalige Unterschrift, kostenfrei
- AVV zu Vercel: Standard-Template
- Deutsche Datenschutzerklärung: einmaliger Text-Update auf Jimdo (~1h)
- **DSGVO-Vorarbeit ist da:** Soft-Delete + Cascade-Trigger + Path-Traversal-Guard als Migration-Drafts unter `_stop-the-line/migration-drafts/`
- **Optional:** DSB-Bestellung bei 400 Mitgliedern + automatisierter Verarbeitung nach BDSG §38 empfohlen, ~100-200€/Monat extern

Detail-Checkliste: `_stop-the-line/SL-4_Vorstandsmandat-AVV.md`

### Frage 3 — Passwart-Involvement

> **Michael Dobiat (aktueller Passwart) bekommt UI-Walkthrough und Vetorecht bei Rollout?**

- Wir bauen für ihn ohne ihn bisher gefragt zu haben. Das korrigieren wir vor Live-Schaltung.
- 30-Min-Interview-Vorlage steht (`_stop-the-line/SL-5_Passwart-Interview-Vorlage.md`)
- Ergebnis fließt in die Prioritäten der letzten 50% ein

---

## 5. Reißleine — was tun wenn FVM "Nein" sagt

**Parallel läuft SL-2:** Schriftliche Anfrage an FVM (Fußball-Verband Mittelrhein), ob RPA-Bots gegen DFBnet zulässig sind.

**Szenario A — FVM sagt OK oder antwortet nicht in 4 Wochen:** Wir dokumentieren, machen weiter wie geplant.

**Szenario B — FVM sagt "kein RPA erlaubt":** Wir reduzieren auf **Halb-Automatik** (schon in USER_MANUAL Februar 2026 als "Notfall-Modus" konzipiert):
- Wizard bleibt (der eigentliche Antragsteller-Nutzen)
- System generiert vorausgefülltes PDF statt DFBnet-Draft
- Passwart tippt aus PDF in DFBnet (wie heute, aber saubere Daten)
- **~50% Zeitersparnis bleibt.** Nicht 97%, aber substantiell.

**Kein FVM-Ja = kein Projekt-Kill.** Ein Feature weniger.

---

## 6. Wieder-entdeckte Risiken aus Konzeption Februar 2026

Die Kritische Analyse aus Februar 2026 hat drei Risiken benannt die wir aktuell **wieder aufs Radar holen müssen**:

| Risiko | Wo dokumentiert | Was fehlt uns aktuell |
|---|---|---|
| **2FA-Wechsel bei DFBnet** (SMS statt Email) | Kritische Analyse §2.2 | Plan-B fehlt. Aktuell nutzen wir IMAP-Extraktion — bei SMS-Wechsel bricht alles. |
| **Trainer-Akzeptanz QR-Scanner** | Kritische Analyse §3.1 | Trainer-Schulung, One-Click-Bedienbarkeit nie validiert |
| **DFBnet UI-Drift** | Kritische Analyse §2.1 | Health-Check ist gebaut (L3 heute), aber keine Baseline-Refresh-Kadenz definiert |

Das ist keine neue Bedrohungsliste — das sind bewusst frühzeitig erkannte Risiken die jetzt Aufmerksamkeit brauchen. Alle drei sind adressierbar, keiner davon ist projekt-killend.

---

## 7. Zeitplan bei Ja (realistisch, mit Vorbedingungen)

Bei Zustimmung zu den drei Fragen:

| Woche | Meilenstein | Vorbedingung |
|---|---|---|
| 1 | Vorstandsbeschluss dokumentiert · AVVs unterzeichnet · DS-Erklärung deutsch | Ja-Antworten heute |
| 1-2 | Passwart-Interview + UI-Walkthrough (SL-5) | Termin mit Michael Dobiat |
| 2-3 | Wizard-Submit echt (die eine TODO-Zeile) · Foto/Docs zu Supabase Storage | DB-Migrations aktualisiert |
| 3 | Trigger Wizard → Bot (Vercel Cron, kein n8n) | Wizard schreibt echt in DB |
| 4 | Payment-Chain (PayPal + QR-Cash-Verifikation) | Payment-Konto Verein bestätigt |
| 4-5 | Auto-Kommunikation (Email an Eltern + Trainer) | Email-Provider gewählt (Resend/SendGrid) |
| 5-6 | Pilot mit 5 Testfamilien | Passwart-Freigabe |
| 6-8 | Schrittweiser Rollout — Ziel: 80% aller Neuaufnahmen | Pilot-Feedback verarbeitet |

**Ehrlich:** 6-8 Wochen setzen 1-2 ehrenamtliche Devs voraus. Der Zeitplan aus Februar 2026 (Go-Live Juli 2026) war zu optimistisch. Was wir jetzt haben: getesteter Bot, funktionierender Wizard visuell, klarer letzter Weg.

---

## 8. Anlagen

**Vorstands-Material im Repo:**
- `_stop-the-line/SL-4_Vorstandsmandat-AVV.md` — Beschluss-Vorlage + AVV-Checkliste
- `_stop-the-line/SL-2_FVM-Compliance-Anfrage.md` — FVM-Brief
- `_stop-the-line/SL-5_Passwart-Interview-Vorlage.md` — Interview-Fragebogen
- `_stop-the-line/migration-drafts/` — DSGVO Soft-Delete + Cascade-Trigger als Vorlage

**Konzeptions-Historie (`CFB Projekt/` lokal, nicht im Git):**
- `praesentation.html` — Vorstandspräsentation Februar 2026 (**⚠️ Zeitplan überholt, Kern-Argumente noch gültig — als visueller Anker verwendbar mit Vorbehalten**)
- `prozessdiagramm.html` — IST-vs-SOLL-Prozessflussdiagramm (**SOLL noch aktuell, aktueller Stand 70% erreicht**)
- `mockup.html` — Frontend-Prototyp (**⚠️ inzwischen von echter Implementierung überholt, nur historischer Wert**)
- `PROJECT_PLAN.md` · `INITIALIZATION.md` · `USER_MANUAL.md` · `Kritische Analyse.md` — 75% weiterhin gültig, insbesondere die Doktrinen

**Strategische Anker:**
- `VISION.md` — Ehrenamts-Frame, entstanden 2026-07-01
- `AUDIT-REPORT-2026-06-30.md` — Technischer Audit mit 8 Findings
- `_stop-the-line/HEALTH-2026-07-02T12-54.md` — Aktueller Bot-Gesundheits-Report (grün)

---

## 9. Was wir früh durchdacht haben (Kontinuitätsanker)

Der Vorstand soll wissen: die Kern-Doktrinen sind nicht Ad-hoc, sondern seit Februar 2026 konsequent verfolgt:

- **"Fail-Safe RPA — Bot als Assistent, nicht als Blackbox"** — Draft-only-Prinzip, Human-in-the-Loop
- **"Safety First — finale Entscheidung beim Menschen"** — Passwart klickt "Absenden" bewusst manuell
- **"Documentation-First — Übergabetauglich an Nachfolger"** — jeder Fix hat Report, jeder Sprint hat Memory
- **"Datensparsamkeit vs. Revisionssicherheit durch Hash-Nachweis"** — DSGVO-konform ohne Beweis-Verlust
- **"Keep it Small — PoC nur für einen Bereich starten"** — wir bauen für CfB, nicht für 24.500 andere Vereine

Diese Doktrinen sind seit Februar 2026 unverändert. Was sich geändert hat: Der Weg dahin ist konkreter (Tech-Stack vereinfacht, Bot verifiziert, Datenschutz-Migrations vorbereitet).

---

## Anhang A — Antworten auf typische Vorstands-Fragen

**Q: Haften wir persönlich nach §26 BGB bei einem Fehler des Bots?**
A: Das Haftungsrisiko ist minimiert weil Bot nur Entwürfe erstellt und Passwart manuell freigibt. Der Vorstand ist wie bei jedem digitalen Vereinsprozess DSGVO-Verantwortlicher. AVV überträgt technische Verarbeitung an Supabase/Vercel unter definierten Bedingungen.

**Q: Was passiert wenn Simon Kritikos wegfällt?**
A: Bus-Faktor 1 ist explizit adressiert (Tech-Simplification, GitHub-Repo, dokumentierte Struktur, jeder Fix mit Report). Ziel: zweiter Dev bis Sprint 5. Fallback: Rückkehr zu manuellem Prozess jederzeit möglich, Daten exportierbar.

**Q: Wer trägt die laufenden Kosten?**
A: Vercel Free + Supabase Free reicht für ~500 Registrations/Monat. Bei Wachstum: ~25-50€/Monat gesamt. Optional DSB extern: ~100-200€/Monat.

**Q: Kann DFBnet den Account sperren wenn sie den Bot erkennen?**
A: Möglich — genau darum SL-2 (schriftliche FVM-Anfrage). Bot arbeitet mit Delay + human-like Pattern, kein Bulk-Access, keine API-Umgehung. Bei negativer Antwort: Halb-Automatik-Fallback (§5).

**Q: Was ist mit den Papier-Anträgen die parallel laufen?**
A: Übergangsphase 3-6 Monate, Papier bleibt möglich für Eltern die kein Digital wollen. Nach Rollout-Erfolg: Papier optional statt Standard.

**Q: Wir sind nur ein 400-Mitglieder-Verein — ist das nicht überdimensioniert?**
A: Ja, das war es. Tech-Stack wurde bewusst vereinfacht (Council-Verdikt 2026-06-30: n8n raus, Vercel-only). System ist bewusst kein Multi-Tenant-SaaS, sondern solide Lösung für **einen** Verein.

**Q: Wie ist der Stand gegenüber dem Zeitplan Februar 2026?**
A: Ehrlich — der Februar-Zeitplan (Go-Live Juli 2026) war zu optimistisch. Was wir haben: getesteter Bot (DFBnet 9.3.0), funktionierender Wizard visuell, DSGVO-Vorarbeit. Was fehlt: eine TODO-Zeile im Wizard-Submit + Payment + Auto-Kommunikation. Realistisch: **6-8 Wochen bei Ja-Entscheidung heute.**

**Q: Was passiert wenn DFBnet die Login-Methode ändert (SMS statt Email)?**
A: Reale Möglichkeit (§6 der Vorlage). Aktuell nutzen wir IMAP-Extraktion für Email-2FA. Plan-B wäre Webhook-basierte manuelle Token-Eingabe durch Vorstand — muss noch dokumentiert werden.

---

*Diese Vorlage ist bewusst kompakt. Für Detail-Fragen: die Anlagen in §8. Für strategische Kontext-Fragen: `VISION.md`. Für kritische Diskussionen: Chairman-Verdikt in `memory/cfb-council-review-2026-06-30.md`.*
