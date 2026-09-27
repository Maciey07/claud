# PRD: Redesign festiwalofca.pl

**Wersja:** 1.0 · 27.09.2026
**Właściciel:** Maciej (Webketer)
**Status:** gotowy do realizacji w Claude Code
**Powiązane dokumenty:** `docs/strategia-komunikacji.md`, `docs/references/*`, `CLAUDE.md`

Priorytety w dokumencie: **MUST** (MVP), **SHOULD** (v1.1), **COULD** (później).

---

## 0. Jak używać tego dokumentu w Claude Code

Struktura w repo:

```
/CLAUDE.md
/docs/PRD.md                      ← ten plik
/docs/strategia-komunikacji.md
/docs/references/
  ref-01-diabolo-scena.jpg        (artysta z diabolo na scenie, ciemne tło, reflektory)
  ref-02-plakat-teatr-wernisaz.jpg (plakat artysty: pomarańczowa ramka, wcięte krawędzie zdjęcia)
  ref-03-infopunkt-namiot.jpg     (namiot Infopunktu: zygzak, romby, szachownica, merch)
  ref-04-zongler-rynek.jpg        (żongler na Rynku, publiczność, dzienne światło)
  ref-05-countdown-1-dzien.jpg    (odliczanie: duże "1", archiwalne zdjęcie w duotonie)
  ref-06-uwaga-zmiana.jpg         (komunikat: fioletowe tło, lustrzane namioty w duotonie)
```

Zasady pracy:
1. Przed każdym etapem przeczytaj odpowiednią sekcję PRD i referencje wizualne.
2. Copy pisz według `strategia-komunikacji.md`. Nie wymyślaj faktów (godzin, cen biletów, lokalizacji): używaj placeholderów `[DO UZUPEŁNIENIA]`.
3. Realizuj etapy w kolejności z sekcji 13. Po każdym etapie: build, Lighthouse, axe, przegląd na 375 px i 1440 px.

---

## 1. Kontekst

**OFCA** to festiwal cyrku współczesnego (Nowego Cyrku) w Oleśnicy, organizowany przez **Fundację OFCA** (ul. Ignacego Solarza 2B, 56-400 Oleśnica).

- Pierwsza edycja: 2014. Fundacja powstała w 2015.
- Edycja 2026: **14–16.08.2026**, stare miasto w Oleśnicy (Rynek, Zamek, amfiteatr, pole namiotowe u podnóża zamku).
- Program: spektakle uliczne (familijne, otwarte) i sceniczne (zamknięte, część biletowana), warsztaty dla dzieci, strefa food trucków, klub festiwalowy „Bar Żongler”, highline nad Rynkiem i Zamkiem, pokazy ognia w amfiteatrze, coroczny mural.
- Skala (dane z obecnej strony, łącznie): 227 artystów z 22 krajów, 150+ wolontariuszy, 6 murali, 100+ godzin warsztatów, 82 unikatowe przedstawienia, ponad kilometr rozwieszonych taśm, tysiące widzów.
- Hasło z obecnej strony: **„Cyrk w mieście czy miasto w cyrku?”**
- Obecna technologia: WordPress + WooCommerce (motyw autorski, realizacja Kodefix), wersje PL/EN.
- Kanały: Facebook, Instagram (@festiwalofca), YouTube.
- Kontakt: biuro@festiwalofca.pl, media@festiwalofca.pl, sklepik@festiwalofca.pl.

---

## 2. Problem: audyt obecnej strony

| Obszar | Obserwacja | Konsekwencja |
|---|---|---|
| Nawigacja | Główne pozycje „OFCA 2026” i „Galeria” to linki `#`. Artyści, Nocleg, FAQ, Kontakt są dostępne głównie w stopce. | Użytkownik nie znajduje programu ani informacji praktycznych. |
| Strona główna | Hero z datą i akapitem tekstu. Brak CTA do programu, mapy, dojazdu, sklepiku. Brak zdjęć z festiwalu. | Strona nie sprzedaje klimatu i nie prowadzi do działania. |
| Program | Lista nazw artystów bez godzin, miejsc, filtrów. | Najważniejsze pytanie („co, gdzie, kiedy?”) zostaje bez odpowiedzi. |
| Przestrzeń festiwalu | Brak mapy. Miejsca opisane tylko w tekście. | Przyjezdni gubią się w trakcie festiwalu. |
| Sklepik | Standardowy widok WooCommerce, sortowanie na pierwszym planie, paginacja przy 17 produktach. Wizualnie odcięty od marki. | Niska atrakcyjność merchu, słaba konwersja. |
| Spójność z social media | Social: odważne kompozycje, duotone, ramki, romby, zygzaki. Strona: tego nie oddaje. | Rozjazd wizerunku między kanałami. |
| Treść i SEO | Meta opis podstrony Artyści mówi o edycji 2023. Link FAQ w wersji PL prowadzi do `/en/`. Etykieta „Slack INFO” niezrozumiała dla osób spoza środowiska. | Błędy wizerunkowe, gorsze SEO, zagubieni użytkownicy. |
| Cykl festiwalu | Strona nie zmienia komunikacji w zależności od fazy (przed, w trakcie, po, poza sezonem). | Po festiwalu strona nadal „zaprasza” na miniony termin. |

---

## 3. Cele i metryki

| Cel | KPI | Cel liczbowy |
|---|---|---|
| Szybkie znalezienie programu | Kliknięcia od strony głównej do informacji „co gra teraz / gdzie” | ≤ 2 kliknięcia; test z 5 osobami, 5/5 sukcesów |
| Orientacja w mieście | Użycie mapy w trybie live (sesje z interakcją) | Baseline po 1. edycji |
| Sprzedaż merchu | Konwersja sklepiku, średnia wartość koszyka | Wzrost względem baseline z GA4 (zmierzyć przed startem) |
| Wydajność | Lighthouse Performance (mobile), LCP, CLS, INP | ≥ 90, LCP < 2,5 s, CLS < 0,1, INP < 200 ms |
| Dostępność | WCAG 2.2 AA, axe | 0 błędów krytycznych i poważnych |
| Spójność marki | Ocena jakościowa zespołu OFCA | Strona „wygląda jak nasze posty” |

