# Phase 4: RPA Bot Implementation Guide

**Ziel:** Vollständige Anleitung zur Implementierung des DFBnet RPA Bots

**Status:** Foundation abgeschlossen ✅ | Login & Form Automation ausstehend

---

## 📊 Aktueller Stand

### ✅ Abgeschlossen (Phase 4.1 & 4.2)

1. **Bot Architektur** (`apps/rpa-bot/`)
   - Monorepo Integration
   - TypeScript + ESM Setup
   - Winston Logger (Console + File)
   - Environment Config Management

2. **Dependencies installiert**
   - `playwright` (Browser Automation)
   - `@supabase/supabase-js` (Database)
   - `pixelmatch` + `pngjs` (Visual Regression)
   - `winston` (Logging)
   - `dotenv` (Config)

3. **Supabase Client** (`src/services/supabase-client.ts`)
   - `getPendingRegistrations()` - Holt READY_FOR_BOT Status
   - `createRPATrace()` - Erstellt Trace Entry
   - `updateRPATrace()` - Updated Status/Screenshot
   - `uploadScreenshot()` - Storage Upload

4. **DFBnetBot Class** (`src/bot/dfbnet-bot.ts`)
   - Browser Initialization (Chromium)
   - Main Processing Flow (Skeleton)
   - Screenshot Capture
   - Error Handling Foundation

5. **Test erfolgreich** ✅
   - Browser Launch funktioniert
   - Chromium installiert (282 MB)
   - Headed/Headless Mode konfigurierbar

---

## 🚀 Phase 4.3: DFBnet Login Automation

### Schritt 1: DFBnet Selektoren finden

**Benötigte Tools:**
- Chrome/Edge Browser mit DevTools (F12)
- DFBnet Test-Account

**Prozess:**
1. **Öffne DFBnet Login-Seite:**
   ```
   https://www.dfbnet.org
   ```

2. **Öffne DevTools (F12) → "Elements" Tab**

3. **Finde Username Field:**
   - Rechtsklick auf Username Input → "Inspect"
   - Notiere Selektoren:
     - `id` (z.B. `id="username"`)
     - `name` (z.B. `name="user"`)
     - CSS Selector (z.B. `input[type="text"]`)

   **Beispiel:**
   ```html
   <input type="text" id="username" name="user" />
   ```

4. **Finde Password Field:**
   - Gleicher Prozess

   **Beispiel:**
   ```html
   <input type="password" id="password" name="pass" />
   ```

5. **Finde Submit Button:**
   - Meist: `<button type="submit">` oder `<input type="submit">`

   **Beispiel:**
   ```html
   <button type="submit" class="btn-login">Anmelden</button>
   ```

6. **Finde Dashboard Element (nach Login):**
   - Element das **nur nach Login** sichtbar ist
   - Z.B. "Willkommen, [Name]" oder "Spielerverwaltung" Link

   **Beispiel:**
   ```html
   <a href="/spielerverwaltung">Spielerverwaltung</a>
   ```

---

### Schritt 2: Login Code implementieren

**Öffne:** `apps/rpa-bot/src/bot/dfbnet-bot.ts`

**Ersetze die `login()` Methode:**

```typescript
/**
 * Login zu DFBnet
 */
private async login() {
  if (!this.page) throw new Error("Browser not initialized");

  logger.info("Navigating to DFBnet...");
  await this.page.goto(config.DFBNET_BASE_URL);

  // 1. Username eingeben
  logger.info("Entering username...");
  await this.page.fill('#username', config.DFBNET_USERNAME); // ← ANPASSEN!

  // 2. Password eingeben
  logger.info("Entering password...");
  await this.page.fill('#password', config.DFBNET_PASSWORD); // ← ANPASSEN!

  // 3. Submit Button klicken
  logger.info("Clicking login button...");
  await this.page.click('button[type="submit"]'); // ← ANPASSEN!

  // 4. Warten auf Dashboard (Navigation)
  logger.info("Waiting for dashboard...");
  await this.page.waitForSelector('a[href*="spielerverwaltung"]', {
    timeout: 10000
  }); // ← ANPASSEN!

  logger.info("✅ Login successful");
}
```

**Wichtig:** Ersetze die Selektoren mit den **echten** aus Schritt 1!

---

### Schritt 3: Selektoren testen

**Test-Script erstellen:** `src/test/test-login.ts`

