# R2 Diagnose: Root Cause Save-Bug DFBnet 9.2.0
**Datum:** 2026-07-02
**Basis:** Live-Debug-Session mit User (echter Browser + Playwright parallel)

## Definitive Root Cause

**DFBnet 9.2.0 nutzt `Sec-Fetch-*` Header zur Trusted-Event-Prüfung.**

Diese Header können nur von Browser-nativer Form-Navigation gesetzt werden, nicht von JavaScript. Playwright's `document.AdressenForm.submit()` und auch `page.locator('#adressSaveBtn').click()` triggern diese Prüfung nicht korrekt.

## Der echte Save-Request (aus User-Manueller-Klick)

```
Method: POST
Path: /index.php?ul=OGYzYWE3Y2U4MzcyODNlNTk1ZDQwYmU3NWM1MDU1MjM_TW9kZT0mQWRySWQ9Jk1vZGVQYWdlPTgmc3RyQ2F0PSZBZHJlc3NlblRhYk1vZGU9MjEmT3BoSWQ9...
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
Content-Length: 4161

KRITISCHE HEADERS:
- sec-fetch-dest: document        ← Muss "document" sein (nicht "empty")
- sec-fetch-mode: navigate         ← Muss "navigate" sein (nicht "cors")
- sec-fetch-site: same-origin      ← OK, wird auch von Playwright gesetzt
- sec-fetch-user: ?1               ← KRITISCH: nur echter User-Klick setzt das
- upgrade-insecure-requests: 1     ← Muss gesetzt sein
- content-type: multipart/form-data ← MUSS multipart sein (nicht urlencoded)

STANDARD-HEADERS:
- accept: text/html,application/xhtml+xml,...  ← Doc-Level, nicht */*
- cache-control: max-age=0
- origin: https://verein.dfbnet.org
- priority: u=0, i                  ← Navigation-Priority (highest)
```

## Warum Playwright scheitert

Test mit `page.locator('#adressSaveBtn').click()` in Playwright:
- ✅ Klick wird ausgeführt
- ✅ Mitgliedsnummer wird angezeigt (Client-side)
- ❌ Persistierung schlägt fehl — DFBnet Backend lehnt Request ab
- ❌ Kein `sec-fetch-user: ?1` weil Playwright's Click als "programmatisch" gilt

**Der Grund:** Der Save-Button ist ein `<a href="javascript:checkMitgliedNr(...)">`-Tag. Der ruft am Ende `document.AdressenForm.submit()` auf — das ist ein JavaScript-Submit, kein User-Submit.

Selbst ein echter User-Klick auf einen JavaScript-Link führt normalerweise nicht zu `sec-fetch-user: ?1`. **Aber:** Chrome unterscheidet zwischen "User klickt Link mit javascript:" und "Skript ruft submit() auf". Der erste wird als User-Aktion markiert.

## Warum bei echtem User Chrome `sec-fetch-user: ?1` setzt

Aus der Chrome-Doku:
> Sec-Fetch-User is only sent when the navigation was triggered by user activation (click, keypress).

Das bedeutet: Wenn der User `#adressSaveBtn` klickt, hat Chrome **eine "User Activation"-Flag** aktiv. Der nachfolgende `document.AdressenForm.submit()` läuft **innerhalb dieser Aktivierung** und der resultierende POST bekommt `sec-fetch-user: ?1`.