---

## 4. Użytkownicy i ich zadania (JTBD)

| Grupa | Zadanie | Kluczowa potrzeba |
|---|---|---|
| Rodzina z Oleśnicy i okolic | „Chcę wiedzieć, co dziś obejrzeć z dziećmi i gdzie to jest.” | Program dnia, filtr „dla dzieci”, mapa, WC, jedzenie |
| Fan Nowego Cyrku (przyjezdny) | „Chcę zaplanować 3 dni i nie przegapić spektakli scenicznych.” | Pełny program, bilety, „Mój plan”, nocleg |
| Społeczność: highline, slackline, żonglerka | „Chcę kupić karnet i rozbić namiot na polu.” | Info o polu namiotowym i karnetach, zasady |
| Gość zagraniczny | „I need the program and directions in English.” | Pełna wersja EN, dojazd, mapa |
| Artysta aplikujący | „Jak zgłosić swój spektakl?” | Jasna ścieżka zgłoszeń, terminy |
| Wolontariusz | „Chcę dołączyć do ekipy.” | Formularz, co zyskuję, terminy |
| Partner, sponsor, media | „Jaka jest skala i jak się skontaktować?” | Liczby, materiały prasowe, kontakt |
| Kupujący merch | „Chcę koszulkę z tej edycji, w swoim rozmiarze.” | Szybki sklep, tabela rozmiarów, dostawa |

---

## 5. Zakres

**MUST (MVP)**
- Nowy design system oparty o styl social media i font Bacalar.
- Strona główna z trybami festiwalu (sekcja 7.1).
- Program z filtrami + strony artystów.
- Interaktywna mapa festiwalu.
- Sklepik z koszykiem (drawer), wariantami i tabelą rozmiarów.
- Informacje praktyczne: dojazd, nocleg i pole namiotowe, FAQ, dostępność.
- Komponent komunikatów „Uwaga zmiana!”.
- Animacje GSAP z obsługą `prefers-reduced-motion`.
- Wersje PL i EN.

**SHOULD (v1.1)**
- „Mój plan” (ulubione spektakle, eksport .ics).
- Pasek „Teraz na festiwalu” w trybie live.
- Galeria z filtrem po latach + aftermovie.
- Generowane obrazy OG w stylu plakatów.
- Odbiór zamówień w Infopunkcie w trakcie festiwalu.

**COULD**
- PWA z cache programu i mapy offline.
- Geolokalizacja „Gdzie jestem” na mapie.
- Newsletter.
- Archiwum edycji 2016–2025 w nowym stylu.

**Poza zakresem**
- Sprzedaż biletów w obrębie strony (linkujemy do obecnego dostawcy biletów).
- Panel CMS budowany od zera (sekcja 10.4).

---

## 6. Architektura informacji

```
/                               Strona główna (tryby festiwalu)
/program                        Program: widok dni, filtry
/program/[slug-wydarzenia]      (opcjonalnie; zwykle wystarczy modal/sheet)
/artysci                        Siatka artystów edycji
/artysci/[slug]                 Strona artysty (plakat, opis, terminy, miejsca)
/mapa                           Interaktywna mapa  (?miejsce=rynek)
/info                           Hub informacji praktycznych
  /info/dojazd
  /info/nocleg                  Nocleg + pole namiotowe + karnety
  /info/highline-slackline      (zastępuje „Slack INFO”)
  /info/faq
  /info/dostepnosc
/sklepik                        Lista produktów
/sklepik/[slug]                 Produkt
/sklepik/koszyk → drawer + /sklepik/zamowienie
/sklepik/informacje             Dostawa, płatności, zwroty, reklamacje
/galeria                        Foto, wideo, murale (filtry)
/o-festiwalu                    Czym jest OFCA, historia, liczby, Fundacja, sprawozdania
/wolontariat
/dla-artystow                   Zgłoszenia
/partnerzy
/kontakt                        + sekcja dla mediów
/en/...                         Pełne lustro w EN
```

**Nawigacja główna (zawsze widoczna na desktopie):** Program · Mapa · Info · Sklepik · O festiwalu · [PL/EN] · [Koszyk z licznikiem]

**Mobile:** hamburger z pełnoekranowym menu (duże pozycje w Bacalar). W trybie live dodatkowo **dolny pasek zakładek**: Program · Mapa · Mój plan · Info.

Przekierowania 301 ze starych URL (`/czym-jest-ofca/`, `/nocleg/`, `/slack-info/`, `/zdjecia/`, `/filmy/`, `/murale-olesnickie-2/`, `/sklepik/...`) do nowych. Mapa przekierowań w `redirects.json`.

---

## 7. Wymagania funkcjonalne

### 7.1 Tryby festiwalu (MUST)

Stan strony sterowany konfiguracją dat w `site.config.ts`:

| Tryb | Kiedy | Hero i kolejność sekcji na stronie głównej |
|---|---|---|
| `offseason` | od końca edycji + 14 dni do ogłoszenia nowej | Aftermovie / galeria, „Save the date” (jeśli znana), Sklepik, Wolontariat, Dla artystów, O festiwalu |
| `announce` | od ogłoszenia daty do startu | Data + odliczanie, reveal artystów, Program (gdy gotowy), Nocleg, Sklepik |
| `live` | dni festiwalu | Pasek „Teraz / Za chwilę”, Program dnia, Mapa, Komunikaty, Info praktyczne |
| `after` | 14 dni po festiwalu | Podziękowania, galeria z edycji, merch z edycji, zapowiedź kolejnej |

Wymagania:
- Tryb można nadpisać ręcznie w konfiguracji (`forceMode`).
- Parametr podglądu `?mode=live` działa tylko w środowisku dev/preview.
- Odliczanie z poprawną polską odmianą: „został 1 dzień”, „zostały 2, 3, 4 dni” (także 22–24, 32–34…), „zostało 5 dni” (oraz 12–14, 0). Funkcja `pluralizeDays()` z testem jednostkowym.