```typescript
import { config } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { DFBnetBot } from "../bot/dfbnet-bot.js";

async function testLogin() {
  logger.info("🧪 Testing DFBnet Login...");

  const bot = new DFBnetBot({
    headless: false, // Headed Mode zum Debuggen!
    timeout: 30000,
    screenshotDir: "./screenshots",
    baselineDir: "./baselines",
  });

  try {
    await bot["initialize"]();
    await bot["login"](); // Private method access for testing

    logger.info("✅ Login test passed!");

    // Warte 5 Sekunden zum Anschauen
    await new Promise((resolve) => setTimeout(resolve, 5000));

    await bot.close();
  } catch (error) {
    logger.error("❌ Login test failed:", error);
    await bot.close();
    process.exit(1);
  }
}

testLogin();
```

**Ausführen:**
```bash
cd apps/rpa-bot
npx tsx src/test/test-login.ts
```

**Erwartung:**
- Browser öffnet sich (Headed Mode)
- Navigiert zu DFBnet
- Füllt Username/Password aus
- Klickt Login
- Landet auf Dashboard
- Schließt nach 5 Sekunden

---

### Schritt 4: Häufige Probleme & Lösungen

#### Problem 1: "Timeout: Selector not found"
```
Error: Timeout 30000ms exceeded waiting for selector '#username'
```

**Lösung:**
- Selektor ist falsch → DevTools nochmal checken
- Seite lädt langsam → `timeout` erhöhen
- Element ist in einem `<iframe>` → Extra Handling nötig

**Fix für iframe:**
```typescript
const frame = this.page.frame({ name: 'login-frame' }); // Frame Name finden!
await frame.fill('#username', config.DFBNET_USERNAME);
```

---

#### Problem 2: "Element not visible"
```
Error: Element is not visible
```

**Lösung:**
- Element ist hinter Popup/Banner → Erst schließen
- Element lädt verzögert → Mit `waitForSelector` warten

**Fix:**
```typescript
// Warten bis Element sichtbar ist
await this.page.waitForSelector('#username', { state: 'visible' });
await this.page.fill('#username', config.DFBNET_USERNAME);
```

---

#### Problem 3: "Navigation timeout"
```
Error: Timeout exceeded while navigating
```

**Lösung:**
- DFBnet ist langsam → `page.goto()` Timeout erhöhen
- Network Issues → Retry Logic hinzufügen

**Fix:**
```typescript
await this.page.goto(config.DFBNET_BASE_URL, {
  timeout: 60000, // 60 Sekunden
  waitUntil: 'networkidle', // Warten bis Network idle
});
```

---

#### Problem 4: "Login failed - Captcha detected"
**Lösung:**
- Captcha manuell lösen (Headed Mode)
- ODER: `page.pause()` verwenden und manuell eingreifen

**Fix:**
```typescript
// Nach Login Button, vor waitForSelector:
logger.info("Pausing for manual intervention (if needed)...");
await this.page.pause(); // Browser pausiert, du kannst manuell weiterklicken
```

---

## 🚀 Phase 4.4: Spielerpass-Formular Automation

### Schritt 1: Formular-Seite finden

**Nach Login:**
1. Navigiere manuell zu "Spielerpass beantragen"
2. Notiere die URL (z.B. `/spielerverwaltung/spielerpass/neu`)
3. Notiere alle Form Fields mit DevTools

**Beispiel Form Fields:**
- `input[name="player_name"]` → Spieler Name
- `input[name="birth_date"]` → Geburtsdatum
- `select[name="team"]` → Team Dropdown
- `input[type="file"]` → Photo Upload

---

### Schritt 2: Navigation implementieren

**In `dfbnet-bot.ts`:**

```typescript
/**
 * Navigiert zum Spielerpass-Formular
 */
private async navigateToSpielerpassForm() {
  if (!this.page) throw new Error("Browser not initialized");

  logger.info("Navigating to Spielerpass form...");

  // Option A: Direkter Link
  await this.page.goto(`${config.DFBNET_BASE_URL}/spielerverwaltung/spielerpass/neu`);

  // Option B: Durch Navigation klicken
  // await this.page.click('a[href*="spielerverwaltung"]');
  // await this.page.click('text=Spielerpass beantragen');

  // Warten bis Form geladen
  await this.page.waitForSelector('form[name="spielerpass-form"]', {
    timeout: 10000,
  });

  logger.info("✅ Form loaded");
}
```

---

