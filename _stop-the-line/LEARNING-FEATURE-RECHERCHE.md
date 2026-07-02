# CFB Bot Learning/Adaptive-Feature — Recherche-Ergebnis
**Datum:** 2026-07-01
**Anlass:** User erinnert sich an "Learning mitläuft, Screenshots, dynamisch lernen, wenn sich etwas verändert"

## Was tatsächlich existiert im Code

### 1. `visual-regression.ts` (163 LoC)
**Was es tut:**
- `compareScreenshots()` — vergleicht Actual vs. Baseline via pixelmatch
- Schwellwert: 0.2% Pixel-Differenz
- Bei Diff > 0.2% → `threshold_exceeded: true` → Bot wirft `BotError`
- Erzeugt Diff-Overlay-Image (rote Pixel = Unterschiede)
- Wenn keine Baseline existiert → Warnung, Score=0

**Was es NICHT tut:**
- **Kein dynamisches Lernen** — es aktualisiert Baseline nie automatisch
- **Kein Selektor-Learning** — es reagiert nur auf Pixel-Änderungen im Screenshot, nicht auf DOM-Änderungen
- **Kein Human-in-the-Loop Feedback-Loop im Code**

### 2. `dfbnet-bot.ts` Zeile 290-320 — Bot-Flow
```typescript
// Schritt 6: Pre-Save Screenshot
await page.screenshot({ path: screenshotPath, fullPage: true });

// Schritt 7: Visual Regression Check
const diffResult = await compareScreenshots(screenshotPath, baselinePath, {
  diffThreshold: 0.002
});

if (diffResult.threshold_exceeded) {
  // Upload zu Supabase Storage
  // Werfe BotError → Bot stoppt
  // Registrierung Status → VISUAL_REGRESSION_ERROR
}
```

**Verhalten:** Bot stoppt bei Diff > 0.2%. Er passt sich **nicht** an. Passwart muss manuell reagieren.

### 3. Frontend Admin-Dashboard — Halb-Automatik
`apps/frontend/app/(protected)/rpa-traces/`:
- **Visual Diff Viewer** (react-compare-slider) — Baseline vs. Actual nebeneinander
- **`onAcceptBaseline` Button** — Passwart klickt "Neue Baseline akzeptieren"
- **Aber:** `acceptNewBaseline()` in `actions.ts:112-133` ist ein **TODO-STUB** — nur `console.log`, kein Copy von screenshot_actual nach rpa-baselines bucket

## Was der User sich erinnert (Vermutung basierend auf Recherche)

Der User erinnert sich vermutlich an das **konzeptuelle Design** aus dem ursprünglichen Plan:
> "Bot macht Screenshots. Bei UI-Änderung stoppt er. Passwart schaut Diff an. Falls Change legitim: Passwart klickt 'Accept Baseline' → System lernt die neue UI."

Das ist ein **Human-in-the-Loop Learning-Muster**, nicht vollautomatisches Learning.

## Was aktuell fehlt (Gap-Liste)

| Feature | Vision | Aktueller Stand |
|---|---|---|
| Screenshot bei jedem Bot-Run | ✅ implementiert | funktioniert |
| Pixel-Diff-Check | ✅ implementiert | funktioniert (0.2% Threshold) |
| Baseline-Speicherung in Supabase Storage | 🎯 vorgesehen | Bot lädt bei Fehler hoch — **aber initiale Baseline muss manuell hochgeladen sein** |
| Visual-Diff-Viewer im Admin-Dashboard | ✅ implementiert | funktioniert |
| "Accept Baseline"-Button | ⚠️ UI existiert | **Server Action ist TODO-Stub** |
| **Automatisches Selektor-Update** | ❌ nie geplant | Selektoren sind hardcoded in `selectors.ts` |
| **Dynamisches DOM-Learning** | ❌ nie geplant | Bot nutzt statische Selektoren |
| **Auto-Baseline-Update bei erstem Run** | ❌ nicht implementiert | Baseline muss manuell erstellt sein (via `createBaseline()` Funktion) |

## Verbindung zum aktuellen SL-1 Debug

**Wichtige Erkenntnis:** Das Learning-System hätte den aktuellen Save-Bug **NICHT gefangen**:
- Visual Regression prüft Screenshots (was der User sieht)
- Der Save-Bug ist ein **JavaScript-Flow-Problem** (Trusted-Event / CSRF)
- Der Bot hätte einfach den Save-Screen genauso screenshotet wie im März — aber nicht bemerkt, dass das Server-Side-Backend das Formular ablehnt
- Der Screenshot **sieht** identisch aus, aber die Persistierung schlägt fehl

**Anders formuliert:** Visual Regression ist blind gegenüber "unsichtbaren" Server-Verhalten-Änderungen. Das ist eine Grenze des Designs.

## Was für DFBnet 9.2.0 wirklich nötig wäre

Ein modernisiertes Learning-System müsste zusätzlich prüfen:

1. **DOM-Diff** — nicht nur Pixel, sondern auch Struktur (welche Selektoren existieren, welche Attribute)
2. **API-Response-Learning** — was gibt der Server bei Save zurück? Success? Fehler-Modal? Redirect?
3. **Success-Verification** — nicht "Screenshot sieht gut aus" sondern "Kann ich das Mitglied jetzt in der Liste finden?"
4. **Version-Detection** — DFBnet 9.2.0 im Footer → System weiß dass Assumptions möglicherweise veraltet sind

## Konkrete Optionen

### Option 1: Fehlende Server Action implementieren (~2h)
`acceptNewBaseline()` echt bauen — Copy Screenshot in `rpa-baselines` Bucket, Status auf SUCCESS. Das ist das **fehlende Puzzle-Stück** für das ursprüngliche Design.

### Option 2: Success-Verification statt Visual Regression (~4h)
Statt "Screenshot vergleichen" → "Nach Save: Mitglied in Liste suchen. Wenn gefunden = success. Wenn nicht = Bot broken."

Das ist robuster gegen Server-Side-Changes und hätte den aktuellen Bug gefangen.

### Option 3: DOM-Change-Detection als Ergänzung (~6h)
Erweitere `visual-regression.ts` um DOM-Snapshot-Vergleich:
- Speichere pro Selektor `document.querySelector(sel)?.tagName + .id + .name`
- Bei Bot-Run: prüfe ob alle erwarteten Selektoren noch existieren
- Falls fehlend: Warnung + Alert (nicht Bot-Stop)

## Fazit für User

**Ja, ein Learning-Konzept existiert im Code — aber es ist unvollständig implementiert:**

- ✅ Screenshots werden gemacht
- ✅ Pixel-Diff wird berechnet
- ✅ Visual-Diff-Viewer im Admin-Dashboard
- ⚠️ Accept-Baseline-Button existiert aber ist Server-seitig ein TODO
- ❌ Selektor-Learning war nie geplant
- ❌ Success-Verification war nie geplant (Bot vertraut Screenshot statt DB-Check)

**Der aktuelle Save-Bug wäre vom Learning-System nicht erkannt worden** — weil das System auf pixel-level Änderungen achtet, nicht auf server-side Verhalten.

**Empfehlung:** Wenn Bot-Repair kommt (~11h Aufwand aus SL-1 Runde 3), zusätzlich:
- +2h: `acceptNewBaseline()` TODO-Stub implementieren
- +4h: Success-Verification einbauen (Mitglied in Liste finden statt Screenshot vergleichen)

Das wäre der ehrlich verlässlichere Learning-Baustein für die Vision.