Wenn Playwright `page.locator('#adressSaveBtn').click()` ausführt, sollte das eigentlich auch eine User Activation triggern (das ist Playwright's Design). Aber offenbar wird sie **nicht bis zum async AJAX-Callback** propagiert.

## Der eigentliche Fix-Weg

Aus dem Save-Flow (aus SL-1 Runde 3 Debug rekonstruiert):
```
1. User klickt <a> → User Activation aktiv
2. checkMitgliedNr() → AJAX (dauert ~200ms)
3. Success-Callback → ValidateAddressForSave() → AJAX (dauert ~200ms)
4. Success-Callback → document.AdressenForm.submit()
```

**Zwischen Schritt 1 und Schritt 4 vergehen 400-500ms.** Das ist ZU LANGE — Chrome's User Activation läuft nach 5 Sekunden ab, aber bei geschachtelten async Callbacks kann sie schon vorher weg sein.

**Bei echtem User-Klick:** Chrome hält die User Activation aktiv bis zur async-Kette-Auflösung. Bei Playwright's `.click()` möglicherweise nicht.

## Fix-Optionen (in Reihenfolge Aufwand)

### Option 1: Direkt-Form-Submit umgehen — Bypass des AJAX-Flows

**Idee:** Statt den Save-Button zu klicken, direkt einen fetch-POST mit den korrekten Headers und multipart/form-data machen.

```typescript
const formData = new FormData();
formData.append('strVorname', 'Xyz');
// ... alle Felder
formData.append('Operation', '1');
formData.append('Mode', 'Insert');

await page.evaluate(async (data) => {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => fd.append(k, v as string));
  await fetch(SUBMIT_URL, {
    method: 'POST',
    body: fd,
    headers: {
      // Manuelles setzen ist nicht möglich (Sec-Fetch-* sind Forbidden Headers)
    }
  });
}, formData);
```

**Problem:** `Sec-Fetch-*` Headers sind **Forbidden Headers** — können NICHT via `fetch()` manuell gesetzt werden. Diese Option scheitert.

### Option 2: Playwright's Native Navigation-Trigger nutzen

Statt `page.locator(...).click()` → nutze `page.dispatchEvent()` um einen echten `MouseEvent` mit `bubbles: true` zu senden.

```typescript
await page.locator('#adressSaveBtn').dispatchEvent('click', {
  bubbles: true,
  cancelable: true,
  detail: 1,  // Erste Aktion
});
```

**Möglicher Effekt:** Playwright's native `.click()` sollte das schon tun. Aber `dispatchEvent` mit explizitem `detail: 1` kann helfen.

### Option 3: Chrome DevTools Protocol (CDP) direkt nutzen

Playwright basiert auf CDP. Über CDP kann man **echte Trusted Events** injizieren:

```typescript
const client = await page.context().newCDPSession(page);
await client.send('Input.dispatchMouseEvent', {
  type: 'mousePressed',
  x: buttonX,
  y: buttonY,
  button: 'left',
  clickCount: 1
});
await client.send('Input.dispatchMouseEvent', {
  type: 'mouseReleased',
  x: buttonX,
  y: buttonY,
  button: 'left',
  clickCount: 1
});
```

Das sendet echte Hardware-Level-Klicks. Chrome unterscheidet **nicht** zwischen CDP-Events und User-Events.

### Option 4: `page.mouse.click(x, y)` mit exakten Koordinaten

Playwright hat `page.mouse` API die auch Hardware-Level-Events sendet. **Das ist Option 2 in einfacher.**

```typescript
const buttonBox = await page.locator('#adressSaveBtn').boundingBox();
await page.mouse.click(buttonBox.x + buttonBox.width/2, buttonBox.y + buttonBox.height/2);
```

**Meine Empfehlung:** Option 4 zuerst probieren (1h). Wenn nicht → Option 3 (CDP, 3h).

## Test-Mitglieder in Production

Die manuellen Tests haben Test-Mitglieder erzeugt:
- `2026-0121` — "RunDebug ManualTest-2026-07-02"
- `2026-0122` — "Debug2 SaveTest-0702-B"

**Beide müssen manuell aus DFBnet gelöscht werden.**

Test-Mitglied `2026-0123` "ClickTest ClickTest-..." wurde von Playwright versucht — **nicht persistiert** (Playwright-Save schlägt weiterhin fehl, User Activation kommt nicht durch).

## Nächster Schritt: R3

**Test Option 4 (`page.mouse.click` mit Bounding Box):**
- Aufwand: 1h
- Erfolgs-Kriterium: Nach Playwright-Save ist Mitglied in Mitgliederliste sichtbar

**Falls Option 4 scheitert:** Option 3 (CDP-Events).

**Falls auch das scheitert:** DFBnet 9.2.0 macht Playwright-Automation strukturell unmöglich → Vorstandsgespräch mit ehrlichem Signal.