### Schritt 3: Formular füllen

**Field Mapping:**

```typescript
/**
 * Füllt Formular mit Registrierungsdaten
 */
private async fillForm(registration: Registration) {
  if (!this.page) throw new Error("Browser not initialized");

  logger.info("Filling form fields...");

  // 1. Spieler Name
  await this.page.fill('input[name="player_name"]', registration.player_name);

  // 2. Geburtsdatum (Format: DD.MM.YYYY)
  const birthDate = new Date(registration.player_birth_date);
  const formattedDate = birthDate.toLocaleDateString('de-DE');
  await this.page.fill('input[name="birth_date"]', formattedDate);

  // 3. DFB-ID (falls vorhanden)
  if (registration.player_dfb_id) {
    await this.page.fill('input[name="dfb_id"]', registration.player_dfb_id);
  }

  // 4. Team Dropdown auswählen
  await this.page.selectOption('select[name="team"]', {
    label: registration.team.name, // ODER value: registration.team.dfbnet_id
  });

  // 5. Registrierungsgrund
  const reasonMap: Record<string, string> = {
    'NEW_PLAYER': 'Neuer Spieler',
    'TRANSFER': 'Vereinswechsel',
    'RE_REGISTRATION': 'Wiederanmeldung',
  };
  await this.page.selectOption('select[name="reason"]', {
    label: reasonMap[registration.registration_reason],
  });

  // 6. Vorverein (falls Transfer)
  if (registration.registration_reason === 'TRANSFER') {
    await this.page.fill(
      'input[name="previous_club"]',
      registration.player_data.previous_club_name
    );

    await this.page.fill(
      'input[name="deregistration_date"]',
      new Date(registration.player_data.deregistration_date).toLocaleDateString('de-DE')
    );
  }

  // 7. File Upload (Photo)
  // await this.page.setInputFiles('input[type="file"][name="photo"]', './path/to/photo.jpg');

  logger.info("✅ Form filled");
}
```

---

### Schritt 4: Dropdown Handling

**Wenn Dropdown kompliziert ist (z.B. Custom Select):**

```typescript
// Click to open dropdown
await this.page.click('div[data-dropdown="team"]');

// Wait for options to appear
await this.page.waitForSelector('li[data-team-id]');

// Click specific option by text
await this.page.click(`li:has-text("${registration.team.name}")`);
```

---

### Schritt 5: File Upload

**Photo Upload:**

```typescript
// Option A: Von lokalem Pfad
await this.page.setInputFiles(
  'input[type="file"]',
  './screenshots/player-photo.jpg'
);

// Option B: Von Supabase Storage (erst downloaden)
const photoBuffer = await this.downloadFromStorage(registration.photo_path);
const tempPath = `./temp/${registration.id}.jpg`;
await fs.writeFile(tempPath, photoBuffer);
await this.page.setInputFiles('input[type="file"]', tempPath);
```

---

## 🎯 Phase 4.5: Visual Regression Testing

### Schritt 1: Baseline erstellen

**Einmalig ausführen (Headed Mode):**

```typescript
// Formular komplett ausfüllen
await this.fillForm(registration);

// Screenshot VOR Submit
const screenshotPath = `./baselines/${registration.id}_baseline.png`;
await this.page.screenshot({
  path: screenshotPath,
  fullPage: true
});

logger.info(`📸 Baseline created: ${screenshotPath}`);
```

**Baseline manuell prüfen:**
- Screenshot öffnen
- Sicherstellen dass Form korrekt gefüllt ist
- Keine Error Messages sichtbar
- Submit Button ist da (aber NICHT geklickt!)

---

### Schritt 2: Pixelmatch Vergleich

**Implementierung in `compareWithBaseline()`:**

