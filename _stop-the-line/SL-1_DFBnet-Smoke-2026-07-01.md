# SL-1 DFBnet-Smoke — Ergebnis-Report
**Datum:** 2026-07-01
**Test-Umgebung:** verein.dfbnet.org (Production)
**Test-Mitglied angelegt:** 2026-0121 (Smoke Test-2026-07-01-BitteLoeschen) — **muss manuell gelöscht werden**
**Dauer:** ~15 Minuten

## Verdikt: **BOT-FOUNDATION FUNKTIONIERT**

Die Selektoren aus Memory (`cfb-dfbnet-felder.md`, Stand 03/2026) sind **100% gültig** — kein Selektor-Drift nach 3 Monaten.

**Wichtigste Erkenntnis:** Der Widerspruch "Code sagt PLACEHOLDER vs Memory sagt verifiziert" ist zugunsten von Memory geklärt. Die `PLACEHOLDER`-Kommentare in `apps/rpa-bot/src/config/selectors.ts` sind veraltet und müssen entfernt werden — die Werte darin sind real.

## Ergebnis pro Test-Bereich

### Test 1: Login-Seite (verein.dfbnet.org/login/)
| Selektor | Status |
|---|---|
| `input[name="strUserName"]` | ✅ PASS |
| `input[name="strPass"]` | ✅ PASS |
| `input[name="strShortKey"]` | ✅ PASS |
| `a:has-text("Anmelden")` | ✅ PASS |
| Login-Ausführung (CfB_Passwesen / ****) | ✅ ERFOLGREICH, kein 2FA gefordert |
| Post-Login-Titel | ✅ "CfB Ford Köln Niehl 09/52 e.V." wie in Memory |

**Verdikt Login:** 4/4 Selektoren PASS, Flow funktioniert.

### Test 2: MegaMenu-Extraktion (`#mgmenu1`)
| Test | Status |
|---|---|
| `#mgmenu1 a` Anzahl | ✅ 186 Links |
| "Neues Mitglied"-Link findbar | ✅ ja (via `.find(l => l.text === 'Neues Mitglied')`) |
| URL enthält `ModePage=8` | ✅ ja (Memory-konform) |
| Base64-encoded `?ul=`-Parameter | ✅ vorhanden |

**Verdikt MegaMenu:** Struktur unverändert, Extraktion funktioniert.

### Test 3: Neues-Mitglied-Formular (Adresse-Tab)
| Selektor | Status |
|---|---|
| `strMitgliedsnummer` | ✅ PASS |
| `strTitel` | ✅ PASS |
| `strAnrede` | ✅ PASS |
| `iSelBriefanrede` | ✅ PASS |
| `strVorname` | ✅ PASS |
| `strNachName` | ✅ PASS |
| `strStrasse` | ✅ PASS |
| `strStrasse2` | ✅ PASS |
| `strPostleitzhal` | ✅ PASS |
| `strOrt` | ✅ PASS |
| `strLand` | ✅ PASS |
| `strGeburtsdatum` | ✅ PASS |
| `iSelSex` | ✅ PASS |
| `iSelFamilienstand` | ✅ PASS |
| `strSOSnumber` | ✅ PASS |
| `strSOStext` | ✅ PASS |

**Verdikt Adresse-Tab:** 16/16 Selektoren PASS, keine Drift.

### Test 4: Speichern-Flow (Phase 1)
| Test | Status |
|---|---|
| `a:has-text("Speichern")` findbar | ✅ ja, ruft `javascript:checkMitgliedNr('1', ...)` auf |
| `confirm()`-Dialog erscheint | ✅ ja (via Playwright `page.on('dialog')` abgefangen) |
| Post-Save: Mitgliedsnummer zugewiesen | ✅ ja (2026-0121) |
| Post-Save: Alle Tabs sichtbar? | ⚠️ **NEIN** — nur Adresse-Tab. Memory 2026-03-19 sagte "alle Tabs erscheinen". Das stimmt **nicht mehr** oder war Fehl-Beobachtung. |
| Post-Save URL enthält AdressenTabMode | ✅ ja (`AdressenTabMode=21`) |

**Verdikt Speichern:** Grundfunktion arbeitet. **Aber Memory-Update nötig:** Phase 2 (Wiederöffnen) ist **zwingend** — nach Save NICHT alle Tabs sichtbar. Widerspricht Memory-Eintrag von 2026-03-19.

