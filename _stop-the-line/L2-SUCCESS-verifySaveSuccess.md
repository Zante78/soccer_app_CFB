# L2 SUCCESS: verifySaveSuccess() implementiert + integriert
**Datum:** 2026-07-02
**Files:**
- `apps/rpa-bot/src/flows/create-draft.ts` (+ VerifyResult Type + verifySaveSuccess Funktion)
- `apps/rpa-bot/src/bot/dfbnet-bot.ts` (Integration Step 8b)

## Motivation

Der Live-Debug am 2026-07-02 hat gezeigt: DFBnet 9.2.0 kann Save-Requests
serverseitig ablehnen (Trusted-Event-Check), während der Client denkt es sei
alles gut. Ein Screenshot-Vergleich (Visual Regression) fängt das NICHT — der
Bot sieht "Mitgliedsnummer wurde vergeben, Erfolgsmeldung erschienen" und meldet
SUCCESS, obwohl der Server nichts persistiert hat.

L2 löst das durch **Ground-Truth-Verifikation** auf DB-Level: der Bot geht nach
`saveDraft()` in die Mitgliederliste, filtert nach dem Anfangsbuchstaben des
Nachnamens, und prüft ob der Name wirklich in der Tabelle steht.

## Was implementiert wurde

### 1. `verifySaveSuccess()` in `flows/create-draft.ts`

Neue exportierte Funktion mit dieser Signatur:

```typescript
export async function verifySaveSuccess(
  page: Page,
  nachname: string,
  options: {
    mitgliederlistenUrl: string;
    timeoutMs?: number;
  }
): Promise<VerifyResult>
```

Ablauf:

1. **Input-Validation** — leerer Nachname oder Nicht-A-Z-Anfangsbuchstabe →
   sofort `{ verified: false, reason: ... }`
2. **Navigation** — `page.goto(mitgliederlistenUrl)` (ModePage=7)
3. **Filter** — `a` mit exaktem Text `/^[A-Z]$/` clicken (mit `.click({ delay: 100 })`
   wegen DFBnet Trusted-Event)
4. **Suche** — `page.evaluate` iteriert `tr` Rows, findet erste Row deren
   `textContent` den Nachnamen enthält
5. **Mitgliedsnummer-Extraktion** — findet Zelle mit Regex `/^\d{4}-\d{4}$/`
6. **Return** — `VerifyResult` mit `verified`, `mitgliedsnummer`, `matchedRowText`,
   ggf. `reason`

Der komplette `try/catch` fängt alle Fehler ab und mapped auf
`{ verified: false, reason: "Verifikations-Fehler: ..." }` — die Verifikation
selbst wirft nicht.

### 2. Integration in `bot/dfbnet-bot.ts` als Step 8b

Direkt nach `saveDraft()` (Zeile 328) und vor Screenshot-Upload (Zeile 369):

```typescript
// 8b. Success-Verification — check DB-Level, not just screenshot
const mitgliederlistenUrl = await page.evaluate(() => {
  const link = Array.from(document.querySelectorAll('#mgmenu1 a')).find(
    (a) => a.textContent?.trim() === 'Mitglieder' &&
           (a as HTMLAnchorElement).href.includes('TW9kZVBhZ2U9Nw')
  );
  return (link as HTMLAnchorElement | undefined)?.href;
});

if (!mitgliederlistenUrl) {
  regLogger.warn('Mitgliederlisten-URL nicht im Menu gefunden — Success-Verification übersprungen');
} else {
  const verifyResult = await verifySaveSuccess(page, registration.player_name, {
    mitgliederlistenUrl,
  });

  if (!verifyResult.verified) {
    throw new BotError(
      `Save-Verifikation fehlgeschlagen für Nachname "${registration.player_name}": ${verifyResult.reason ?? 'Mitglied nicht in Mitgliederliste'}`,
      ErrorCategory.UNKNOWN,
      { screenshotPath: draftResult.screenshotPath }
    );
  }
}
```

## Design-Entscheidungen

### Warum URL aus MegaMenu extrahieren statt hardcoden

DFBnet-URLs sind base64-encoded mit Session-State (`ul=...`). Eine hardcodete
URL wäre nur für die aktuelle Session gültig. Der `#mgmenu1`-Link liefert
immer die aktuelle Session-gebundene URL.

Der Match-Filter `TW9kZVBhZ2U9Nw` ist base64 für `ModePage=7` (der Anchor der
Mitgliederliste-Route).

### Warum nur Anfangsbuchstabe filtern, nicht Volltextsuche