### 7.2 Strona główna (MUST)

Sekcje (dla trybu `announce`, w pozostałych kolejność wg 7.1):
1. **Hero:** zdjęcie w ramce „chorągiewki” (sekcja 8.4), pionowe „OFCA” i „2026” przy krawędziach, data i miejsce, dwa CTA: „Zobacz program”, „Jak dojechać”.
2. **Manifest:** hasło „Cyrk w mieście czy miasto w cyrku?” + krótki tekst.
3. **Liczby:** 227 artystów, 22 kraje, 150+ wolontariuszy, 1 km taśm (animowane liczniki).
4. **Artyści edycji:** karuzela / siatka plakatów artystów.
5. **Mapa (zajawka):** mini mapa z 3 kluczowymi miejscami + CTA.
6. **Sklepik (zajawka):** 3–4 produkty + CTA.
7. **Info praktyczne:** kafle Dojazd, Nocleg, FAQ, Dostępność.
8. **Społeczność:** Wolontariat, Dla artystów, Partnerzy.
9. **Stopka:** kontakt, social, logotypy grantodawców (baner MKiDN obecny na stronie), mapa strony.

### 7.3 Program i artyści (MUST)

**Program**
- Widok podzielony na dni (zakładki: Pt 14.08 · Sob 15.08 · Nd 16.08) z domyślnie wybranym dniem bieżącym w trybie live.
- Filtry (łączone, stan w URL): miejsce, typ (uliczny, sceniczny, warsztaty, koncert, ogień), bilet (bezpłatne / biletowane), „dla dzieci”, „bez słów” (spektakle bez barier językowych).
- Widok listy (domyślny, chronologiczny) i widok siatki czasu (COULD).
- Karta wydarzenia: godzina od–do, tytuł, artysta, miejsce (link do mapy), typ, bilet (link zewnętrzny, jeśli płatne), wiek, czas trwania.
- „Mój plan” (SHOULD): dodawanie do ulubionych (localStorage), widok „Mój plan”, eksport pojedynczego wydarzenia i całego planu do .ics, ostrzeżenie o nakładających się godzinach.
- „Teraz / Za chwilę” (SHOULD, tryb live): pasek z 2–3 najbliższymi wydarzeniami i miejscami.

**Artyści**
- Siatka plakatów artystów w stylu ref-02 (ramka, nazwa w Bacalar, pionowy rok).
- Strona artysty: plakat hero, opis, kraj, dyscyplina, terminy i miejsca występów (z programu), wideo (lite YouTube embed), linki artysty, „Zobacz też”.
- Archiwum: lista poprzednich edycji (2016–2025) jako filtr lub osobny widok.

### 7.4 Interaktywna mapa festiwalu (MUST)

Koncepcja: **ilustrowana mapa starego miasta Oleśnicy w stylu marki** (nie surowa mapa Google). Ma wyglądać jak festiwalowy plakat, po którym można chodzić.

- Podkład: SVG (uproszczone kwartały, ulice, Rynek, Zamek, amfiteatr, pole namiotowe) w kolorach marki; ikony pinów w formie mini namiotów, rombów, flag.
- Warstwy (przełączniki): Sceny i spektakle · Highline · Jedzenie (food trucki) · Infopunkt i WC · Pierwsza pomoc · Nocleg i pole namiotowe · Murale · Parking · Dostępność (trasy bez barier, miejsca siedzące).
- Interakcja: pan (przeciąganie), zoom (przyciski +/−, scroll z modyfikatorem, pinch na mobile), klik w pin → karta (desktop: panel boczny; mobile: bottom sheet).
- Karta miejsca: nazwa, opis, udogodnienia, **„Teraz tutaj / Następne tutaj”** (z programu), przyciski „Program w tym miejscu” (link do przefiltrowanego programu), „Nawiguj” (deep link do Google Maps / Apple Maps z lat/lng).
- Deep linki: `/mapa?miejsce=[id]` otwiera mapę wyśrodkowaną na miejscu z otwartą kartą.
- Dostępność: równoważny **widok listy** miejsc (przełącznik Mapa / Lista), piny jako elementy fokusowalne z `aria-label`, obsługa klawiatury (Tab, Enter, Escape, strzałki do przesuwania mapy).
- COULD: geolokalizacja („Gdzie jestem”) po georeferencji SVG; tryb offline (PWA).

Lista miejsc startowych w sekcji 11.3 (współrzędne i dokładne lokalizacje do potwierdzenia z organizatorem).

### 7.5 Sklepik (MUST)

- Widok listy: siatka produktów w stylu marki (duże zdjęcia na tle kolorów marki, nazwa w Bacalar, cena), filtry kategorii jako „chipy” (Odzież · Torby · Przypinki i magnesy · Akcesoria), bez paginacji przy < 40 produktach.
- Karta produktu: galeria (zdjęcia produktowe + lifestyle z festiwalu), warianty (rozmiar, kolor), **tabela rozmiarów** (modal), opis, materiał, info o dostawie, „Dodaj do koszyka”.
- Koszyk jako **drawer** (wysuwany panel) z animacją, edycją ilości, podsumowaniem i przejściem do zamówienia.
- Zamówienie: dane, dostawa, płatność (zgodnie z obecnymi metodami WooCommerce), zgody.
- SHOULD: opcja dostawy „Odbiór w Infopunkcie” widoczna tylko w trybie `announce` i `live`.
- Informacje: dostawa, płatności, zwroty, reklamacje (przeniesione z obecnego `/sklepik/informacje/`), regulamin, polityka prywatności.
- Prototyp: produkty z pliku `products.json` (sekcja 11.2), koszyk w stanie klienta. Produkcja: patrz 10.5.

### 7.6 Informacje praktyczne (MUST)