```typescript
import fs from 'fs/promises';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

private async compareWithBaseline(
  actualPath: string,
  registrationId: string
): Promise<number> {
  const baselinePath = `${this.config.baselineDir}/${registrationId}_baseline.png`;

  // Check if baseline exists
  try {
    await fs.access(baselinePath);
  } catch {
    logger.warn(`No baseline found for ${registrationId}, skipping comparison`);
    return 0.0; // No baseline = assume OK
  }

  // Load images
  const baseline = PNG.sync.read(await fs.readFile(baselinePath));
  const actual = PNG.sync.read(await fs.readFile(actualPath));

  // Ensure same dimensions
  if (baseline.width !== actual.width || baseline.height !== actual.height) {
    throw new Error('Image dimensions do not match!');
  }

  // Create diff image
  const diff = new PNG({ width: baseline.width, height: baseline.height });

  // Compare pixels
  const numDiffPixels = pixelmatch(
    baseline.data,
    actual.data,
    diff.data,
    baseline.width,
    baseline.height,
    { threshold: 0.1 } // Pixel difference threshold
  );

  // Calculate diff score (0.0 - 1.0)
  const totalPixels = baseline.width * baseline.height;
  const diffScore = numDiffPixels / totalPixels;

  logger.info(`Visual diff: ${(diffScore * 100).toFixed(2)}% (${numDiffPixels} pixels)`);

  // Save diff image (if significant difference)
  if (diffScore > config.VISUAL_DIFF_THRESHOLD) {
    const diffPath = `${this.config.screenshotDir}/${registrationId}_diff.png`;
    await fs.writeFile(diffPath, PNG.sync.write(diff));
    logger.warn(`Diff image saved: ${diffPath}`);
  }

  return diffScore;
}
```

---

### Schritt 3: Threshold konfigurieren

**In `.env`:**
```env
# Visual Regression Threshold
VISUAL_DIFF_THRESHOLD=0.002  # 0.2% = sehr streng
# VISUAL_DIFF_THRESHOLD=0.01  # 1.0% = moderat
# VISUAL_DIFF_THRESHOLD=0.05  # 5.0% = locker
```

**Testen:**
1. Baseline erstellen (einmaliger Run)
2. Bot nochmal laufen lassen
3. Wenn Diff Score > Threshold → Error werfen
4. Threshold anpassen bis es passt

---

## 🚀 Phase 4.6: Production Ready Machen

### 1. Retry Logic

**In `processRegistration()`:**