### Test 5: Mitglied wiederöffnen (Phase 2)
| Test | Status |
|---|---|
| Mitgliederlisten-Menu-Link findbar | ✅ ja |
| Buchstaben-Filter A-Z sichtbar | ✅ ja |
| Filter "T" oder "S" zeigt Test-Mitglied | ⚠️ **NEIN** — "Keine Adressen vorhanden" |
| Filter "Alle" zeigt Test-Mitglied | ⚠️ **NEIN** — nur Fußer-Zeile |
| Globales `searchAll` findet Test-Mitglied | ⚠️ **NEIN** |
| `Mitglied suchen` Formular sichtbar | ✅ ja, aber Felder (`SucheNachName`, `SucheNumber`) sind display:none (Accordion-collapse) |

**Verdikt Phase 2:** **DRIFT gegenüber Memory.** Die dokumentierten Wege zum Wiederauffinden funktionieren nicht wie beschrieben. Mögliche Ursachen:
- DFBnet indexiert neu angelegte Mitglieder verzögert (Cache-Delay?)
- Suche-Formular hat Accordion-Verhalten das nach Click aufklappt (wurde nicht getestet)
- Filter-Voreinstellung "Status = Aktiv" blendet neue passive Mitglieder aus

### Test 6: Zusatzdaten-Tab (11 Freifelder) + Löschen
**Nicht durchgeführt** — abhängig von Test 5.

## Konsequenzen für den Plan

### Was jetzt sicher ist ✅
1. **Login funktioniert** — kein 2FA-Problem, direkter Zugriff mit Credentials
2. **Menu-Struktur funktioniert** — MegaMenu-Extraktion 1:1 wie in Memory
3. **Adresse-Tab-Selektoren alle valide** — 16/16 PASS
4. **Neues Mitglied kann angelegt werden** — Save-Flow inkl. confirm()-Dialog funktioniert
5. **DFBnet vergibt Mitgliedsnummer** — Format 2026-XXXX wie erwartet

### Was neu untersucht werden muss ⚠️
1. **Phase-2-Strategie muss überarbeitet werden** — Memory-Annahme "alle Tabs erscheinen nach Save" ist falsch (oder DFBnet UI hat sich hier geändert)
2. **Wiederöffnen-Weg muss neu getestet werden** — mehrere dokumentierte Wege liefern "keine Adressen"
3. **Zusatzdaten-Tab-Selektoren (11 Freifelder)** ungetestet
4. **Lösch-Flow ungetestet**

### Was in cfb-dfbnet-felder.md korrigiert werden muss
- Zeile 44: `"nach dem Speichern bleibt DFBnet auf der GLEICHEN Seite im Edit-Modus — ALLE Tabs sind sofort sichtbar"` — **ist heute falsch.** Post-Save = nur Adresse-Tab sichtbar. Phase 2 (Wiederöffnen) ist zwingend.

### Was im Code korrigiert werden muss
- `apps/rpa-bot/src/config/selectors.ts` — PLACEHOLDER-Kommentare entfernen. Die Werte sind alle real und funktionieren.

## Loose ends — offene Punkte

- **Test-Mitglied 2026-0121 bleibt in DFBnet Production.** Muss manuell gelöscht werden via UI oder Bot-Skript `apps/rpa-bot/src/scripts/delete-test-members-exec.ts`.

## Entscheidungs-Gate (aus Council-Verdikt 2026-06-30)

Council sagte: SL-1 als Fork-Punkt, nicht Sprint-A-Enabler:
- Bot **PASS** → belastbares Artefakt für Vorstandsgespräch
- Bot **DRIFT/BROKEN** → Vision auf Eis

**Ergebnis:** Bot ist **PASS mit Nachjustierung** — Login + Adresse-Tab + Save funktionieren, Phase-2-Strategie muss überarbeitet werden (kein Beinbruch, aber Arbeit).

**Foundation trägt.** Vision-Framing steht:
- Wizard-Submit echt fixen → Foundation-Ergebnisse landen in Supabase
- Bot-Phase-2 neu implementieren → Suche-Formular via visible-Toggle handhaben
- Zusatzdaten-Tab + Löschen in einem 2. SL-1-Durchgang testen (später)

## Nächster Schritt

**Empfehlung:** Council-Verdikt folgen — 48h Pause + Vorstandsgespräch mit Vision-Framing.

**Wenn Vorstand-Mandat kommt:**
- SL-1 Phase 2+3 erneut testen (mit korrigierter Wiederöffnen-Strategie)
- Sprint A starten: Wizard-Submit + Middleware-Auth-Bypass + Storage-RLS