- **Dojazd:** pociąg, samochód, parking, rower; mapa dojazdu; adresy.
- **Nocleg i pole namiotowe:** pole namiotowe u podnóża zamku (zasady, karnety, kampery, dzieci, psy: odpowiedzi z obecnego FAQ), noclegi w mieście.
- **Highline i slackline:** zastępuje „Slack INFO”. Wyjaśnienie dla laików + informacje dla społeczności (karnety, zasady bezpieczeństwa).
- **FAQ:** akordeony, wyszukiwarka, kategorie (Festiwal, Bilety, Pole namiotowe, Dzieci, Zwierzęta, Dostępność, Dla artystów). Treści przenieść z obecnego FAQ. Dane strukturalne `FAQPage`.
- **Dostępność:** informacje o dostępności miejsc, toalety, miejsca siedzące, strefy ciszy (jeśli są), kontakt w sprawie potrzeb.
- **Infopunkt:** lokalizacja (Rynek) i godziny otwarcia.

### 7.7 Galeria (SHOULD)

- Zakładki: Foto · Wideo · Murale.
- Filtr po edycji (rok), siatka masonry, lightbox z nawigacją klawiaturą i gestami.
- Wideo: lite YouTube embed (ładowanie iframe dopiero po kliknięciu).
- Murale: każdy mural z lokalizacją na mapie (warstwa „Murale”).

### 7.8 O festiwalu i Fundacja (MUST)

- Historia (od 2014), czym jest Nowy Cyrk, liczby, zespół (opcjonalnie), Fundacja OFCA, **sprawozdania finansowe** (PDF 2022, 2023, 2024, lista rozszerzalna), grantodawcy.

### 7.9 Wolontariat, Dla artystów, Partnerzy, Kontakt (MUST)

- Wolontariat: co robisz, co zyskujesz, terminy, formularz lub link.
- Dla artystów: jak aplikować, terminy, kontakt.
- Partnerzy: logotypy z podziałem na kategorie (sprawdzić wymagania grantodawców co do ekspozycji logo).
- Kontakt: adresy e-mail wg tematów (biuro, media, sklepik), dane Fundacji, sekcja dla mediów (press kit do pobrania: logo, zdjęcia, fakty).

### 7.10 Komunikaty „Uwaga zmiana!” (MUST)

- Globalny baner wzorowany na ref-06: fioletowe tło, czarny Bacalar, dwa lustrzane namioty w duotonie (wersja pełna na stronie `/program`, wersja kompaktowa jako pasek na górze).
- Treść: co się zmienia, kiedy, gdzie, alternatywa. Priorytet (info / zmiana / pilne).
- Źródło: `alerts.json` z polami `active`, `from`, `to`, `priority`.
- `role="status"` (info, zmiana) lub `role="alert"` (pilne). Możliwość zamknięcia (zapamiętane per komunikat).

### 7.11 Dwujęzyczność (MUST)

- Pełne lustro PL/EN z przełącznikiem zachowującym bieżącą podstronę.
- `hreflang`, osobne slugi EN (`/en/program`, `/en/map`, `/en/shop`).
- Treści EN nie są dosłownym tłumaczeniem (zasady w strategii komunikacji).

---

## 8. Design system

### 8.1 Referencje: co z nich bierzemy

| Plik | Co przenosimy na stronę |
|---|---|
| ref-01 diabolo, scena | Tryb „scena”: ciemne tło, kontrast reflektorów, kolorowe rekwizyty jako jedyne akcenty. Sekcje spektakli scenicznych i strony artystów. |
| ref-02 plakat „Teatr Wernisaż” | **Kluczowy wzór.** Pomarańczowa ramka, zdjęcie z wciętą górną i dolną krawędzią („chorągiewka”), pionowe „OFCA” i „2026”, nazwa w dwóch rozmiarach (mixed case + CAPS). Plakat artysty, hero. |
| ref-03 Infopunkt | Motywy: zygzak falbany namiotu, romby arlekina (fiolet na bieli), szachownica czarno-biała, pasy namiotu pomarańcz/biel. Sklepik, stopka, separatory sekcji. |
| ref-04 żongler | Fotografia reportażowa w pełnym słońcu, płytka głębia ostrości, publiczność w tle. Zdjęcia w sekcjach „klimat”. |
| ref-05 odliczanie | Pomarańczowe tło, ogromna cyfra w Bacalar, archiwalne zdjęcie wycięte i w fioletowym duotonie. Komponent odliczania. |
| ref-06 „Uwaga zmiana!” | Fioletowe tło, czarny Bacalar, lustrzane odbicie kopuł namiotów w pomarańczowym duotonie. Komunikaty, strona 404. |

### 8.2 Kolory

Wartości przybliżone z referencji. **Przed wdrożeniem pobrać dokładne HEX z plików źródłowych / brandbooka OFCA.**

```css
:root {
  --ofca-orange:      #FF5F1F; /* główne tło plakatów */
  --ofca-orange-deep: #D9480F; /* tło pod jasnym tekstem (lepszy kontrast) */
  --ofca-lilac:       #9B6DB8; /* tło komunikatów, romby */
  --ofca-cream:       #FFEFE3; /* tekst na kolorze, tła jasne */
  --ofca-ink:         #111111; /* tekst, tła „sceny” */
  --ofca-white:       #FFFFFF;
  --ofca-mint:        #4FC3A1; /* akcent rzadki: rekwizyty, przypinki, stany sukcesu */
}
```

**Zasady kontrastu (WCAG 2.2 AA), wartości orientacyjne dla powyższych HEX:**
- `ink` na `orange`: ok. 6,9:1 → dowolny tekst.
- `ink` na `lilac`: ok. 5,3:1 → dowolny tekst (zgodne z ref-06).
- `cream` na `orange`: ok. 2,7:1 → **niewystarczające**. Tylko elementy dekoracyjne lub tekst zdublowany w dostępnej formie.
- `cream` na `orange-deep`: ok. 3,8:1 → tylko duży tekst (≥ 24 px lub ≥ 18,66 px bold).
- `cream` na `lilac`: ok. 3,5:1 → tylko duży tekst.
- Tekst ciągły: `ink` na `cream`/`white` lub `cream` na `ink`.
- Po ustaleniu finalnych HEX przeliczyć kontrasty i zaktualizować tę listę.

