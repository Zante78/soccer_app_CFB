# Vorstandsvorlage — CFB Pass-Automation
**Datum:** 2026-07-02
**Zweck:** 20-Minuten-Termin, drei Ja/Nein-Entscheidungen
**Zielgruppe:** Vorstand CfB Ford Köln-Niehl 09/52 e.V.
**Vorlage:** Simon Kritikos

> **Diese Vorlage verdichtet:** VISION.md + SL-2 (FVM-Anfrage) + SL-4 (Mandat/AVV) + SL-5 (Passwart-Interview) + Council-Verdikt 2026-06-30 + E2E-Analyse 2026-07-02

---

## 1. Um was es geht (1 Satz)

**Wir automatisieren Vereins-Neuaufnahmen End-to-End, damit Passwart-Zeit für Kinder frei wird statt für Bürokratie.**

Nicht: "Wollt ihr diesen Bot?" (Feature-Frage)
Sondern: **"Wollt ihr die administrative Last des Vereins-Ehrenamts halbieren?"** (Vision-Frage)

---

## 2. Was auf dem Spiel steht (1 Zahl)

**~20-40 Stunden Passwart-Zeit pro Saison sparen.**

- Heute: 80-120 Neuanträge × 15-20 min Papier/Email/DFBnet = 20-40h Passwart-Arbeit/Saison
- Ziel: 100 Anträge × 30 sec Bestätigung = < 1h Passwart-Arbeit/Saison
- **Struktureller Effekt:** Passwart-Amt wird von "5h/Woche Data-Entry" zu "30min/Woche Ausnahmen prüfen" — nachfolgetauglich.

---

## 3. Ist-Stand ehrlich (Ampel)

| Vision-Schritt | Status | Kommentar |
|---|---|---|
| 1-3 Wizard (Website → Formulardaten) | 🟢 gebaut | 8 Schritte fertig, klare Sprache |
| 4 Sperrfristen-Check | 🟢 fertig | Getestet, production-ready |
| 5 DSGVO-Consent | 🟡 Struktur da | Deutsche Datenschutzerklärung fehlt |
| 6 Zahlung (PayPal/QR-Cash) | 🔴 Stub | UI da, keine echte Payment-Integration |
| 7 Magic-Link | 🟡 Struktur da | Email-Versand fehlt |
| 8 Wizard → DB-Submit | 🔴 Stub | `console.log` statt echter Server-Action |
| 9-10 Bot & Passwart-Check | 🟢 gebaut | DFBnet 9.3.0 verifiziert 2026-07-02 |
| 11 Aktivierung | 🟡 Grenze | Passwart macht letzten Klick manuell |
| 12 Auto-Kommunikation | 🔴 fehlt | Email an Eltern + Trainer nicht gebaut |

**Fortschritt gegen Vision: 45-50%** (nicht die früher genannten 62% — die zählten nur den Bot-Teil).

---

## 4. Was wir vom Vorstand brauchen (3 Ja/Nein)

### Frage 1 — Mandat

> **Zieht der Verein dieses System offiziell ein? Übernimmt der Vorstand die Verantwortung nach §26 BGB?**

- **Wenn Ja:** Wir dokumentieren einen Vorstandsbeschluss (Vorlage in `_stop-the-line/SL-4_Vorstandsmandat-AVV.md`), Simon Kritikos wird als Technischer Umsetzer benannt, ein zweiter Vorstands-Ansprechpartner wird bestimmt.
- **Wenn Nein:** Projekt wird eingefroren, Frontend + Bot bleiben lokal für Test/Lern-Zwecke.

### Frage 2 — Rechtliche Absicherung (AVV + DS-Erklärung)

> **Vorstand unterzeichnet Auftragsverarbeitungsverträge (AVV) mit Supabase und Vercel und stimmt zu dass die Datenschutzerklärung auf cfb-fordniehl.de aktualisiert wird?**

