# OFCA: nowa strona festiwalofca.pl

Redesign strony Festiwalu Cyrku Współczesnego OFCA (Oleśnica, 14–16.08.2026) zbudowany według `docs/PRD.md` i `docs/strategia-komunikacji.md`. Wygląd odwzorowuje posty OFCA z social mediów (`docs/references/`), animacje są w GSAP, a strona ma interaktywną mapę festiwalu i Sklepik z koszykiem. Wszystkie podstrony istnieją w wersji PL i EN.

## Uruchomienie

```bash
npm install
npm run dev        # http://localhost:4321, z /styleguide i podglądem trybów
npm run build      # statyczny build do dist/ (+ _redirects, sitemap)
npm run preview    # podgląd buildu
npm run test       # testy jednostkowe (Vitest)
npm run check      # typy TypeScript w plikach .astro
npm run qa         # test + check + build
npm run assets     # ponowne przygotowanie zdjęć z docs/references (sharp)
```

Wymagania: Node 22+. `astro check` wymaga TypeScriptu 6 (jest w devDependencies).

### Podgląd trybów festiwalu

Tryb strony (`offseason`, `announce`, `live`, `after`) wynika z dat w `src/site.config.ts`. Na produkcji decydują tylko daty (lub `forceMode`). W `npm run dev` oraz w buildzie z `PUBLIC_MODE_PREVIEW=true` działa podgląd:

- `?mode=live` przełącza tryb i symuluje godzinę z `festival.previewAt` (dla `live`: sobota 15.08, 16:40),
- `?now=2026-08-15T21:40` ustawia dowolną chwilę,
- `?mode=auto` wraca do dat.

Wybór zostaje w `sessionStorage`, więc działa przy przechodzeniu między podstronami. W rogu ekranu jest przełącznik trybów (tylko dev/preview).

## Struktura

```
src/
  site.config.ts         daty edycji, tryby, kontakty, social
  content/*.json         artyści, program (demo), miejsca, produkty, komunikaty, FAQ
  i18n/                  adresy PL/EN i słownik interfejsu
  layouts/               BaseLayout (head, SEO, tryb, nagłówek, stopka, koszyk), InfoLayout
  views/                 widoki stron, wspólne dla PL i EN (pages/ tylko je wywołują z lang)
  components/            komponenty z PRD 8.6
  lib/                   gsap.ts, motion.ts, festival-mode.ts, pluralize.ts, ics.ts, cart.ts, plan.ts, map-client.ts, program-client.ts…
  styles/                tokens.css (jedyne źródło kolorów), global.css, patterns.css
  assets/photos/         zdjęcia wycięte z referencji (scripts/prepare-images.mjs)
  dev/styleguide.astro   podgląd komponentów i animacji (tylko dev lub PUBLIC_STYLEGUIDE=true)
redirects.json           301 ze starych adresów WordPressa
```

## Co jest zrobione (względem PRD)

**MUST**
- Design system: tokeny kolorów, typografia fluid, motywy z 8.4 (chorągiewka, zygzak, romby, szachownica, pasy namiotu, duotone przez filtry SVG, lustrzane namioty, pionowy tekst, dłoń, identyfikatory).
- Strona główna w 4 trybach: kolejność i zestaw sekcji zgodne z 7.1, tryb liczony przed pierwszym malowaniem (bez mignięcia), odliczanie z polską odmianą (`pluralizeDays()` z testami dla wszystkich przypadków z 12).
- Program: zakładki dni, łączone filtry (typ, dla dzieci, bez słów, bilet, miejsce) ze stanem w URL, link z mapy otwiera przefiltrowany program.
- Artyści: siatka plakatów w stylu ref-02 i strony artystów (terminy z programu, wideo, „Zobacz też”).
- Mapa: ilustrowany SVG, 9 warstw, pan z inercją, zoom (przyciski, Ctrl + scroll, pinch, klawiatura), karta miejsca z „Teraz tutaj / Następnie”, „Program w tym miejscu”, „Nawiguj” (Google i Apple Maps), deep link `?miejsce=`, widok listy.
- Sklepik: kategorie bez paginacji, karta produktu z wariantami, tabelą rozmiarów (modal) i galerią, koszyk w drawerze (zmiana ilości, suma, przeciąganie w dół na telefonie), makieta zamówienia z walidacją.
- Informacje praktyczne: hub, dojazd, nocleg i pole namiotowe, highline i slackline (zamiast „Slack INFO”), FAQ z wyszukiwarką i kategoriami (`FAQPage`), dostępność.
- O festiwalu, Galeria, Wolontariat, Dla artystów, Partnerzy, Kontakt (z sekcją dla mediów), 404 w stylu ref-06.
- Komunikat „Uwaga zmiana!” z `alerts.json`: pasek na górze i pełna wersja z lustrzanymi namiotami, okno `from`–`to`, `role="status"`/`"alert"`, zamknięcie zapamiętane per komunikat.
- PL i EN: osobne slugi, `hreflang`, przełącznik zachowuje podstronę.

