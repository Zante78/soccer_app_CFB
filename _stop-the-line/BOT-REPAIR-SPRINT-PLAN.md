# Bot-Repair-Sprint — Erweiterter Scope mit Learning-Ergänzungen
**Datum:** 2026-07-01
**Basis:** SL-1 Runde 3 Debug-Analyse + Learning-Feature-Recherche
**Trigger:** DFBnet Version-Upgrade 9.1.1 → 9.2.0

## Sprint-Ziel

**Der Bot soll DFBnet 9.2.0-kompatibel funktionieren UND aus zukünftigen UI-Änderungen selbst lernen können.**

Nicht nur reparieren — auch **härten gegen die nächste DFBnet-Version.**

## Scope-Übersicht

| # | Aufgabe | Aufwand | Kategorie |
|---|---|---|---|
| **REPAIR** | | | |
| R1 | DevTools-Debug mit echtem Browser (manueller Save-Klick beobachten) | 2h | Investigation |
| R2 | CSRF-/Session-Token-Analyse (Netzwerk-Trace vergleichen) | 2h | Investigation |
| R3 | Save-Fix implementieren (Trusted-Event / neue Token-Handling) | 4h | Fix |
| R4 | Zusatzdaten-Tab + 11 Freifelder testen | 2h | Verification |
| R5 | Löschen-Flow testen | 1h | Verification |
| **LEARN** | | | |
| L1 | `acceptNewBaseline()` TODO-Stub fertig implementieren | 2h | Feature-Completion |
| L2 | Success-Verification (Mitglied in Liste finden statt Screenshot) | 4h | Robustheit |
| L3 | DOM-Diff-Detection (Selektoren-Health-Check) | 6h | Frühwarnung |
| **Gesamt** | | **23h** | ≈ 3 Arbeitstage |

## Warum alle drei Learning-Ergänzungen

### L1 — acceptNewBaseline TODO-Stub (2h)
**Ohne L1:** Frontend-Button existiert, klickt nur `console.log`. Learning-Loop schließt sich nie.
**Mit L1:** Passwart klickt "Accept Baseline" → Storage-Copy passiert → System hat neue Baseline für nächsten Run.

Kleinster Aufwand, größte Symptombeseitigung. Ohne L1 ist Visual Regression halb-tot.

### L2 — Success-Verification (4h)
**Der Killer-Feature-Fund aus dem heutigen Debug:** Visual Regression **hätte den DFBnet 9.2.0 Save-Bug nicht gefangen**, weil der Save-Screen pixel-identisch aussieht — nur das Backend lehnt ab.

**Mit L2:** Nach Save prüft der Bot aktiv: "Kann ich Mitgliedsnummer XYZ jetzt in der Liste finden?" Wenn nein = echter Fehler, unabhängig von Screenshot-Diff.

Das ist die **echte Robustheits-Ebene** die dem ursprünglichen Design fehlte.

### L3 — DOM-Diff-Detection (6h)
**Frühwarnung statt Ausfall:** Bevor der Bot bei einem Save-Klick versagt, prüft er zuerst ob alle 30+ erwarteten Selektoren noch im DOM existieren. Falls einer fehlt → Alert an Passwart, bevor überhaupt ein Save-Versuch startet.

**Beispiel-Nutzen für DFBnet 9.2.0:** Bot hätte beim ersten Login geflaggt: "Save-Button hat neue onclick-Signatur — Wartung nötig." Statt stille Save-Fehler.

## Reihenfolge im Sprint

**Phase 1 — Investigation (4h):**
1. R1 DevTools mit echtem Browser
2. R2 CSRF-/Session-Analyse

**Phase 2 — Save-Fix (4h):**
3. R3 Save-Fix implementieren
4. Mini-Verification: 1 Test-Mitglied erfolgreich anlegen

**Phase 3 — Learning-Loop schließen (2h):**
5. L1 acceptNewBaseline echt implementieren
6. Baseline-Screenshot aktualisieren via UI

**Phase 4 — Robustheit (10h):**
7. L2 Success-Verification einbauen
8. L3 DOM-Diff-Detection einbauen
9. Vollständiger E2E-Test mit Freifeldern + Löschen (R4 + R5)

**Phase 5 — Verification (3h):**
10. R4 Zusatzdaten-Tab + 11 Freifelder
11. R5 Löschen-Flow
12. Vollständiges E2E: Anlegen → Zusatzdaten → Löschen mit Success-Verification aktiv

## Erwartetes Ergebnis nach Sprint

| Metrik | Vor Sprint | Nach Sprint |
|---|---|---|
| Save-Flow funktioniert | ❌ | ✅ |
| Bot erkennt eigene Fehler | ❌ (blind vertraut Screenshot) | ✅ (Success-Verification) |
| Bot warnt vor UI-Änderungen | ❌ | ✅ (DOM-Diff-Detection) |
| Passwart kann Baseline updaten | ❌ (Button ist Stub) | ✅ (Server Action echt) |
| DFBnet 9.2.0-kompatibel | ❌ | ✅ |
| Robust gegen nächste DFBnet-Version | ❌ | ✅ (Frühwarnung + Success-Check) |
| Bus-Faktor-Reduktion | 1 (nur Original-Dev) | 1+ (Nachfolger sieht bei Bruch was zu tun ist) |

## Was das für den Council-Verdikt bedeutet

Der Council hatte gesagt: SL-1 als Fork-Punkt.

**Neue Interpretation mit Learning-Ergänzungen:**
- **Wenn Sprint erfolgreich (23h):** Bot ist besser als je zuvor. Selbstheilendes Learning-Loop. Vision-Meilenstein "Draft-Bot funktioniert" ✅
- **Wenn Sprint fehlschlägt (R3 Save-Fix bricht bei CSRF-Problem):** Ehrliches Signal an Vorstand — "DFBnet 9.2.0 macht Bot-Automation strukturell unmöglich, wir müssen Plan B evaluieren"

Beide Ergebnisse sind belastbar. Aktuell haben wir weder Sicherheit noch Klarheit.

## Konkrete nächste Schritte

**Option A:** Sprint sofort starten, R1 heute noch (2h Debug mit echtem Browser)
**Option B:** Erst Vorstandsgespräch (Council-Verdikt "48h Pause"), dann Sprint mit Mandat starten
**Option C:** Sprint als Machbarkeits-Studie starten — R1+R2 (4h) → wenn CSRF-Problem lösbar → Rest des Sprints. Sonst frühzeitiger Abbruch mit belastbarem Signal.

Meine Empfehlung: **Option C**. Investiere 4h für Investigation. Wenn machbar → gesamte 23h fließen. Wenn nicht → mit belastbarer Erkenntnis zum Vorstandsgespräch.

## Files & Referenzen

- SL-1 Runde 3 Debug: `_stop-the-line/SL-1_DFBnet-Smoke-2026-07-01_Runde3-Debug.md`
- Learning-Recherche: `_stop-the-line/LEARNING-FEATURE-RECHERCHE.md`
- Vision: `VISION.md`
- Council-Verdikt: Memory `cfb-council-review-2026-06-30.md`
- Learning-Code-Basis: `apps/rpa-bot/src/utils/visual-regression.ts` + `apps/frontend/app/(protected)/rpa-traces/`