Proporcje: pomarańcz dominuje (ok. 50%), fiolet jako drugi kolor sekcji i komunikatów (ok. 20%), krem i czerń jako neutralne, mięta punktowo (< 5%).

### 8.3 Typografia

**Font główny: Bacalar** (Mateusz Machalski / The Designers Foundry). Display sans o brutalistycznym charakterze, odwrócony kontrast, 10 szerokości + **wersja zmienna (oś szerokości)**. Obsługuje polskie znaki (Ż, Ł, Ń, Ą, Ę itd.).

- Licencja webowa: potwierdzić (The Designers Foundry, MyFonts lub Adobe Fonts). Dla samodzielnego hostingu potrzebna licencja web; Adobe Fonts ładuje przez własny skrypt (wpływ na wydajność).
- Hosting: WOFF2, subset Latin + Latin Extended-A, `font-display: swap`, `preload` dla wersji zmiennej.
- Zastosowanie: nagłówki, liczby, nawigacja, przyciski, ceny, etykiety. Najczęściej WERSALIKI; mixed case jako kontrapunkt (jak „Teatr” w ref-02).
- Oś szerokości: nagłówki hero w szerokościach rozszerzonych, etykiety w węższych. Animacja osi `wdth` to podpis ruchowy marki (sekcja 9).
- **Font tekstowy:** Bacalar nie nadaje się do długich akapitów. Parowanie z neutralnym groteskiem: propozycja domyślna **Inter** (lub Inter Tight). Alternatywa w duchu marki: inny krój Machalskiego (sprawdzić licencję). Decyzja w sekcji 14.

Skala (fluid, `clamp`):

| Token | Zastosowanie | Rozmiar |
|---|---|---|
| `--fs-mega` | cyfra odliczania, hero | clamp(6rem, 22vw, 18rem) |
| `--fs-display` | nagłówki sekcji | clamp(3rem, 9vw, 7.5rem) |
| `--fs-h2` | | clamp(2rem, 5vw, 4rem) |
| `--fs-h3` | karty, nazwy artystów | clamp(1.5rem, 3vw, 2.25rem) |
| `--fs-body` | tekst ciągły | 1.0625rem–1.125rem |
| `--fs-small` | etykiety, meta | 0.875rem |

Interlinia nagłówków 0.9–0.95, tekst 1.5–1.6. Szerokość akapitu max 65 znaków.

### 8.4 Motywy graficzne

1. **Chorągiewka** (ref-02): zdjęcie z wcięciem w kształcie V w górnej krawędzi i szczytem w dolnej.
   `clip-path: polygon(0 0, 50% 6%, 100% 0, 100% 100%, 50% 94%, 0 100%);` (głębokość wcięcia jako zmienna `--notch`).
2. **Zygzak falbany** (ref-03): separator sekcji i dolna krawędź nagłówka / menu. SVG pattern, trójkąty skierowane w dół.
3. **Romby arlekina** (ref-03): pasy dekoracyjne, tła kart produktu, loader. SVG pattern w `lilac` na `white`/`cream` lub `orange` na `cream`.
4. **Szachownica** (ref-03): podłoga sceny; stopka, tło sekcji Sklepik, stany hover.
5. **Pasy namiotu**: promieniste lub pionowe pasy pomarańcz/krem jako tło hero w trybie `offseason`.
6. **Duotone archiwalny** (ref-05, ref-06): wycięte zdjęcia archiwalne/postaci w duotonie fioletowym na pomarańczu lub pomarańczowym na fiolecie. Realizacja: przygotowane grafiki (preferowane) lub filtr SVG `feColorMatrix`.
7. **Lustrzana kompozycja** (ref-06): element odbity w pionie, tekst pośrodku.
8. **Pionowy tekst przy krawędzi** (ref-02): „OFCA” i rok w `writing-mode: vertical-rl`, obrócone.
9. **Wskazująca dłoń**: istniejący asset `finger_right.svg` z obecnej strony jako ikona linków „zobacz więcej”.
10. **Identyfikatory na smyczy** (ref-01): etykiety typu „ARTYSTA”, „WOLONTARIUSZ” jako badge kategorii.

### 8.5 Fotografia

- Reportaż: prawdziwe emocje publiczności i artystów, pełne słońce w dzień, reflektory w nocy.
- Kadry z wyraźnym rekwizytem (diabolo, piłki, ogień) i kontaktem artysty z widzami.
- Obróbka: ciepła, nasycona; bez filtrów stockowych.
- Formaty: AVIF + WebP + JPG fallback, `srcset`, wymiary w HTML (zero CLS), lazy loading poniżej pierwszego ekranu.
- Każde zdjęcie z opisowym `alt` (wytyczne w strategii komunikacji).

### 8.6 Komponenty (lista do zbudowania)

`Header` (z zygzakiem, licznik koszyka) · `MobileMenu` (pełnoekranowe) · `BottomTabBar` (live) · `Button` (primary: ink na orange / orange na ink; secondary: obrys) · `PosterCard` (ramka chorągiewki, pionowy tekst) · `ArtistPoster` · `EventCard` · `DayTabs` · `FilterChips` · `Countdown` · `AlertBanner` („Uwaga zmiana!”, 2 warianty) · `StatCounter` · `Marquee` (romby/hasła) · `SectionDivider` (zygzak, romby, szachownica) · `MapCanvas` · `MapPin` · `PlaceSheet` · `ProductCard` · `VariantPicker` · `SizeGuideModal` · `CartDrawer` · `Accordion` (FAQ) · `Lightbox` · `LiteYouTube` · `LangSwitch` · `Footer` · `NotFound`.

### 8.7 Layout