```typescript
async processRegistration(registration: Registration) {
  const maxRetries = config.BOT_MAX_RETRIES;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      attempt++;
      regLogger.info(`Attempt ${attempt}/${maxRetries}`);

      await this.initialize();
      await this.login();
      // ... rest of flow

      return; // Success!
    } catch (error: any) {
      regLogger.error(`Attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        // Final attempt failed
        throw new Error(`All ${maxRetries} attempts failed`);
      }

      // Wait before retry (exponential backoff)
      const waitTime = Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30s
      regLogger.info(`Retrying in ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    } finally {
      await this.close();
    }
  }
}
```

---

### 2. Error Screenshots

**Bei Fehler Screenshot erstellen:**

```typescript
try {
  await this.fillForm(registration);
} catch (error) {
  // Save error screenshot
  const errorPath = `${this.config.screenshotDir}/${registration.id}_error.png`;
  await this.page.screenshot({ path: errorPath });
  logger.error(`Error screenshot saved: ${errorPath}`);
  throw error;
}
```

---

### 3. Supabase Integration

**In `processRegistration()`:**

```typescript
const executionId = randomUUID();

// 1. Create RPA Trace (START)
await supabase.createRPATrace({
  registration_id: registration.id,
  execution_id: executionId,
  status: 'IN_PROGRESS',
  started_at: new Date().toISOString(),
});

try {
  // ... Bot Processing ...

  // 2. Upload Screenshot to Supabase Storage
  const screenshotBuffer = await fs.readFile(screenshotPath);
  const storagePath = await supabase.uploadScreenshot(
    'rpa-screenshots',
    `${registration.id}_${executionId}.png`,
    screenshotBuffer
  );

  // 3. Update RPA Trace (SUCCESS)
  await supabase.updateRPATrace(executionId, {
    status: 'SUCCESS',
    completed_at: new Date().toISOString(),
    screenshot_actual: storagePath,
    visual_diff_score: diffScore,
  });

  // 4. Update Registration Status
  await supabase.updateRegistrationStatus(registration.id, 'COMPLETED');

} catch (error: any) {
  // Update RPA Trace (FAILED)
  await supabase.updateRPATrace(executionId, {
    status: 'FAILED',
    completed_at: new Date().toISOString(),
    error_message: error.message,
  });

  throw error;
}
```

---

## 📦 Production Deployment

### 1. Windows VPS Setup

**Requirements:**
- Windows Server 2019+
- Node.js 20+
- Git

**Installation:**
```powershell
# Clone Repo
git clone <repo-url>
cd CFB-Pass-Automation

# Install Dependencies
npm install

# Build Bot
cd apps/rpa-bot
npm run build

# Copy .env.example to .env
cp .env.example .env

# Edit .env with production credentials
notepad .env
```

---

### 2. Environment Variables (Production)

**`.env` auf VPS:**
```env
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DFBNET_USERNAME=production_user
DFBNET_PASSWORD=secure_password
BOT_HEADLESS=true  # Headless in Production!
LOG_LEVEL=info
```

---

### 3. Windows Task Scheduler

**Bot regelmäßig ausführen:**

1. **Task Scheduler öffnen:** `taskschd.msc`
2. **"Create Task"** klicken
3. **General Tab:**
   - Name: "CFB RPA Bot"
   - Run whether user is logged on or not: ✓
4. **Triggers Tab:**
   - New → Daily, 02:00 AM
5. **Actions Tab:**
   - Program: `node`
   - Arguments: `C:\path\to\apps\rpa-bot\dist\index.js`
   - Start in: `C:\path\to\apps\rpa-bot`

---

### 4. n8n Webhook Trigger

**Statt Cron: On-Demand via n8n:**

```typescript
// src/api/webhook.ts (Express Server)
import express from 'express';
import { DFBnetBot } from './bot/dfbnet-bot.js';

const app = express();
app.use(express.json());

app.post('/trigger-bot', async (req, res) => {
  const { registrationId } = req.body;

  // Validate request (API Key, etc.)
  if (req.headers['x-api-key'] !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Trigger bot for specific registration
  // ... (Implementation)

  res.json({ success: true, executionId: 'xxx' });
});

app.listen(3001, () => {
  console.log('Bot API running on :3001');
});
```

---

## 🧪 Testing Checklist

### Pre-Deployment Tests

- [ ] Login funktioniert (Headed Mode)
- [ ] Form wird korrekt gefüllt
- [ ] Screenshot wird erstellt
- [ ] Visual Regression erkennt Änderungen
- [ ] Error Handling funktioniert
- [ ] Retry Logic funktioniert (3x)
- [ ] Supabase Updates funktionieren
- [ ] Logs werden geschrieben
- [ ] Headless Mode funktioniert

### Production Tests

- [ ] VPS hat Node.js installiert
- [ ] .env mit Production Credentials
- [ ] Task Scheduler läuft
- [ ] Logs sind lesbar (`./logs/bot.log`)
- [ ] Screenshots werden gespeichert
- [ ] Supabase Storage funktioniert
- [ ] n8n Webhook trigger funktioniert

---

## 🆘 Troubleshooting

### Bot stürzt sofort ab

**Check:**
```bash
cd apps/rpa-bot
npm run dev  # Siehe Console Output
```

**Häufige Ursachen:**
- `.env` fehlt oder falsch
- Playwright nicht installiert: `npx playwright install chromium`
- Port bereits belegt (wenn Express läuft)

---

### Login schlägt fehl

**Debug:**
1. Headed Mode aktivieren: `BOT_HEADLESS=false npm run dev`
2. Screenshot bei Login erstellen
3. Selektoren nochmal prüfen (DevTools)
4. Timeout erhöhen (DFBnet langsam)

---

### Visual Regression zu sensitiv

**Threshold anpassen:**
```env
# Von 0.2% auf 1.0% erhöhen
VISUAL_DIFF_THRESHOLD=0.01
```

**Baseline neu erstellen:**
- Alte Baseline löschen
- Bot einmal laufen lassen (erstellt neue Baseline)

---

## 📚 Weiterführende Links

- **Playwright Docs:** https://playwright.dev/docs/intro
- **Pixelmatch Docs:** https://github.com/mapbox/pixelmatch
- **Supabase Storage:** https://supabase.com/docs/guides/storage
- **Winston Logger:** https://github.com/winstonjs/winston

---

## ✅ Success Criteria

**Phase 4 ist abgeschlossen wenn:**
- [ ] Bot kann sich in DFBnet einloggen
- [ ] Bot kann Spielerpass-Formular ausfüllen
- [ ] Visual Regression Detection funktioniert (< 0.2% Threshold)
- [ ] Supabase Integration vollständig
- [ ] Production Deployment auf Windows VPS
- [ ] n8n Webhook Trigger implementiert
- [ ] 3/3 Test-Registrierungen erfolgreich

---

**Erstellt:** 2026-03-06
**Autor:** Claude (Agent A - Architect)
**Version:** 1.0
