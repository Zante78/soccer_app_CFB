# RPA Bot - Quick Reference

**Schnellzugriff für häufige Aufgaben**

---

## 🚀 Bot starten

### Development Mode (Headed)
```bash
cd apps/rpa-bot
BOT_HEADLESS=false npm run dev
```

### Production Mode (Headless)
```bash
cd apps/rpa-bot
npm start
```

### Test Login
```bash
cd apps/rpa-bot
npx tsx src/test/test-login.ts
```

---

## 🔧 Playwright Selektoren

### Text-basiert (Einfachste)
```typescript
await page.click('text=Anmelden');
await page.click('button:has-text("Submit")');
```

### CSS Selektoren
```typescript
await page.fill('#username', 'user');
await page.fill('input[name="password"]', 'pass');
await page.click('button[type="submit"]');
```

### XPath (Komplex, aber mächtig)
```typescript
await page.click('//button[contains(text(), "Anmelden")]');
```

### Playwright Inspector (Visual Tool)
```bash
npx playwright codegen https://www.dfbnet.org
```
→ Öffnet Browser + Inspector → Klicke Elemente → Selektoren werden generiert!

---

## 📸 Screenshots debuggen

### Screenshot erstellen
```typescript
await page.screenshot({ path: 'debug.png' });
await page.screenshot({ path: 'debug.png', fullPage: true }); // Ganze Seite
```

### Video Recording
```typescript
const context = await browser.newContext({
  recordVideo: { dir: './videos/' }
});
```

### Slow Motion (Zum Debuggen)
```typescript
const browser = await chromium.launch({
  headless: false,
  slowMo: 1000 // 1 Sekunde zwischen jedem Schritt
});
```

---

## 🐛 Debugging

### Browser pausieren
```typescript
await page.pause(); // Browser friert ein, du kannst manuell klicken
```

### Console Logs sehen
```typescript
page.on('console', msg => console.log('PAGE LOG:', msg.text()));
```

### Network Requests loggen
```typescript
page.on('request', req => console.log('→', req.method(), req.url()));
page.on('response', res => console.log('←', res.status(), res.url()));
```

---

## ⏱️ Timeouts

### Globaler Timeout
```typescript
page.setDefaultTimeout(60000); // 60 Sekunden
```

### Per-Action Timeout
```typescript
await page.click('button', { timeout: 5000 }); // 5 Sekunden
await page.waitForSelector('#element', { timeout: 10000 });
```

### Navigation Timeout
```typescript
await page.goto('url', { timeout: 60000, waitUntil: 'networkidle' });
```

---

## 📝 Häufige Patterns

### Dropdown auswählen (Select)
```typescript
await page.selectOption('select[name="team"]', 'E-Junioren U11');
await page.selectOption('select[name="team"]', { value: '123' });
await page.selectOption('select[name="team"]', { index: 2 });
```

### Checkbox/Radio
```typescript
await page.check('input[type="checkbox"]');
await page.uncheck('input[type="checkbox"]');
await page.click('input[type="radio"][value="option1"]');
```

### File Upload
```typescript
await page.setInputFiles('input[type="file"]', './photo.jpg');
await page.setInputFiles('input[type="file"]', ['file1.pdf', 'file2.pdf']);
```

### Warten auf Element
```typescript
await page.waitForSelector('#element'); // Warten bis vorhanden
await page.waitForSelector('#element', { state: 'visible' }); // Sichtbar
await page.waitForSelector('#element', { state: 'hidden' }); // Versteckt
```

### Warten auf Navigation
```typescript
await Promise.all([
  page.waitForNavigation(),
  page.click('button[type="submit"]')
]);
```

---

## 🔍 Element finden

### Text enthält
```typescript
const element = await page.locator('text=Spielerpass');
const element = await page.locator('button:has-text("Anmelden")');
```

### CSS Combinator
```typescript
// Kind-Element
const child = await page.locator('form > input');

// Nachfolger
const descendant = await page.locator('form input');

// Nachbar
const sibling = await page.locator('label + input');
```

### Mehrere Elemente
```typescript
const buttons = await page.locator('button').all();
console.log(`Found ${buttons.length} buttons`);

for (const button of buttons) {
  const text = await button.textContent();
  console.log(text);
}
```

---

## 🎯 Best Practices

### 1. Stabile Selektoren verwenden
```typescript
// ❌ Fragil (CSS Klassen ändern sich)
await page.click('.btn-primary.large');

// ✅ Robust (ID/Name stabil)
await page.click('#login-button');
await page.click('button[name="submit"]');

// ✅ Sehr robust (Text)
await page.click('text=Anmelden');
```

### 2. Explizite Waits
```typescript
// ❌ Schlecht (Race Condition)
await page.click('button');
await page.click('next-button'); // Fails wenn zu schnell

// ✅ Gut (Explizites Warten)
await page.click('button');
await page.waitForSelector('next-button');
await page.click('next-button');
```

### 3. Error Handling
```typescript
try {
  await page.click('button', { timeout: 5000 });
} catch (error) {
  // Screenshot bei Fehler
  await page.screenshot({ path: 'error.png' });
  throw error;
}
```

---

## 📦 Nützliche Commands

### Playwright installieren
```bash
npm install playwright
npx playwright install chromium
```

### Codegen (Selektor Generator)
```bash
npx playwright codegen https://example.com
```

### Trace Viewer (Recording ansehen)
```bash
npx playwright show-trace trace.zip
```

### Test Reporter
```bash
npx playwright test --reporter=html
npx playwright show-report
```

---

## 🔗 Quick Links

- Playwright API: https://playwright.dev/docs/api/class-page
- Selectors Guide: https://playwright.dev/docs/selectors
- Assertions: https://playwright.dev/docs/test-assertions
- Best Practices: https://playwright.dev/docs/best-practices

---

**Last Updated:** 2026-03-06