- Siatka: 12 kolumn desktop (max 1440 px), 8 tablet, 4 mobile; marginesy boczne min. 16 px na mobile; brak poziomego scrolla.
- Sekcje „pełnego koloru” (orange, lilac, ink) na przemian z kremowymi, jak przewijany feed postów.
- Kompozycje plakatowe: duże nagłówki mogą nachodzić na zdjęcia; tekst zawsze na tle zapewniającym kontrast.
- Breakpointy: 375, 768, 1024, 1440.

---

## 9. Motion (GSAP)

### 9.1 Zasady

- Ruch jak w cyrku: **napięcie → wyrzut → złapanie**. Easing z lekkim „odbiciem” w akcentach (`back.out(1.6)`, `elastic.out(1, 0.5)` punktowo), płynny `power3.out` w reszcie.
- Animacje wspierają hierarchię, nie opóźniają dostępu do treści. Treść jest czytelna bez JS.
- Czas: mikrointerakcje 150–250 ms, wejścia sekcji 500–900 ms, przejścia stron do 800 ms.

### 9.2 Katalog animacji

| ID | Gdzie | Opis | Wyzwalacz | Priorytet |
|---|---|---|---|---|
| M1 Rozciąganie | nagłówki display | Oś `wdth` Bacalara: nagłówek „rozciąga się” z wąskiego do szerokiego (jak guma akrobatki) | wejście w viewport (ScrollTrigger) | MUST |
| M2 Kurtyna | przejścia stron | Falbana z zygzakiem opada z góry i odsłania nową stronę | zmiana strony (View Transitions + GSAP) | SHOULD |
| M3 Chorągiewka | zdjęcia w ramce | `clip-path` przechodzi z prostokąta do kształtu z wcięciem, lekki zoom zdjęcia | ScrollTrigger | MUST |
| M4 Highliner | pasek postępu scrolla | Linka na górze ekranu, mała sylwetka highlinera przechodzi po niej wraz ze scrollem | scroll | SHOULD |
| M5 Żonglerka | loader, stany ładowania | 3 piłki po torze (MotionPathPlugin) | ładowanie danych | MUST |
| M6 Odliczanie | `Countdown` | Cyfra „przewraca się” (flip), duotone postać lekko się kołysze | load / co dobę | MUST |
| M7 Lustrzane namioty | `AlertBanner`, 404 | Kopuły namiotów wjeżdżają z góry i z dołu, tekst „wbija się” między nie | wejście w viewport | MUST |
| M8 Liczniki | `StatCounter` | Liczby odliczają od 0 do wartości | ScrollTrigger (raz) | MUST |
| M9 Marquee | pasy z rombami / hasłami | Poziomy przesuw, zwolnienie na hover | ciągłe, pauza poza viewportem | COULD |
| M10 Dodanie do koszyka | sklepik | Miniatura produktu „leci” łukiem do ikony koszyka (Flip / MotionPath), licznik podskakuje | klik | MUST |
| M11 Drawer | `CartDrawer`, `PlaceSheet` | Wysunięcie z inercją, przeciąganie w dół zamyka (Draggable) | klik / gest | MUST |
| M12 Mapa | `MapCanvas` | Pan z inercją (Draggable + InertiaPlugin), piny „wyskakują” sekwencyjnie przy zmianie warstwy | interakcja | MUST |
| M13 Filtry | program, sklepik | Karty przestawiają się płynnie po zmianie filtra (Flip) | zmiana filtra | SHOULD |
| M14 Rozsypanie liter | hero | SplitText: litery nagłówka spadają i łapią pozycję z odbiciem | load | COULD |

### 9.3 Wymagania techniczne

- GSAP 3.13+ (wszystkie wtyczki są darmowe): ScrollTrigger, SplitText, Flip, Draggable, InertiaPlugin, MotionPathPlugin, Observer. Rejestracja wtyczek w jednym module `lib/gsap.ts`.
- Ładowanie GSAP dopiero na stronach/wyspach, które go potrzebują; bez blokowania LCP.
- Animować tylko `transform`, `opacity`, `clip-path`, `font-variation-settings`. Zero animacji wpływających na layout.
- Sprzątanie: `gsap.context()` / `revert()` przy odmontowaniu i zmianie strony.
- **`prefers-reduced-motion: reduce`**: przez `gsap.matchMedia()`; w tym trybie brak parallaksy, brak M2/M4/M9/M14, pozostałe skrócone do prostego fade (≤ 200 ms).
- Smooth scroll (Lenis): opcjonalnie, tylko jeśli nie psuje dostępności i kotwic; domyślnie wyłączony przy reduced motion i na urządzeniach dotykowych.
- 60 fps na średniej klasy telefonie (test na throttlingu CPU 4x).

---

## 10. Technologia

### 10.1 Stack (rekomendacja)

- **Astro** (aktualna stabilna wersja) + TypeScript: statyczne strony, wyspy interaktywności, content collections, i18n routing.
- Stylowanie: CSS z tokenami (custom properties) w `styles/tokens.css`; opcjonalnie Tailwind v4 z tokenami w `@theme`.
- Stan klienta (koszyk, Mój plan, filtry): nanostores + localStorage (z obsługą braku dostępu).
- GSAP 3.13+ (sekcja 9), Lenis (opcjonalnie).
- Mapa: własny SVG + GSAP Draggable/Inertia; jeśli zoom gestem okaże się kosztowny w implementacji, dopuszczalna lekka biblioteka pan/zoom.
- OG images: generowane w buildzie (np. Satori) w stylu plakatu ref-02.
- Hosting: statyczny (Netlify / Vercel / Cloudflare Pages) lub serwer obecnego WP.

### 10.2 Struktura katalogów

```
src/
  components/        (sekcja 8.6)
  layouts/
  pages/  [pl] + en/
  content/
    artists/*.md
    events.json
    locations.json
    products.json
    alerts.json
    faq.json
  lib/
    gsap.ts  festival-mode.ts  pluralize.ts  ics.ts  cart.ts
  styles/  tokens.css  global.css  patterns.css
public/
  fonts/  images/  map/oleśnica.svg
docs/  (PRD, strategia, referencje)
```

