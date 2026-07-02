# SL-1 DFBnet-Smoke — 2. Durchlauf (Update)
**Datum:** 2026-07-01 (Runde 2)
**Vorläufer:** SL-1_DFBnet-Smoke-2026-07-01.md (Runde 1)

## Kritischer Befund aus Runde 2

**Der Save-Flow funktioniert nicht E2E — Mitglied 2026-0121 wurde nie persistiert.**

### Beobachtungen

1. Runde 1: Save geklickt → Mitgliedsnummer 2026-0121 im Formular → gedacht "erfolgreich"
2. Runde 2: Mitgliederliste-Filter "T" zeigt Mitglieder 2026-0106 bis 2026-0120 — **2026-0121 fehlt komplett**
3. Formular zeigt Pflichtfelder-Fehlermeldung: `"Bitte füllen Sie folgende Pflichtfelder aus: Vorname, Nachname, Straße, PLZ, Ort, Land, Geburtsdatum, Geschlecht."`
4. Alle Werte sind im Formular gesetzt (`iSelSex=163`, `strLand=Deutschland`, alles gefüllt)
5. Trotzdem persistiert Save NICHT
6. Kein Error-Element mit gängigen Selektoren (`.error`, `.errorMsg`, `font[color="red"]`) findbar

### Was das bedeutet

**Widerspruch zu Memory `cfb-dfbnet-felder.md`:**
- Memory behauptet: 2026-03-19 wurde Mitglied 2026-0034 erfolgreich angelegt + gelöscht (E2E-Test bestanden)
- Realität heute: Save-Flow lehnt Formular ab trotz aller Werte

**Mögliche Ursachen (untested):**
1. **DFBnet-UI hat sich seit März geändert** — Validation strikter, evtl. neue Pflichtfelder (z.B. Anrede-ID muss exakt matchen, iSelBriefanrede erforderlich)
2. **Pflichtfeld-Text ist statisch** — die "Bitte füllen Sie ..."-Meldung erscheint immer, nicht dynamisch nach Save-Attempt
3. **Save via Playwright vs echter Browser-Klick** — anders behandelt (JS `checkMitgliedNr()` prüft möglicherweise event-source)
4. **Session-Cookie-Problem** — Bot-Session hat weniger Rechte als vermutet
5. **Pflichtfeld-Detection ist Realtime via JS onblur** — Playwright fill() setzt Werte ohne blur-Event

### Was in Runde 1 wirklich passierte

Höchstwahrscheinlich: Speichern-Link (`javascript:checkMitgliedNr('1', ...)`) hat Validation entdeckt → hat aber KEINEN Alert ausgelöst (kein confirm-Dialog) → hat die Seite als "invalid" markiert → Mitgliedsnummer im Formular ist nur Client-side vergeben, nicht persistiert.

Der `confirm()`-Dialog aus Memory war vermutlich ein Wunschdenken oder eine andere DFBnet-Version.

## Konsequenzen — nochmal kritischer

**Bot-Foundation ist NICHT verifiziert.** Der Selektor-Test bestand, aber der Save-Flow bricht.

### Was jetzt wirklich sicher ist ✅
- Login-Selektoren (4/4)
- Login-Flow (Auth + kein 2FA)
- MegaMenu-Extraktion (186 Links)
- Adresse-Tab-Selektoren (16/16 — die Felder existieren)
- **Neues Mitglied navigierbar** (ModePage=8)
- **Mitgliederliste navigierbar** (ModePage=7) — zeigt 1252 Mitglieder in 26 Seiten

### Was jetzt UNSICHER ist ⚠️
- **Save-Flow persistiert nicht** — Test-Mitglied bleibt Client-side, landet NICHT in DFBnet-Datenbank
- Grund unklar. Muss debugged werden mit echtem Browser + DevTools.
- Zusatzdaten-Tab-Selektoren (11 Freifelder) — nicht erreichbar ohne persistiertes Mitglied
- Lösch-Flow — nicht erreichbar ohne persistiertes Mitglied

## Erfreuliches — kein Test-Müll in Production

**Test-Mitglied 2026-0121 landete NIE in DFBnet-Datenbank.** Kein manuelles Löschen nötig. Die Mitgliederliste ist sauber.

## Neue Verdikt zum Bot-Status

**Der Bot-Code aus 2026-03-19 kann heute (2026-07-01) das Formular ausfüllen — aber NICHT speichern.** Das ist ein deutlicher Regressionsschritt und wichtiger als der Selektor-Widerspruch.

### Vergleich zu Council-Verdikt

Der Council hatte gesagt:
- Bot **PASS** → belastbares Artefakt für Vorstandsgespräch
- Bot **DRIFT/BROKEN** → Vision auf Eis

**Aktuell ist es weder klar PASS noch klar BROKEN.** Es ist **teilweise DRIFT**:
- Selektoren stabil (PASS)
- Navigation stabil (PASS)
- Save-Flow gebrochen oder anders (BROKEN)

## Nächste Schritte (nicht heute)

1. **Live-Debug-Session mit echtem Browser** (nicht headless Playwright) — Wie sieht der Save wirklich aus? Wo bricht er?
2. **Netzwerk-Trace** — Was sendet DFBnet zurück bei Save-Klick?
3. **Klärungsfrage FVM/DFBnet-Support**: "Warum lehnt Formular Save ab trotz Pflichtfelder?"
4. **Alternative: Bot-Code aus 2026-03-19 wiederherstellen** und exakt so ausführen wie damals — evtl. hat 2026-03-19-Version was gefunden was heute nicht mehr klappt

## Empfehlung an Vorstandsgespräch (aus Council)

**Ehrlich sagen:** "Bot funktioniert nicht mehr wie im März — Save-Flow hat sich verändert. Ehrenamts-Vision bleibt gültig, aber Bot-Baustein braucht Nachbesserung." 

Das ist konform zum Council-Verdikt und ehrlicher als "Bot ist fertig, wir müssen nur noch simplifizieren".

## Fazit

**SL-1 Runde 2 hat wichtigen Bug entdeckt der Runde 1 verpasst hätte.** Vertrauen in "62% fertig"-Zahl weiter gesunken (bereits durch Vision-Framing auf 45-50% korrigiert, jetzt eher 30-40% weil Bot-Save nicht funktioniert).
