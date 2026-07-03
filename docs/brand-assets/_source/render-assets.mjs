/**
 * Render brand-assets HTML templates to PNG using Playwright.
 * Ausführen aus dem Repo-Root:
 *   node docs/brand-assets/_source/render-assets.js
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const brandDir = path.resolve(__dirname, '..');

const targets = [
  {
    html: path.join(__dirname, 'favicon-32-mark.html'),
    output: path.join(brandDir, 'favicon-32.png'),
    viewport: { width: 32, height: 32 },
    deviceScaleFactor: 2,      // 2x sharp bei kleinen Rendering-Größen
    selector: '.favicon',
  },
  {
    html: path.join(__dirname, 'apple-touch-icon-180.html'),
    output: path.join(brandDir, 'apple-touch-icon-180.png'),
    viewport: { width: 180, height: 180 },
    deviceScaleFactor: 2,
    selector: '.icon',
  },
  {
    html: path.join(__dirname, 'og-image-1200x630.html'),
    output: path.join(brandDir, 'og-image-1200x630.png'),
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2,
    selector: '.og',
  },
];

const browser = await chromium.launch({ headless: true });

for (const t of targets) {
  const context = await browser.newContext({
    viewport: t.viewport,
    deviceScaleFactor: t.deviceScaleFactor,
  });
  const page = await context.newPage();
  const fileUrl = 'file:///' + t.html.replace(/\\/g, '/');
  console.log(`Rendering ${path.basename(t.output)}...`);
  await page.goto(fileUrl, { waitUntil: 'networkidle' });
  // Wait for web fonts to load and render
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.waitForTimeout(400);

  const element = await page.$(t.selector);
  if (!element) {
    console.error(`  Selector ${t.selector} not found for ${t.output}`);
    await context.close();
    continue;
  }
  await element.screenshot({ path: t.output, omitBackground: t.selector === '.favicon' });
  console.log(`  Wrote ${t.output}`);
  await context.close();
}

await browser.close();
console.log('All assets rendered.');