**SHOULD / COULD, które też są**
- Mój plan (localStorage), eksport pojedynczego wydarzenia i całego planu do `.ics`, ostrzeżenie o nakładających się godzinach.
- Pasek „Teraz / Za chwilę” i dolny pasek zakładek w trybie live.
- Galeria z zakładkami Foto · Wideo · Murale i lightboxem (klawiatura, gesty), lite YouTube embed.
- Odbiór w Infopunkcie widoczny tylko w trybach `announce` i `live`.
- Baner cookies (zgody domyślnie odrzucone) i warstwa analityki: zdarzenia z PRD 10.7 trafiają do `dataLayer` tylko po zgodzie.
- SEO: `Festival`, `Organization`, `BreadcrumbList`, `Product`/`Offer`, `FAQPage`, sitemap, canonical, `_redirects` z 301.

**Poza tym etapem:** generowane obrazy OG (na razie wspólny obraz z plakatu Teatru Wernisaż), PWA, geolokalizacja, newsletter, archiwum edycji, integracja z headless WordPress/WooCommerce (PRD 10.4–10.5).

### Katalog animacji (PRD 9.2)

| ID | Status |
|---|---|
| M1 Rozciąganie osi `wdth` | nagłówki z `data-stretch` |
| M2 Kurtyna | CSS View Transitions (zygzak opada przy zmianie strony) |
| M3 Chorągiewka | `clip-path` z wcięciem + zoom zdjęcia |
| M4 Highliner | linka pod nagłówkiem, sylwetka idzie ze scrollem |
| M5 Żonglerka | loader mapy i zamówienia (MotionPathPlugin) |
| M6 Odliczanie | cyfry się przewracają, postać się kołysze |
| M7 Lustrzane namioty | komunikat i 404 |
| M8 Liczniki | sekcja „W liczbach” |
| M9 Marquee | pasy z hasłami, zwalnia na hover, pauza poza ekranem |
| M10 Do koszyka | miniatura leci łukiem, licznik podskakuje |
| M11 Drawer | koszyk i karta miejsca, przeciąganie w dół zamyka |
| M12 Mapa | inercja przy przesuwaniu, piny wyskakują przy zmianie warstwy |
| M13 Filtry | Flip w programie i Sklepiku |
| M14 Rozsypanie liter | nagłówek hero (SplitText) |

Wszystkie wtyczki rejestruje `src/lib/gsap.ts` (cięższe ładowane dopiero tam, gdzie są potrzebne). Przy `prefers-reduced-motion: reduce` zostają krótkie przenikania (≤ 200 ms), bez M2, M4, M9 i M14. Animowane są tylko `transform`, `opacity`, `clip-path` i oś `wdth`. Jeśli skrypt animacji się nie załaduje, po 2,5 s nagłówki wracają do docelowej szerokości.

## Dane i placeholdery

- Nie wymyślamy faktów. Brakujące dane mają znacznik `[DO UZUPEŁNIENIA]` (opisy artystów, kraje, godziny Infopunktu, ceny karnetów, dostawa, płatności, sprawozdania PDF, logotypy).
- **Program jest demonstracyjny** (`events.json`, `_meta.status: "demo"`): godziny, miejsca, typy i bilety służą do testów interfejsu. Strona pokazuje o tym komunikat, a dane strukturalne `Event` wyłączają się, dopóki status to `demo`.
- Rozmieszczenie miejsc na mapie jest poglądowe (opisane na mapie i w każdej karcie miejsca). Nawigacja korzysta z nazw miejsc zamiast wymyślonych współrzędnych.
- Nazwy i ceny produktów pochodzą ze Sklepiku. Rozmiary wariantów i brak XL koszulki Highline są demonstracyjne. Zamiast zdjęć produktów są ilustracje w kolorach marki.
- Zdjęcia na stronie pochodzą z referencji w `docs/references/` (skrypt `npm run assets` wycina zdjęcie z plakatu ref-02 i postać z parasolem z ref-05).

