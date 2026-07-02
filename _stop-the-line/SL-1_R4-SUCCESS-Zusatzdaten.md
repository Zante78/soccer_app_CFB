# R4 SUCCESS: Zusatzdaten-Tab + 11 Freifelder verifiziert
**Datum:** 2026-07-02
**Test-Mitglied:** 2026-0123 HeaderTrace

## Verdikt

**Alle 11 Freifelder-Selektoren PASS. Save auf Zusatzdaten-Tab funktioniert mit `.click({ delay: 100 })`.**

## Verifizierte Selektoren

### 11 Freifelder (aus Memory 03/2026)
| # | Feld | Selektor | Status |
|---|---|---|---|
| 1 | Freigabe | `select[name="iAttribut0"]` | ✅ PASS |
| 2 | Grund | `select[name="iAttribut1"]` | ✅ PASS |
| 3 | Teilhabegesetzt | `select[name="iAttribut2"]` | ✅ PASS |
| 4 | Beitragsbefreiung | `select[name="iAttribut3"]` | ✅ PASS |
| 5 | Beitragsrueckstand | `select[name="iAttribut4"]` | ✅ PASS |
| 6 | Beitragsrueckstandgrund | `input[name="strName5"]` | ✅ PASS |
| 7 | Datenschutzerklaerung | `select[name="iAttribut6"]` | ✅ PASS |
| 8 | Beitragsart | `select[name="iAttribut7"]` | ✅ PASS |
| 9 | Aufnahmegebuehr (Text) | `textarea[name="strLong8"]` | ✅ PASS |
| 10 | Mannschaftswunsch | `select[name="iAttribut9"]` | ✅ PASS |
| 11 | Aufnahmegebuehr (Status) | `select[name="iAttribut10"]` | ✅ PASS |

### 6 Extra-Felder
| Feld | Selektor | Status |
|---|---|---|
| Vereinseintritt | `input[name="strEintrittsdatum"]` | ✅ PASS |
| Status | `select[name="Status"]` | ✅ PASS |
| Austrittsgrund | `select[name="strAustritts"]` | ✅ PASS |
| Bild | `input[name="ImgTitle"]` | ✅ PASS |
| Gemeinschaft | `select[name="iFamAssign"]` | ✅ PASS |
| Branche | `select[name="iBranche"]` | ✅ PASS |

## Wichtige Änderungen seit Memory 03/2026

### 1. Save-Button auf Zusatzdaten-Tab ist ANDERS
- **NICHT** `#adressSaveBtn` wie auf Adresse-Tab
- Sondern: `a.SubmitButton` mit `javascript:OnSubmitPageSelectFormPunkte(...)`
- Selektor: `page.locator('a.SubmitButton').filter({ hasText: 'Speichern' })`

### 2. Neuer Zwischen-Dialog "Bitte bei Bedarf eine Liste wählen"
Nach dem ersten Save auf Zusatzdaten-Tab erscheint ein Interstitial-Dialog mit Team-/Mitgliederlisten-Auswahl. Der Bot muss:
- Optional: Team-Mitgliedschaftsliste wählen (Checkbox)
- Speichern nochmal klicken (auch mit `delay: 100`)

Der Dialog hat drei Buttons: "Speichern", "Abbrechen", "Zurück".

### 3. Beitragsarten wurden PREISERHÖHT seit März 2026
| Feld | Alt (03/2026) | Neu (07/2026) |
|---|---|---|
| Aktives Mitglied | 240€ | **300€** |
| Alte Herren | 120€ | **150€** |
| Inaktiv | 40€ | **50€** |
| Inaktiv+Kind | 20€ | **25€** |
| Geschwisterkind | 120€ | **150€** |
| Ballschule | 200€ | **220€** |
| Vereinsunterstützer | 40€ | **50€** |
| VU+Kind | 20€ | **25€** |
| **NEU** | — | **150€ Normal Halbjahresbeitrag** (`171909`) |

### 4. Trainer-Namen wurden aktualisiert
| Mannschaft | Alt Trainer (03/2026) | Neu Trainer (07/2026) |
|---|---|---|
| 1. Mannschaft | Dogan Oymak | **Yannick Zierden** |
| 2. Mannschaft | Boubouloudis/Zimmer | **Orhan Sabri Ates** |
| U17-1 B1 | Salvatore Abate | **Raphael Schüler** |

**Value-IDs sind stabil** — der Bot muss nur die neuen Texte in Mapping-Logik erkennen (Fuzzy-Match für Trainer).

## Verifiziertes E2E-Szenario

**Mitglied 2026-0123 "HeaderTrace"** wurde mit folgenden Werten gespeichert:
- Freigabe: Nein (121741)
- Beitragsart: 220€ Ballschule (169347)
- Teilhabegesetzt: Nein (21311)
- Beitragsrückstand: NEIN (66700)
- Datenschutzerklärung: Ja (86900)
- Aufnahmegebühr-Status: offen (170823)

**Post-Save-Signal:** `document.body.innerText.includes('gespeichert')` = true ✅

## Aufwand

Geschätzt: 2h
Real: **~15 min**

Weitere Aufwand-Reduktion gegenüber Original-Schätzung.

## Nächster Schritt

R5 — Löschen-Flow testen mit den Test-Mitgliedern (2026-0121 bis 2026-0123 und ggf. mehr).
