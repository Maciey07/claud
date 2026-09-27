# Hortex.pl: koncepcja redesignu

Działający prototyp nowej hortex.pl zbudowany z Claude Code według dokumentu „Hortex.pl: strategia redesignu”.
Projekt do portfolio: **nieoficjalny**, z `noindex`, na danych przykładowych i ilustracjach zastępczych.

## Uruchomienie

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # statyczny build do dist/ (98 stron)
npm run preview      # podgląd buildu
npm run test:smoke   # test ścieżek B2C i B2B (wymaga preview)
npm run shots        # zrzuty 375 / 768 / 1440 px do screenshots/
npm run serve:gzip   # dist/ z kompresją gzip na :4322 (do pomiarów Lighthouse)
```

Hosting: dowolny statyczny (Netlify, Cloudflare Pages, Vercel). `public/_redirects` daje prawdziwe 301
dla starego adresu katalogu, `public/_headers` dokłada `X-Robots-Tag: noindex`.

## Co jest w prototypie

| Szablon | URL | Najważniejsze decyzje ze strategii |
| --- | --- | --- |
| Strona główna | `/` | Pełnoekranowy hero „Prosto z natury” z rozkładem produktu na składniki (GSAP pin + scrub), 6 stałych kategorii z motywami ruchu, rząd „Nowości i linie sezonowe”, przepisy z szybkimi chipami, „Co masz w zamrażarce?”, jeden moduł kampanii zamiast rotatora wideo, pas B2B z faktami, O nas, 3 aktualności, gdzie kupić |
| Lista produktów | `/produkty/` | Chipy kategorii zmieniające ton tła, filtr przygotowania, przełącznik „Konsumenckie / Gastronomiczne 2–2,5 kg”, Flip przy filtrowaniu, stan w URL |
| Kategoria | `/kategorie-produktow/<slug>/` | Motyw ruchu kategorii (warzywa wysypują się z opakowania, owoce spadają z odbiciem, składniki wpadają do garnka, talerz się obraca), podkategorie jako chipy |
| Karta produktu | `/produkty/<slug>/` | Sticky packshot, „Gdzie kupić”, składniki wychodzące z opakowania, zakładki przygotowania, tabela odżywcza (100 g i porcja) z tabular-nums, alergeny, karuzela przepisów, „Spróbuj również” tylko z tej samej grupy opakowań, pasek wersji gastronomicznej, JSON-LD Product |
| Produkt HoReCa | `/produkty/<slug>-2-5-kg/` | Ten sam szablon + specyfikacja (pola bez danych oznaczone „do uzupełnienia”), „Dodaj do zapytania” |
| Lista przepisów | `/przepisy/`, `/kategorie-przepisow/<slug>/` | Wyszukiwarka, filtry czas / dieta / trudność / produkt Hortex w URL, kolekcje sezonowe, „Pokaż więcej”, miniatura użytego produktu na karcie |
| Przepis | `/przepisy/<slug>/` | Lead nad krokami, pasek meta, skalowanie porcji, checklista składników, karta użytego produktu Hortex, tryb gotowania z Wake Lock API, druk, JSON-LD Recipe |
| Dla biznesu | `/dla-biznesu/` | Segmenty, fakty, asortyment HoReCa (tabela / siatka), lista zapytania z licznikiem w headerze, formularz z wolumenami → mock endpoint → stan sukcesu |
| Katalogi | `/dla-biznesu/katalogi/` | Stała podstrona zamiast wpisu w Aktualnościach, PDF jednym kliknięciem, katalog handlowy po krótkim formularzu |
| Kontakt | `/kontakt/` | Kafle celów ustawiające temat (reklamacje z polami partii i daty, handel, skup, media, kariera, inne), karty oddziałów, link do reklamacji soków |
| Pozostałe | `/o-nas/`, `/porady/`, `/aktualnosci/`, `/kariera/`, `/en/` | Każdy link w menu prowadzi do gotowej strony |
| Styleguide | `/styleguide/` | Tokeny, skala typografii, 3 warianty krojów z polskimi znakami, komponenty we wszystkich stanach |

Wspólne: pasek „Dla domu | Dla biznesu”, mega menu Produktów i Przepisów (klawiatura + Esc), globalna wyszukiwarka
z zakładkami Produkty / Przepisy / Porady (skrót `/`), breadcrumbs z JSON-LD, sticky header chowany przy przewijaniu.

## Wydajność i dostępność

Lighthouse mobile, wszystkie 6 głównych szablonów: Performance 98–100, Accessibility 100, Best Practices 100,
LCP 1,7–2,2 s, CLS ≤ 0,014, TBT ≤ 50 ms. Szczegóły i lista optymalizacji: [`src/scripts/motion/REPORT.md`](src/scripts/motion/REPORT.md).

## Dane i obrazy

- `content/products.json` (45 produktów, w tym 12 HoReCa), `content/recipes.json` (14 przepisów),
  `content/categories.json`, `content/site.json`, `content/articles.json`. Struktura pól zgodna z fazą 0 strategii;
  wartości są przykładowe i do podmiany po inwentaryzacji.
- Zdjęcia: brak kopii z hortex.pl. `src/lib/art.ts` rysuje ilustracje zastępcze w docelowych proporcjach systemu
  fotografii (packshot 4:5, składnik 1:1, potrawa 3:2 / 4:5 / 1:1, scena 16:9, pole i zakład 21:9).
  Po sesji zdjęciowej wystarczy zmienić adresy w `src/lib/images.ts`.

## Do potwierdzenia z Hortex

Kolor marki z brandbooka, lista certyfikatów, EAN i paletyzacja HoReCa, zakres eksportu, adresy i telefony oddziałów,
treści dokumentów formalnych, prawa do logotypów sieci handlowych.

## Proces z Claude Code

Zasady projektu w [`CLAUDE.md`](CLAUDE.md). Weryfikacja: build, test dymny ścieżek (`scripts/smoke.mjs`),
zrzuty Playwright na 375 / 768 / 1440 px, Lighthouse na buildzie z gzip.