Kontext für den Vorstand:
- Wir verarbeiten Kinder-Daten (Name, Geburtsdatum, Adresse, Foto) — heute schon auf Papier, künftig digital
- **Digital wird nicht risikoreicher, es wird transparenter.** DSGVO fordert Formalisierung was heute informell läuft.
- AVV-Vertrag zu Supabase: Standard-Template, EU-Datenstandort (Frankfurt), einmalige Unterschrift (kostenfrei)
- AVV-Vertrag zu Vercel: Standard-Template, ähnliche Konditionen
- Deutsche Datenschutzerklärung: einmaliger Text-Update auf Jimdo (~1h Arbeit)
- **Optional: DSB-Bestellung** (Datenschutzbeauftragter) — bei 400 Mitgliedern + automatisierter Verarbeitung nach BDSG §38 empfohlen, ~100-200€/Monat extern

Detail-Checkliste + Vorlagen: `_stop-the-line/SL-4_Vorstandsmandat-AVV.md`

### Frage 3 — Passwart-Involvement

> **Michael Dobiat (aktueller Passwart) bekommt einen UI-Walkthrough und ein Vetorecht bei der Rollout-Entscheidung?**

- Wir bauen für ihn, ohne ihn bisher gefragt zu haben. Das ist ein Fehler den wir vor Live-Schaltung korrigieren.
- 30-Min-Interview-Vorlage steht (`_stop-the-line/SL-5_Passwart-Interview-Vorlage.md`)
- Ergebnis fließt in die Prioritäten der letzten 50% Umsetzung ein

---

## 5. Reißleine — was tun wenn FVM "Nein" sagt

**Parallel zum Vorstandsmandat läuft SL-2:** Schriftliche Anfrage an FVM (Fußball-Verband Mittelrhein) ob RPA-Bots gegen DFBnet zulässig sind.

Vorlage: `_stop-the-line/SL-2_FVM-Compliance-Anfrage.md` (fertig, muss noch abgeschickt werden)

**Szenario A — FVM sagt OK oder antwortet nicht in 4 Wochen:** Wir dokumentieren, machen weiter wie geplant.

**Szenario B — FVM sagt "kein RPA erlaubt":** Wir reduzieren auf **Halb-Automatik**:
- Wizard bleibt (Antragsteller-UX ist der eigentliche Nutzen)
- System generiert vorausgefülltes PDF/HTML statt DFBnet-Draft
- Passwart tippt aus dem PDF manuell in DFBnet (wie heute, aber lesbarer)
- **~50% Zeitersparnis bleibt** (Papier-Chaos weg, saubere Daten). Nicht 97%, aber substantiell.

**Kein FVM-Ja = kein Projekt-Kill.** Nur ein Feature weniger.

---

## 6. Was schon durchdacht ist (Vorstand muss NICHT neu bewerten)

Der Vorstand entscheidet die drei Fragen oben. Diese Detail-Themen sind bereits geklärt und dokumentiert:

- **Tech-Stack:** grotesk-überkomplex → vereinfacht (Vercel Cron + Supabase-only). Bus-Faktor 1 → 2. Council-Verdikt vom 2026-06-30.
- **Bot-Foundation:** funktioniert gegen DFBnet 9.3.0 (getestet 2026-07-02). Health-Check-Frühwarnung für zukünftige DFBnet-Updates ist eingebaut.
- **Draft-Only-Safety:** Bot erstellt nur Entwürfe, kein Auto-Submit. Passwart klickt "Absenden" händisch — Human-in-the-Loop bleibt.
- **Datenlöschung:** Antragsteller-Daten werden 48h nach Freigabe automatisch gelöscht.
- **8 Sofort-Bugs:** identifiziert und priorisiert (Audit 2026-06-30). Reihenfolge: Security → Foundation → Feature.

---

## 7. Zeitplan bei Ja

Bei Zustimmung zu den drei Fragen:

| Woche | Meilenstein |
|---|---|
| 1 | Vorstandsbeschluss dokumentiert, AVVs unterzeichnet, DS-Erklärung deutsch |
| 1-2 | Passwart-Interview + UI-Walkthrough (SL-5) |
| 2-3 | Wizard-Submit echt (kein `console.log` mehr), Payment-Integration |
| 3-4 | Auto-Kommunikation (Eltern + Trainer per Email) |
| 4-6 | Erste 5 Testfamilien, danach schrittweiser Rollout |
| 6-8 | Vollrollout — 80% aller Neuaufnahmen laufen über System |

Realistisch: **6-8 Wochen** bei 1-2 ehrenamtlichen Devs (Simon + optional zweiter Dev).

---

## 8. Anlagen

- `VISION.md` — Vollständige Vision-Herleitung (Council-getrieben 2026-07-01)
- `_stop-the-line/SL-2_FVM-Compliance-Anfrage.md` — FVM-Brief-Vorlage
- `_stop-the-line/SL-4_Vorstandsmandat-AVV.md` — Vorstandsbeschluss + AVV-Checkliste
- `_stop-the-line/SL-5_Passwart-Interview-Vorlage.md` — Interview-Fragebogen
- `AUDIT-REPORT-2026-06-30.md` — Sicherheits- & Compliance-Audit
- `PHASE-1-DIAGNOSE-2026-06-30.md` — Technische Ist-Aufnahme
- `_stop-the-line/HEALTH-2026-07-02T12-54.md` — Aktueller Bot-Gesundheits-Report (grün)

---

## Anhang A — Antworten auf typische Vorstands-Fragen

**Q: Haften wir persönlich nach §26 BGB bei einem Fehler des Bots?**
A: Das Haftungsrisiko ist minimiert weil Bot nur Entwürfe erstellt und Passwart manuell freigibt. Der Vorstand ist wie bei jedem digitalen Vereinsprozess Verantwortlicher im Sinne DSGVO. AVV überträgt die technische Verarbeitung an Supabase/Vercel unter definierten Bedingungen.

**Q: Was passiert wenn Simon Kritikos wegfällt?**
A: Bus-Faktor 1 war bewusst adressiert (Tech-Simplification, öffentliches GitHub-Repo, dokumentierte Struktur). Ziel: zweiten Dev bis Sprint 5 einarbeiten. Fallback-Plan: Rückkehr zu manuellem Prozess ist jederzeit möglich, Daten sind exportierbar.

**Q: Wer trägt die laufenden Kosten?**
A: Vercel Free + Supabase Free reicht für ~500 Registrations/Monat. Bei Wachstum: ~25-50€/Monat gesamt. Optional DSB extern: ~100-200€/Monat.

**Q: Kann DFBnet den Account sperren wenn sie den Bot erkennen?**
A: Möglich — genau darum SL-2 (schriftliche FVM-Anfrage). Bot arbeitet mit Delay + human-like Interaktions-Pattern, kein Bulk-Access, keine API-Umgehung. Bei negativer FVM-Antwort: Halb-Automatik-Fallback (siehe §5).

**Q: Was ist mit den Papier-Anträgen die parallel laufen?**
A: Übergangsphase 3-6 Monate, Papier bleibt möglich für Eltern die kein Digital wollen. Nach Rollout-Erfolg: Papier optional statt Standard.

**Q: Wir sind nur ein 400-Mitglieder-Verein — ist das nicht überdimensioniert?**
A: Ja, das war es. Tech-Stack wurde bewusst vereinfacht (siehe Council-Verdikt). System ist bewusst nicht als Multi-Tenant-SaaS gebaut, sondern als solide Lösung für **einen** Verein. Kein Feature-Kreuzzug.

---

*Diese Vorlage ist bewusst kompakt. Für Detail-Fragen: die Anlagen in §8. Für strategische Kontext-Fragen: `VISION.md`. Für kritische Diskussionen: Chairman-Verdikt in `memory/cfb-council-review-2026-06-30.md`.*