### 10.3 Model danych

```ts
type Lang = 'pl' | 'en';
type I18n = Record<Lang, string>;

interface Artist {
  slug: string;
  name: string;
  country: string;            // ISO 3166
  discipline: I18n;           // np. żonglerka, akrobatyka, teatr ognia
  description: I18n;
  image: string;
  videoUrl?: string;
  links?: { label: string; url: string }[];
  editions: number[];         // np. [2026]
}

interface FestivalEvent {
  id: string;
  artistSlug: string;
  title: I18n;
  locationId: string;
  start: string;              // ISO, strefa Europe/Warsaw
  end: string;
  type: 'street' | 'stage' | 'workshop' | 'concert' | 'fire' | 'other';
  ticket: { kind: 'free' } | { kind: 'paid'; url: string; price?: string };
  forKids: boolean;
  noLanguage: boolean;        // bez barier językowych
  minAge?: number;
}

interface Location {
  id: string;                 // np. 'rynek'
  name: I18n;
  type: 'stage' | 'street' | 'highline' | 'food' | 'info' | 'wc' | 'firstaid'
      | 'camping' | 'mural' | 'parking' | 'club' | 'workshop';
  description: I18n;
  map: { x: number; y: number };  // współrzędne w SVG
  geo?: { lat: number; lng: number };
  accessibility?: I18n;
  amenities?: string[];
}

interface Product {
  slug: string;
  name: I18n;
  category: 'odziez' | 'torby' | 'przypinki-magnesy' | 'akcesoria';
  price: number;              // PLN brutto
  images: string[];
  variants?: { size?: string; color?: string; sku: string; stock?: number }[];
  description: I18n;
  sizeGuide?: string;
}

interface Alert {
  id: string;
  active: boolean;
  from: string; to: string;
  priority: 'info' | 'change' | 'urgent';
  title: I18n; body: I18n;
  link?: string;
}
```

### 10.4 Zarządzanie treścią

- Prototyp: pliki w `src/content`.
- Produkcja (decyzja w sekcji 14): **WordPress jako headless CMS** (zespół zna panel, zachowujemy WooCommerce) z ACF i REST API, albo lekki headless CMS. Program w trakcie festiwalu musi być edytowalny przez zespół bez deployu (rebuild przez webhook lub endpoint SSR dla `/program` i `alerts`).

### 10.5 Sklep: integracja

- Prototyp: `products.json` + koszyk po stronie klienta, checkout jako makieta.
- Produkcja (rekomendacja): **headless WooCommerce przez Store API** (`/wp-json/wc/store/v1/`): produkty, koszyk (Cart-Token), checkout. Zachowuje obecne produkty, zamówienia, płatności i regulaminy. Alternatywa: własny front koszyka + przekierowanie do natywnego checkoutu WooCommerce.

### 10.6 SEO

- Dane strukturalne: `Festival` / `Event` (każde wydarzenie z `location`, `startDate`, `offers`), `Organization` (Fundacja), `Product` + `Offer`, `FAQPage`, `BreadcrumbList`.
- Unikalne `title` i `description` per podstrona i język, `hreflang`, sitemap XML, canonical.
- Przekierowania 301 ze starych adresów (sekcja 6).
- Aktualizacja nieaktualnych meta (np. edycja 2023 na podstronie Artyści).

### 10.7 Analityka

- GA4 (lub Plausible) z consent mode; zdarzenia: `view_program`, `filter_program`, `add_to_plan`, `export_ics`, `open_place`, `navigate_click`, `view_item`, `add_to_cart`, `begin_checkout`, `purchase`, `lang_switch`.
- Baner cookies zgodny z RODO, z domyślnie odrzuconymi zgodami nieobowiązkowymi.

### 10.8 Wydajność i dostępność

- Budżet: JS początkowy ≤ 90 KB gzip na stronie głównej (GSAP ładowany warunkowo), obrazy hero ≤ 200 KB, font zmienny ≤ 120 KB po subsetowaniu (zweryfikować).
- WCAG 2.2 AA: kontrasty (8.2), fokus widoczny (obrys 3 px w `ink`/`cream`), nawigacja klawiaturą, skip link, poprawne landmarki, `lang` per język, formularze z etykietami i komunikatami błędów, cele dotyku ≥ 44 × 44 px, napisy do wideo.
- Przeglądarki: 2 ostatnie wersje Chrome, Safari (iOS i macOS), Firefox, Edge.

---

## 11. Dane startowe (seed)

Wszystkie dane oznaczone „do weryfikacji” potwierdzić z organizatorem.

### 11.1 Artyści 2026 (lista z obecnej podstrony Artyści, do weryfikacji)

My!Laika · Liam Lelarge et Kim Marro · Barbaren Barbies · Company Alud: Maelstrom · Company Alud: Tangled UP · Cie E1NZ · Zirkus Morsa · Be Flat · Rasoterra Circo · Wise Fools · Pina Polar · What is Love · Krzysztof Kostera · DomiCirco · Tripotes la Compagnie · Teatr Wernisaż

Opisy, kraje, zdjęcia: `[DO UZUPEŁNIENIA]`.

### 11.2 Produkty (z obecnego Sklepiku, stan 27.09.2026)

| Produkt | Cena | Warianty |
|---|---|---|
| Koszulka Festiwal OFCA 2026 | 85,00 zł | tak |
| Koszulka OFCA 2026 | 85,00 zł | tak |
| Koszulka OFCA Highline | 85,00 zł | tak |
| Kubek | 40,00 zł | nie |
| Magnes, pomarańczowy | 28,00 zł | nie |
| Napis OFCA, pomarańcz | 22,00 zł | nie |
| Pins namiot cyrkowy, pomarańczowy | 24,00 zł | nie |
| Pins namiot cyrkowy, zielony | 24,00 zł | nie |
| Pins napis OFCA, fioletowy | 22,00 zł | nie |
| Skarpety, cyrkowe namioty | 30,00 zł | tak |
| Skarpety, romby (2 pozycje w sklepie, do scalenia lub rozróżnienia) | 30,00 zł | tak |
| Torba festiwalowa, duża | 65,00 zł | nie |
| Torba festiwalowa, średnia | 55,00 zł | nie |
| Torba festiwalowa czarna, mała | 50,00 zł | nie |
| Torba festiwalowa, mała | 50,00 zł | nie |
| 17. produkt (strona 2 sklepu) | `[DO UZUPEŁNIENIA]` | |