## Font Bacalar

Bacalar wymaga licencji web (PRD 14, pytanie 3), więc do czasu jej potwierdzenia stroną rządzi **Anybody** (Google Fonts, też z osią `wdth`), a tekst jest w **Inter**. Stos fontów w `tokens.css` zaczyna się od `'Bacalar'`, więc wystarczy:

1. Wgrać `public/fonts/Bacalar-Variable.woff2` (subset Latin + Latin Extended-A).
2. Dodać `@font-face` w `src/styles/global.css` (`font-display: swap`, zakres osi `font-stretch`) i `preload` w `BaseLayout.astro`.
3. Zmierzyć szerokości wersalików i podmienić tabelę `GLYPH` w `src/lib/fit.ts` (z niej liczony jest rozmiar nagłówków plakatowych, żeby słowa nie łamały się w środku). W konsoli przeglądarki:

```js
const s = Object.assign(document.createElement('span'), { style: "font-family:var(--font-display);font-weight:900;font-size:100px;font-variation-settings:'wdth' 150;position:absolute;white-space:pre" });
document.body.append(s);
console.log(JSON.stringify(Object.fromEntries([...'ABCDEFGHIJKLMNOPQRSTUVWXYZĄĆĘŁŃÓŚŹŻ0123456789!?,.:–-&'].map((c) => (s.textContent = c, [c, +(s.getBoundingClientRect().width / 100).toFixed(3)])))));
```

## Kolory i kontrast

HEX-y w `src/styles/tokens.css` są pobrane z plików referencyjnych (pomarańcz `#FE6021`, fiolet `#9E6FB5`, krem `#FFEBDD`), a kontrasty przeliczone i opisane w komentarzu. Kremowy tekst stoi tylko na `ink` albo, w dużym rozmiarze, na `orange-deep` (plakaty artystów, odliczanie). Przed produkcją porównać z brandbookiem.

## Wyniki QA (build produkcyjny)

- 109 stron, 0 błędów konsoli, brak poziomego scrolla przy 320, 375 i 1440 px, we wszystkich 4 trybach.
- axe-core: 0 naruszeń krytycznych i poważnych na wszystkich stronach PL i EN.
- Lighthouse mobile (lokalnie): Performance 90–98, Accessibility 100, Best Practices 100, SEO 100 (zamówienie ma celowo `noindex`). LCP na części podstron wynosi ok. 3 s w symulacji wolnego 4G, więc warto to jeszcze zmierzyć na docelowym hostingu.
- Testy interakcji (Playwright): warianty i brak rozmiaru, koszyk, zamówienie z walidacją, filtry programu i URL, Mój plan, mapa (klawiatura, karta, warstwy, lista), menu mobilne.
- `npm run test`: 32 testy (odmiana dni, tryby i odliczanie, .ics, konflikty planu). `npm run check`: 0 błędów.

## Otwarte pytania

Z PRD sekcja 14 (bez zmian): charakter wdrożenia, brandbook i wektory, licencja Bacalara i font tekstowy, CMS, bilety, lokalizacje i współrzędne, płatności i dostawa, liczby łączne, data edycji 2027, wymagania grantodawców.

Nowe, z realizacji:
1. Adresy profili Facebook i YouTube (w stopce jest placeholder, `site.social`).
2. Rzeczywisty program 2026, żeby zdjąć status `demo` z `events.json`.
3. Rozmiary i stany magazynowe produktów, 17. produkt ze Sklepiku, scalenie dwóch pozycji „Skarpety, romby”.
4. Czy zostawić w podtytule Sklepiku zdanie „Każdy zakup wspiera Fundację OFCA” (strategia 8.5 prosi o potwierdzenie; na razie go nie ma).
5. Data ogłoszenia edycji (`announceAt` w `site.config.ts` jest umowna).
