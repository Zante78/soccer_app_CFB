# SL-1 Debug — DevTools-Analyse Save-Flow
**Datum:** 2026-07-01 (Runde 3, DevTools-Debug)
**Vorläufer:** SL-1 Runde 1 (Selektor-Test) + Runde 2 (Save-Bug entdeckt)

## Verdikt: Root Cause = DFBnet Version-Upgrade

**DFBnet Version 9.1.1 → 9.2.0** seit dem letzten erfolgreichen E2E-Test 2026-03-19. Save-Flow hat sich strukturell geändert.

## Was der Save-Flow WIRKLICH tut (rekonstruiert aus JS-Code)

```
User klickt "Speichern" (a-Tag mit href="javascript:checkMitgliedNr('1', SUBMIT_URL, '')")
  │
  ▼
checkMitgliedNr(iOper=1, url=SUBMIT_URL, iAdrId='')
  │
  ├─ AJAX POST → check-URL (Mitgliedsnummer-Prüfung)
  │  ├─ Response=1 → Mitgliedsnr existiert → Modal DialogMitgliedNr öffnet
  │  └─ Response=0 → weiter
  │
  ▼
ValidateAddressForSave('#triggered', iOper, url, iAdrId)
  │
  ├─ AJAX POST → duplicate-URL (Vor/Nach/Strasse/Ort-Duplikat-Check)
  │  ├─ Response.ok=0 → Modal DuplicatedMitglied ("Möglicher Doppeleintrag") öffnet
  │  └─ Response.ok=1 → weiter
  │
  ▼
document.AdressenForm.Operation.value = iOper
document.AdressenForm.action = url  
document.AdressenForm.submit()  ← ECHTER SAVE
```

## Was wir verifiziert haben

| Test | Ergebnis |
|---|---|
| `checkMitgliedNr` existiert im Window | ✅ ja |
| `ValidateAddressForSave` existiert | ✅ ja |
| Duplikat-Check-AJAX direkt aufgerufen | ✅ Response `{"ok":1}` — Duplikat OK |
| Alle 6 Modals im DOM vorhanden | ✅ (searchcopyadressen, DeletedMitglieder, DialogMitgliedNr, DuplicatedMitglied, +Impressum, Support) |
| Adressen-Form hat richtige Hidden Fields | ✅ Operation, Mode, AdrId, AdressenTabMode=21 |
| Direkt-Submit via `document.AdressenForm.submit()` | ⚠️ Kein Effekt, URL bleibt gleich |

## Ursachen-Hypothesen

### Hypothese A (wahrscheinlich): CSRF-Token / Session-Binding
DFBnet 9.2.0 könnte Server-Side-Validation eingeführt haben, die spezielle Session-Cookies oder CSRF-Tokens prüft, die per Playwright-Session nicht generiert werden. Cookies waren zwar da (`OphinexSess23010320`, `s_fid`, etc.), aber möglicherweise fehlt ein neuer 9.2.0-Token.

**Test:** Manuelles Anlegen im gleichen Browser über echten User-Klick → falls das klappt, ist es JS-Event-Herkunft (Trusted-Event-Prüfung).

### Hypothese B: Blur-Events fehlen
Playwright `page.fill()` setzt Werte aber löst nicht immer alle Events (change, blur, focus) korrekt aus. DFBnet 9.2.0 könnte auf blur-Events warten, um Validation-Status zu setzen.

**Test:** Nach jedem `fill()` ein `page.locator(sel).blur()` oder Tab-Key-Press.

### Hypothese C: Instruktions-Text falsch interpretiert
Der Text "Bitte füllen Sie folgende Pflichtfelder aus: Vorname, Nachname, Straße, PLZ, Ort, Land, Geburtsdatum, Geschlecht." **ist statischer Instruktions-Text** (immer präsent, nicht Fehler-Ergebnis). Wir haben in Runde 2 falsch interpretiert.