### 11.3 Miejsca na mapie (do weryfikacji, bez współrzędnych)

| id | Miejsce | Typ | Co tam się dzieje |
|---|---|---|---|
| `rynek` | Rynek | street, highline | spektakle uliczne, taśmy nad Rynkiem |
| `infopunkt` | Infopunkt (Rynek) | info | informacja, merch, karnety |
| `zamek` | Zamek Książąt Oleśnickich | highline, stage | taśmy, wydarzenia `[DO UZUPEŁNIENIA]` |
| `amfiteatr` | Amfiteatr | fire, stage | pokazy ognia |
| `pole-namiotowe` | Pole namiotowe u podnóża zamku | camping | nocleg, życie festiwalowe |
| `bar-zongler` | Bar Żongler | club | klub festiwalowy z własnym programem |
| `food-trucki` | Strefa food trucków | food | jedzenie |
| `namioty-cyrkowe` | Namioty cyrkowe | stage | spektakle sceniczne `[DO UZUPEŁNIENIA]` |
| `warsztaty` | Strefa warsztatów dla dzieci | workshop | warsztaty |
| `mural-2026` | Mural 2026 | mural | `[DO UZUPEŁNIENIA]` |
| `wc-*`, `pierwsza-pomoc`, `parking-*` | | wc, firstaid, parking | `[DO UZUPEŁNIENIA]` |

### 11.4 Liczby do sekcji „Liczby”

227 artystów · 22 kraje · 150+ wolontariuszy · 6 murali · 100+ godzin warsztatów · 82 przedstawienia · 1 km+ taśm · od 2014.
(Upewnić się, czy są to dane łączne ze wszystkich edycji, i zaktualizować po edycji 2026.)

---

## 12. Kryteria akceptacji (Definition of Done)

- [ ] Wszystkie strony z sekcji 6 w PL i EN, bez błędów konsoli.
- [ ] Tryby festiwalu przełączają się poprawnie wg dat; podgląd `?mode=` działa tylko w dev.
- [ ] `pluralizeDays()` przechodzi testy dla 0, 1, 2, 4, 5, 11, 12, 14, 21, 22, 25, 101, 112.
- [ ] Program: filtry łączą się, stan w URL, link z mapy otwiera przefiltrowany program.
- [ ] Mapa: pan, zoom (mysz, klawiatura, dotyk), karty miejsc, deep link `?miejsce=`, widok listy.
- [ ] Sklepik: warianty, tabela rozmiarów, drawer koszyka, zmiana ilości, suma, przejście do zamówienia.
- [ ] Komunikat „Uwaga zmiana!” wyświetla się wg `alerts.json` i da się zamknąć.
- [ ] Wszystkie animacje z katalogu MUST działają; przy `prefers-reduced-motion` strona jest w pełni używalna bez ruchu.
- [ ] Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- [ ] axe: 0 błędów krytycznych i poważnych.
- [ ] Brak poziomego scrolla od 320 px.
- [ ] Copy zgodne ze strategią komunikacji (m.in. brak długich myślników „—”).
- [ ] Przekierowania 301 ze starych adresów.

---

## 13. Plan realizacji w Claude Code

1. **Fundament:** projekt Astro, i18n, tokeny, fonty (Bacalar + font tekstowy), layout, Header/Footer, `lib/gsap.ts`, `festival-mode.ts`, `pluralize.ts` z testami.
2. **Design system:** wzory (chorągiewka, zygzak, romby, szachownica, duotone), komponenty bazowe, strona `/styleguide` (tylko dev) z podglądem wszystkich komponentów i animacji.
3. **Strona główna** we wszystkich 4 trybach.
4. **Program i artyści** (dane seed, filtry, strony artystów).
5. **Mapa** (SVG, warstwy, karty, lista, deep linki).
6. **Sklepik** (lista, produkt, koszyk, makieta zamówienia).
7. **Info praktyczne, FAQ, O festiwalu, Galeria, Wolontariat, Partnerzy, Kontakt.**
8. **Motion pass:** pełny katalog z sekcji 9, reduced motion.
9. **SEO, analityka, przekierowania, OG images.**
10. **QA:** Lighthouse, axe, testy na urządzeniach, przegląd copy, poprawki.

---

## 14. Otwarte pytania

1. Czy projekt jest wdrożeniem produkcyjnym dla Fundacji, czy koncepcją / prototypem? (Wpływa na integrację CMS i sklepu.)
2. Dokładne kolory i pliki źródłowe identyfikacji (brandbook, wektory rombów, namiotów, dłoni, logotypu).
3. Licencja webowa Bacalara (źródło i zakres) oraz wybór fontu tekstowego.
4. CMS w produkcji: headless WordPress czy inne rozwiązanie? Kto edytuje program w trakcie festiwalu?
5. Które spektakle są biletowane i gdzie kupuje się bilety (dostawca, linki)?
6. Dokładne lokalizacje i współrzędne miejsc, godziny Infopunktu, toalety, punkty medyczne, parkingi.
7. Metody płatności i dostawy w sklepiku, próg darmowej dostawy, możliwość odbioru w Infopunkcie.
8. Czy liczby w sekcji „Liczby” to dane łączne i czy aktualizujemy je po edycji 2026?
9. Data edycji 2027 (dla trybu `offseason` / „Save the date”).
10. Wymagania grantodawców co do ekspozycji logotypów na stronie.
