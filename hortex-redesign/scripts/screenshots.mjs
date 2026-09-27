// Zrzuty ekranu szablonów na 375 / 768 / 1440 px (Playwright). Użycie:
//   npm run build && npx astro preview &  →  node scripts/screenshots.mjs [baseUrl] [outDir] [widths]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const base = process.argv[2] || 'http://localhost:4321';
const out = process.argv[3] || 'screenshots';
const widths = (process.argv[4] || '375,768,1440').split(',').map(Number);
const reduce = process.env.REDUCE === '1';
const pages = (process.env.PAGES || '/,/produkty/,/kategorie-produktow/warzywa/,/produkty/mix-brokul-i-kalafior/,/przepisy/,/przepisy/placuszki-z-brokula-i-kalafiora-z-sosem-koperkowym/,/dla-biznesu/,/produkty/brokuly-rozyczki-2-5-kg/,/kontakt/,/styleguide/').split(',');

mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
let failures = 0;
for (const w of widths) {
  const page = await browser.newPage({ viewport: { width: w, height: w < 500 ? 812 : 900 }, reducedMotion: reduce ? 'reduce' : 'no-preference' });
  for (const path of pages) {
    const errs = [];
    page.removeAllListeners('pageerror');
    page.removeAllListeners('console');
    page.on('pageerror', (e) => errs.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    const res = await page.goto(base + path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    // Przewiń całą stronę, żeby odpalić reveal i motywy
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 400) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(80); }
    await page.waitForTimeout(1400);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(900);
    const name = (path === '/' ? 'home' : path.replace(/^\/|\/$/g, '').replace(/\//g, '_')) + `-${w}.png`;
    await page.screenshot({ path: `${out}/${name}`, fullPage: true });
    const status = res?.status();
    if (status !== 200 || errs.length) failures++;
    console.log(`${status} ${w}px ${path}${errs.length ? '\n  ERR: ' + errs.join('\n  ERR: ') : ''}`);
  }
  await page.close();
}
await browser.close();
process.exit(failures ? 1 : 0);