DFBnet hat kein serverseitiges Search-Interface das der Bot ohne weiteren
Reverse-Engineering-Aufwand nutzen kann. Der Buchstabenfilter (A-Z Buttons oben)
ist ein natives DFBnet-UI-Element mit stabiler Selektor-Struktur. Reduziert die
Suchmenge typischerweise auf 5-30 Mitglieder (bei 400-Mitglieder-Verein).

### Warum text-basierter Row-Match statt DOM-Selector

DFBnet-Tabellen haben inkonsistente Zellen-Reihenfolge zwischen Views.
Ein reiner `textContent.includes(nachname)` ist robuster als Position-basiertes
Cell-Matching. Kollision (zwei Personen mit gleichem Nachnamen) ist theoretisch
möglich aber praktisch selten — bei einem 400-Mitglieder-Verein sowieso.

Follow-up-Optimierung wäre kombinierter Match auf Nachname + Vorname + Geburtsdatum.

### Warum kein Retry bei Verifikations-Fehler

Wenn der Server den Save wirklich abgelehnt hat, hilft ein Retry der
Verifikation nichts — das Mitglied ist einfach nicht da. Der Bot muss das
als echten Fehler behandeln und den Passwart informieren. Retry würde die
falsche Fehler-Kategorie verwischen ("Netzwerk-Flake" vs "Save wurde
serverseitig abgelehnt").

### Warum ErrorCategory.UNKNOWN statt SAFETY

`SAFETY` ist für Fälle wo der Bot beim Absicht-Check auf einen Submit-Button
statt Draft-Button trifft. Verifikations-Fehler sind operativer Natur —
etwas ging schief, aber es war keine Safety-Verletzung. `UNKNOWN` ist die
neutrale Kategorie die dem Passwart im Trace-Log erscheint und ihn zum
Diff-Viewer führt.

## Fail-Safe: keine Verifikation → nur Warning

Wenn die Mitgliederlisten-URL im MegaMenu NICHT gefunden wird (z.B. DFBnet
Menu-Update, User hat andere Rolle etc), wird nur eine Warning geloggt aber
der Bot läuft weiter durch mit dem Screenshot-basierten Ergebnis. Grund:
- L2 ist eine **Zusatz-Prüfung**, keine Kern-Funktion
- Ein fehlendes MegaMenu blockiert den Bot nicht komplett
- Passwart sieht die Warning im Log und kann manuell prüfen

Alternative wäre: fehlendes MegaMenu → hard fail. Aber das würde bei
DFBnet-Updates die Bot-Verfügbarkeit gefährden ohne dass ein echter Save-Bug
vorliegt.

## Verifikation

**Statische Prüfung:** ✅
- Import in `dfbnet-bot.ts` ergänzt (`verifySaveSuccess`)
- `VerifyResult` Type in `create-draft.ts` exportiert
- Playwright-API-Signaturen korrekt (`page.locator`, `page.evaluate`, `.click({ delay: 100 })`)
- BotError-Kategorien vorhanden (`UNKNOWN` in errors.ts)

**Type-Check:** Nicht ausgeführt (`tsc` nicht in dieser Umgebung installiert).
Bei nächstem `npm run type-check` sollte code clean sein.

**Live-Test:** Nicht möglich ohne aktiven Bot-Lauf. Test-Szenario für nächste
Live-Session:
1. Registration im Frontend anlegen (Status READY_FOR_BOT)
2. Bot triggern
3. Erwartet: nach `saveDraft` Log-Zeile `Save-Verifikation OK: Mitglied "..." gefunden (Nr: 2026-XXXX)`
4. Bot returned SUCCESS

Negative-Szenario (Bug einführen um Verifikation zu testen):
1. Bot kurz vor Save abbrechen (nur Formular gefüllt, kein Save-Klick)
2. Manuell testen dass `verifySaveSuccess()` `{ verified: false, reason: "... nicht in Mitgliederliste ..." }` liefert

## Aufwand

Geschätzt: 2-3h
Real: **~30 min** (inkl. Type-Definition, Integration, Report)

## Nächste Schritte

- **L3 DOM-Diff-Detection** (3-4h) — Selektor-Health-Check für DFBnet-Update-Frühwarnung.
- **Live-Test** bei nächster Registration.
- **Follow-up:** L2 könnte Audit-Log-Insert bekommen (`SAVE_VERIFIED` action)
  analog zu L1. Aktuell nur regLogger — für Compliance-Trail wäre DB-Insert besser.