Der eigentliche Fehler wird vermutlich anders angezeigt (Toast, Popup, Farbe rot, ARIA-Live-Region). Nicht identifiziert bisher.

### Hypothese D: URL-Signatur veraltet
Die `?ul=`-Parameter sind base64-encoded und session-gebunden. Vielleicht enthalten sie in 9.2.0 einen Timestamp, der schnell abläuft. Test-Session war ~5 Minuten alt beim Save.

## Selektor-Update aus 9.2.0

Diese Erkenntnisse gehen in `cfb-dfbnet-felder.md`:

| Alt (Memory) | Neu (9.2.0) | Änderung |
|---|---|---|
| `strNachName` (input name) | `strNachName` name + `strNachname` (id, lowercase!) | ID nutzt lowercase — Memory hatte nur name-Attribut |
| `#adressSaveBtn` | `#adressSaveBtn` (id, unverändert) | ✅ stabil |
| DFBnet Version | 9.2.0 (war 9.1.1) | Upgrade seit März |

## Was das für den Plan bedeutet

### Nicht wegwerfen
- Login funktioniert weiterhin
- Selektoren sind alle gültig  
- Navigation funktioniert
- Der bestehende Bot-Code aus 2026-03-19 hat 80% seiner Foundation intakt

### Aber neu machen
- Save-Flow muss neu implementiert werden — DFBnet 9.2.0-kompatibel
- Duplikat-Modal-Handling explizit einbauen
- Möglicherweise Cookies-Whitelist erweitern
- Trusted-Event-Sourcing prüfen (echter Klick vs. .click() aus Puppeteer/Playwright)

### Aufwand-Schätzung Save-Fix

| Aufgabe | Aufwand |
|---|---|
| DevTools-Debug mit echtem Browser (nicht Playwright) — was passiert bei manuellem Save? | 2h |
| CSRF-/Session-Token-Analyse (Netzwerk-Trace vergleichen) | 2h |
| Save-Fix implementieren + testen | 4h |
| Zusatzdaten-Tab-Selektoren testen (11 Freifelder) | 2h |
| Löschen-Flow testen | 1h |
| **Gesamt Bot-Repair** | **~11h** |

Das ist wesentlich mehr als die "1-2h Selektor-Verifikation" die im ursprünglichen SL-1 geplant war.

## Konsequenz für Council-Verdikt

**Der Bot ist teilweise DRIFT.** Weder klar PASS noch klar BROKEN.

Für Vorstandsgespräch:
- **Positiv:** Vision bleibt gültig, viel Foundation-Arbeit ist gültig, DFBnet-Login funktioniert
- **Realistisch:** Bot-Save muss neu gemacht werden nach DFBnet 9.2.0-Upgrade
- **Ehrlich:** "62% fertig"-Zahl war Selbsttäuschung. Realer Stand: ~30% wenn Vision-Ziel gilt

## Erfreulich

**Kein Test-Müll in DFBnet.** Alle Save-Versuche wurden vom Server abgelehnt. Die Mitgliederliste ist sauber.

## Nächste Schritte

**Empfehlung:** 
1. **48h Pause** (Council-Verdikt folgen)
2. **Vorstandsgespräch mit ehrlichem Update** — Vision-Doku + SL-1-Report als Basis
3. Wenn Mandat kommt: **2-Tage-Bot-Repair-Sprint** mit echtem Browser + Netzwerk-Trace
4. Erst danach Sprint A (Frontend-Hotfixes)

## Files

- `_stop-the-line/SL-1_DFBnet-Smoke-2026-07-01.md` — Runde 1 (Selektor-Test)
- `_stop-the-line/SL-1_DFBnet-Smoke-2026-07-01_Runde2.md` — Runde 2 (Save-Bug entdeckt)
- `_stop-the-line/SL-1_DFBnet-Smoke-2026-07-01_Runde3-Debug.md` — DIESES (Root Cause Analyse)
