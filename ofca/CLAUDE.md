# OFCA: redesign festiwalofca.pl

Redesign strony Festiwalu Cyrku Współczesnego OFCA (Oleśnica, 14–16.08.2026). Wygląd ma odwzorowywać styl postów social media OFCA, animacje w GSAP, interaktywna mapa festiwalu i sklepik z merchem.

## Dokumenty (czytaj przed pracą)
- `docs/PRD.md`: zakres, wymagania, design system, motion, stack, dane seed, kryteria akceptacji, plan etapów (sekcja 13).
- `docs/strategia-komunikacji.md`: ton, zasady języka, copy i mikrocopy.
- `docs/references/`: referencje wizualne (opis każdego pliku w PRD, sekcja 8.1).

## Twarde zasady
- Font główny: **Bacalar** (wersja zmienna, oś `wdth`). Font tekstowy wg PRD 8.3.
- Kolory tylko z tokenów w `src/styles/tokens.css`. Przestrzegaj zasad kontrastu z PRD 8.2.
- Copy po polsku według strategii komunikacji. **Nigdy nie używaj długiego myślnika „—”.** Półpauza „–” tylko w zakresach dat i godzin.
- Nie wymyślaj faktów (godzin, cen biletów, lokalizacji, opisów artystów). Używaj `[DO UZUPEŁNIENIA]`.
- GSAP: wtyczki rejestrowane w `src/lib/gsap.ts`, każda animacja z wariantem dla `prefers-reduced-motion`, animujemy tylko transform, opacity, clip-path i font-variation-settings.
- Dostępność WCAG 2.2 AA i mobile first (testuj 375 px i 1440 px, brak poziomego scrolla od 320 px).
- Każda strona w PL i EN.

## Workflow
1. Realizuj etapy z PRD sekcja 13 po kolei.
2. Po etapie: build, Lighthouse, axe, przegląd wizualny względem referencji.
3. Otwarte pytania z PRD sekcja 14 zgłaszaj zamiast zgadywać.
