# CLAUDE.md: zasady projektu Hortex redesign

Koncepcja redesignu hortex.pl do portfolio. Działający prototyp, **nie** zastępuje obecnej strony.
Projekt nieoficjalny: `noindex` wszędzie, logo i nazwy należą do Hortex, dane produktów i ilustracje są przykładowe.

## Stack

- Astro (statyczny build, `trailingSlash: 'always'`, `build.format: 'directory'`), minimum JS.
- Dane: `content/*.json` (bez CMS). Dostęp i helpery w `src/lib/data.ts`.
- Style: `src/styles/tokens.css` (tokeny) + `src/styles/global.css` (baza i komponenty wspólne) + style scoped w komponentach.
- Ruch: GSAP 3.15 (ScrollTrigger, SplitText, Flip, CustomEase, MotionPath) w `src/scripts/motion/`.
- Obrazy: generowane ilustracje SVG w docelowych proporcjach (`src/lib/art.ts`), adresy tylko przez `src/lib/images.ts`.

## Struktura i URL-e (nie zmieniać)

Menu główne: Produkty, Przepisy, Porady, O nas, Aktualności, Kariera, Kontakt. Slugi 1:1 z hortex.pl:
`/produkty/`, `/produkty/<slug>/`, `/kategorie-produktow/<slug>/`, `/przepisy/`, `/przepisy/<slug>/`,
`/kategorie-przepisow/<slug>/`, `/porady/`, `/aktualnosci/`, `/o-nas/`, `/kariera/`, `/kontakt/`, `/en/`.
Jedyna nowa sekcja: `/dla-biznesu/` (+ `/dla-biznesu/katalogi/`). `/aktualnosci/katalogi-hortex/` → 301 do katalogów.
Filtry list trzymają stan w parametrach URL (`?czas=30&dieta=wege`), kategorie przepisów to osobne URL-e.

## Design

- Tło ciepły beż `--c-bg`, tekst `--c-ink` (prawie czarny z zielenią), jeden kolor marki `--c-brand`
  w dwóch rolach: duże płaszczyzny (pasy sekcji, stopka) i akcenty UI (CTA, aktywny filtr, link).
  Wartości koloru marki są robocze, docelowe z brandbooka Hortex.
- Tony kategorii `--tint-<slug>` jako bardzo jasne tła sekcji.
- Kontener 1440 px, marginesy `--gutter` = `clamp(16px, 4vw, 64px)`, odstępy sekcji `--s-section`, krok 8 px.
- Karty bez cieni i ramek: zdjęcie + podpis, hover = ruch zdjęcia. Zaokrąglenia: 4 px zdjęcia, pełne chipy.
- **Zawsze tokeny, nigdy wartości na sztywno** (wyjątek: kolory wewnątrz ilustracji SVG i moduł kampanii).

## Typografia

- Tylko bezszeryfowe: Bricolage Grotesque (nagłówki) + Inter (treść). Fonty self-hosted WOFF2 w `public/fonts/`,
  `latin` + `latin-ext` przycięty do polskich znaków (pyftsubset), `font-display: swap`, preload tylko Bricolage latin,
  fallback z `size-adjust`.
- Skala płynna `--fs-display … --fs-meta`. Nagłówki `text-wrap: balance`, akapity `pretty`.
- `tabular-nums` w tabelach odżywczych i specyfikacjach.
- **Sierotki:** każdy tekst z danych przepuszczaj przez `t()` / `fixOrphans()` z `src/lib/data.ts`
  (twarda spacja po a, i, o, u, w, z i między liczbą a jednostką). W szablonach pisz `z&nbsp;natury`, `450&nbsp;g`.
- Cudzysłowy „…”, półpauza w zakresach (2–2,5 kg), przecinek dziesiętny (`num()`, `formatQty()`).
- `hyphens: auto` tylko w wąskich kolumnach tekstu (`.hyphenate`), nigdy w nagłówkach.
- Nie używamy długiej pauzy „—” w treściach.

## Ruch (GSAP)

- Animujemy tylko `transform`, `opacity`, `clip-path`.
- Element LCP (packshot, składniki w hero) widoczny od pierwszej klatki: animujemy skalę, nie wejście z opacity 0.
- Wszystko przez `gsap.matchMedia()` w `src/scripts/motion/index.ts`: desktop / mobile / `prefers-reduced-motion`
  (wariant pusty: statyczne kompozycje z CSS).
- Krzywa `hortex` (CustomEase) i trzy czasy: 0.4 s UI, 0.8 s reveal, 1.2 s hero (`D` w `gsap.ts`).
- Uwaga: GSAP wchłania CSS `translate`/`rotate` do własnych `x/y/rotation`. Elementy animowane centruj marginesem
  albo używaj wartości względnych (`'+=…'`). Intro i scroll na osobnych elementach.
- Pin tylko na desktopie i najwyżej ~1 ekran. B2B (tabele, formularze) ma ruch minimalny.
- Atrybuty: `data-hero-visual`, `data-hero-pin`, `data-reveal`, `data-split`, `data-motif="warzywa|owoce|zupy|dania|lody"`,
  `data-piece`, `data-parallax`.

## Dostępność

- Kontrast AA (sprawdzone Lighthouse), `:focus-visible` na wszystkim, mega menu i filtry z klawiatury (Esc zamyka).
- Alt-y: packshot „Opakowanie: nazwa, gramatura”, ilustracje dekoracyjne `alt=""` + `aria-hidden`.
- Formularze: etykiety, komunikaty błędów przez `aria-describedby`, stan sukcesu z `role="status"`. Bez wysyłki danych.

## Jakość po każdej zmianie

```bash
npm run build
npx astro preview &            # :4321
npm run test:smoke             # ścieżki B2C/B2B, filtry, formularze, wyszukiwarka
npm run shots                  # zrzuty 375/768/1440 do screenshots/
```

Checklista: tokeny zamiast wartości na sztywno, sierotki (`t()`), alt-y, focus-visible, reduced motion, brak zmian URL-i.
