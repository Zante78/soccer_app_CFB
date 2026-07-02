# R1 Debug-Session — Echter Browser mit DevTools

**Ziel:** Verstehen was DFBnet 9.2.0 bei echtem User-Klick anders macht als bei Playwright-Automation. Root Cause isolieren.

**Zeit:** 30-60 Minuten für R1, dann R2 (Netzwerk-Trace-Vergleich) direkt anschließend.

---

## Schritt 1 — Browser mit DevTools öffnen

1. Chrome/Edge öffnen
2. `F12` drücken → DevTools aufklappen
3. **Wichtig:** Tab "**Network**" aufmachen — dort werden wir mitschneiden
4. Checkbox "**Preserve log**" aktivieren (damit Requests nicht verloren gehen wenn Seite navigiert)
5. Filter "**All**" (nicht nur XHR)

---

## Schritt 2 — Login zu DFBnet

1. URL öffnen: `https://verein.dfbnet.org/login/`
2. Login:
   - Benutzername: `CfB_Passwesen`
   - Passwort: `niehl0952cfb`
   - Kundennummer: `23010320`
3. Auf "Anmelden" klicken
4. Warten bis "CfB Ford Köln Niehl 09/52 e.V." als Titel erscheint

---

## Schritt 3 — Zu "Neues Mitglied" navigieren

1. Menü hover "Information" → "Mitglieder" → "Neues Mitglied"
2. Warten bis Formular erscheint

---

## Schritt 4 — Network-Log leeren (Reset)

1. In DevTools → Network-Tab → rotes Kreis-Icon (Clear) klicken
2. **Ab hier wird jeder Request mitgeschnitten**

---

## Schritt 5 — Formular ausfüllen (MANUELL, mit Tastatur/Maus)

Test-Daten die wir verwenden können:
- Anrede: **Herr**
- Vorname: **RunDebug**
- Nachname: **ManualTest-2026-07-02**
- Straße: **Debugstrasse 99**
- PLZ: **50735**
- Ort: **Köln**
- Land: **Deutschland**
- Geburtsdatum: **01.01.2010**
- Geschlecht: **männlich**

**Wichtig:** Fülle wirklich mit Tastatur, nicht Copy-Paste alles auf einmal. Nach jedem Feld einmal `Tab` drücken (das simuliert echtes Nutzerverhalten).

---

## Schritt 6 — Speichern klicken (MANUELL)

1. Auf **"Speichern"** klicken
2. **Was passiert jetzt?** Notiere:
   - Erscheint ein Bestätigungs-Dialog (`OK/Abbrechen` mit Text "Mit Ja werden die Daten gespeichert...")?
   - Falls ja: auf **OK/Ja** klicken
   - Erscheint danach ein "Möglicher Doppeleintrag"-Modal?
   - Wird eine Mitgliedsnummer wie `2026-01XX` angezeigt?
   - Bleibt die Seite oder navigiert sie zu einer neuen URL?

---

## Schritt 7 — Ergebnis prüfen

1. Menü: "Mitgliederlisten" → "Übersicht"
2. Filter-Buchstabe **M** klicken (für ManualTest)
3. Findest du "ManualTest-2026-07-02" in der Liste? **JA/NEIN?**

---

## Schritt 8 — Screenshot der Network-Tab senden

**Das ist das Gold für R2:**

1. In DevTools → Network-Tab → Filter-Input `strVorname` eingeben
2. Screenshot machen von allen POST-Requests die auftauchen (mit `strVorname`)
3. Klicke einen dieser Requests → im Panel rechts: Tabs **Headers**, **Payload**, **Response**
4. Screenshots machen von:
   - **Headers** (besonders `Cookie`, `X-Requested-With`, `Referer`, `Sec-Fetch-*`)
   - **Payload** (alle Form-Daten die gesendet wurden)
   - **Response** (was DFBnet zurück schickt)

**Diese 3 Screenshots + Ergebnis aus Schritt 7 geben uns R2 komplett.**

---

## Was ich mit den Daten mache

Sobald du mir die Screenshots + Ergebnis gibst, kann ich:

1. **Cookies vergleichen** — Playwright-Session vs echter Browser: welche Cookies unterscheiden sich?
2. **Headers vergleichen** — hat der echte Browser `Sec-Fetch-Site`, `Sec-Fetch-Mode`, `Sec-Fetch-Dest` gesetzt die Playwright nicht setzt?
3. **Payload vergleichen** — sind zusätzliche Felder dabei (CSRF-Token, `_token`, `csrfmiddlewaretoken`, o.ä.)?
4. **Response analysieren** — sagt der Server explizit "wrong token" oder "session invalid"?

Aus dieser Analyse ergibt sich R3 (der Fix): Playwright-Konfiguration anpassen so dass sie die fehlenden Header/Cookies/Tokens setzt.

---

## Alternative — wenn du keinen Zeit für manuelles Debug hast

Sag mir das, dann mache ich stattdessen:

**Option Y:** Playwright im **headed Modus** mit `--devtools` starten, damit du beim Bot-Lauf zuschauen kannst was passiert. Ich kann das Skript aber nicht selbst starten (Console-Fenster) — du musst nur einmal draufschauen und dokumentieren was du siehst.

**Option Z:** Ich baue ein Debug-Skript das `HAR-File` exportiert (HTTP-Archive) — komplettes Network-Log. Das kann ich dann selbst analysieren. Aber HAR aus echtem Browser ist präziser als aus Playwright.
