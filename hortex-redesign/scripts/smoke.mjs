// Test dymny ścieżek B2C i B2B (Playwright). Wymaga działającego `astro preview`.
import { chromium } from 'playwright';
const base = process.argv[2] || 'http://localhost:4321';
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
p.on('console', (m) => m.type() === 'error' && !m.text().startsWith('Failed to load resource') && errs.push(m.text()));
p.on('response', (r) => r.status() >= 400 && errs.push(`${r.status()} ${r.url()}`));
const ok = (cond, msg) => { console.log(`${cond ? 'OK  ' : 'FAIL'} ${msg}`); if (!cond) process.exitCode = 1; };

// 1. Przepis → produkt → sklep
await p.goto(base + '/przepisy/placuszki-z-brokula-i-kalafiora-z-sosem-koperkowym/');
await p.click('[data-servings-inc]');
ok((await p.textContent('[data-servings]')) === '5', 'skalowanie porcji: 5');
ok((await p.textContent('[data-qty="450"]')).trim() === '565', 'skalowanie ilości: 450 g → 565 g');
await p.click('[data-cook-open]');
ok(await p.isVisible('[data-cook]'), 'tryb gotowania otwarty');
await p.click('[data-cook-next]');
ok((await p.locator('[data-cook-step]:not([hidden])').textContent()).includes('Krok 2'), 'tryb gotowania: krok 2');
await p.keyboard.press('Escape');
await p.click('.used-product');
await p.waitForURL('**/produkty/mix-brokul-i-kalafior/');
await p.click('.buy summary');
ok(await p.isVisible('.buy__panel'), 'produkt: panel "Gdzie kupić"');
await p.click('#tab-patelnia');
ok(await p.isVisible('#panel-patelnia'), 'zakładki przygotowania');

// 2. Filtry przepisów ze stanem w URL
await p.goto(base + '/przepisy/?dieta=weganskie');
await p.waitForTimeout(800);
ok((await p.textContent('[data-filter-count]')).startsWith('1 '), 'filtr z URL: 1 przepis wegański');
await p.click('[data-param="dieta"] [data-value="weganskie"]');
await p.click('[data-param="czas"] [data-value="15"]');
await p.waitForTimeout(800);
ok(p.url().includes('czas=15') && !p.url().includes('dieta'), 'stan filtrów w URL');
await p.fill('[data-filter-search]', 'koktajl');
await p.waitForTimeout(900);
ok((await p.textContent('[data-filter-count]')).startsWith('1 '), 'wyszukiwarka listy przepisów');

// 3. Produkty: kategorie + przełącznik opakowań
await p.goto(base + '/produkty/');
await p.click('[data-param="opakowanie"] [data-value="gastronomiczne"]');
await p.waitForTimeout(800);
ok((await p.textContent('[data-filter-count]')).startsWith('12'), 'opakowania gastronomiczne: 12');

// 4. B2B: dodaj do zapytania → formularz → sukces
await p.goto(base + '/dla-biznesu/');
await p.click('tr [data-inquiry-add="brokuly-rozyczki-2-5-kg"]');
await p.click('tr [data-inquiry-add="frytki-proste-2-5-kg"]');
ok((await p.textContent('[data-inquiry-count]')) === '2', 'licznik zapytania w headerze: 2');
ok((await p.locator('[data-inquiry-list] li').count()) === 2, 'lista zapytania w formularzu');
await p.click('[data-submit]');
ok(await p.locator('.field[data-invalid]').count() > 0, 'walidacja: błędy przy pustym formularzu');
await p.fill('#q-company', 'Bistro Testowe');
await p.selectOption('#q-type', 'Restauracja');
await p.selectOption('#q-region', 'łódzkie');
await p.fill('#q-name', 'Jan Test');
await p.fill('#q-email', 'jan@example.com');
await p.fill('[data-volume="brokuly-rozyczki-2-5-kg"]', '100 kg');
await p.check('input[name="consent"]');
await p.click('[data-submit]');
await p.waitForSelector('[data-inquiry-success]:not([hidden])');
ok((await p.textContent('[data-summary]')).includes('100 kg'), 'zapytanie: stan sukcesu z wolumenem');

// 5. Kontakt: temat z URL
await p.goto(base + '/kontakt/?temat=skup');
ok(await p.isVisible('[data-route="skup"]'), 'kontakt: routing tematu skup');

// 6. Wyszukiwarka globalna
await p.goto(base + '/');
await p.keyboard.press('/');
await p.fill('[data-search-input]', 'kurki');
ok((await p.locator('[data-search-results] li a').count()) >= 2, 'wyszukiwarka: produkty z "kurki"');
await p.click('[data-scope="przepisy"]');
ok((await p.locator('[data-search-results] li a').count()) >= 2, 'wyszukiwarka: przepisy z "kurki"');

// 7. Mega menu z klawiatury
await p.keyboard.press('Escape');
await p.focus('[aria-controls="mega-produkty"]');
await p.keyboard.press('Enter');
ok(await p.isVisible('#mega-produkty'), 'mega menu: otwarcie z klawiatury');
await p.keyboard.press('Escape');
ok(!(await p.isVisible('#mega-produkty')), 'mega menu: Escape zamyka');

// 8. Katalog: przekierowanie starego URL
await p.goto(base + '/aktualnosci/katalogi-hortex/');
await p.waitForURL('**/dla-biznesu/katalogi/');
ok(true, 'przekierowanie /aktualnosci/katalogi-hortex/');

ok(errs.length === 0, `brak błędów JS${errs.length ? ': ' + errs.join(' | ') : ''}`);
await b.close();
