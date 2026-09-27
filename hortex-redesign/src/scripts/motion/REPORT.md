# Raport: ruch i wydajność

Pomiar: Lighthouse 12, tryb mobile (Moto G Power, Slow 4G, 4× CPU), build statyczny serwowany z gzip
(`npm run serve:gzip`), GSAP włączony. 27.09.2026.

| Szablon | Performance | Accessibility | Best Practices | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- | --- |
| Strona główna `/` | 99 | 100 | 100 | 2,0 s | 0 | 50 ms |
| Kategoria `/kategorie-produktow/warzywa/` | 98–100 | 100 | 100 | 1,7 s | 0,014 | 10 ms |
| Produkt `/produkty/mix-brokul-i-kalafior/` | 98 | 100 | 100 | 2,1 s | 0,001 | 20 ms |
| Lista przepisów `/przepisy/` | 99 | 100 | 100 | 1,9 s | 0 | 0 ms |
| Przepis `/przepisy/placuszki-…/` | 99 | 100 | 100 | 1,7 s | 0,002 | 0 ms |
| Dla biznesu `/dla-biznesu/` | 99 | 100 | 100 | 2,2 s | 0 | 10 ms |

SEO w Lighthouse wynosi 69 celowo: prototyp ma `noindex, nofollow` i `robots.txt: Disallow: /`.
Kategoria miała 99 w Accessibility przez kolejność nagłówków (H1 → H3); poprawione ukrytym H2 „Lista produktów”.

Cele ze strategii (LCP < 2,5 s, CLS < 0,1, TBT < 200 ms, Performance 90+, Accessibility 95+) spełnione na wszystkich szablonach.

## Co pomogło

| Zmiana | Efekt |
| --- | --- |
| Subset `latin-ext` do polskich znaków (Inter 85 KB → 5 KB, Bricolage 19 KB → 4 KB) | LCP produktu 2,7 s → 2,1 s |
| CSS wbudowany w HTML (`inlineStylesheets: 'always'`) | brak zasobów blokujących render |
| Indeks wyszukiwarki jako `/search.json` ładowany przy otwarciu | −11 KB HTML na każdej stronie |
| Intro hero bez `opacity: 0` (tylko skala i pozycja) | składniki mogą być elementem LCP na mobile bez kary |
| Kontrast tekstów w stopce na zielonym tle podniesiony do AA | Accessibility 97 → 100 |

## Moduły ruchu

| Moduł | Gdzie | Reduced motion |
| --- | --- | --- |
| `heroIngredients.ts` | hero strony głównej (pin + scrub na desktopie, parallax na mobile) | statyczna kompozycja z CSS |
| `categoryMotifs.ts` | nagłówki kategorii, kafle na home, sekcja składników na karcie produktu, O nas, kampania | kompozycja bez ruchu |
| `imageReveal.ts` | karty przepisów, aktualności, zdjęcia sekcji | zdjęcia od razu widoczne |
| `headingSplit.ts` | H2 sekcji z `data-split` (SplitText, maska linii) | brak |
| `listFlip.ts` | filtry produktów, przepisów, „Co masz w zamrażarce?” | natychmiastowa zmiana |
| `parallax.ts` | dekoracyjne składniki w sekcji O nas | brak |
| `micro.ts` | „Dodaj do zapytania”, licznik w headerze, checklista składników | tylko zmiana stanu |

Porównanie z obecną hortex.pl: do wykonania poza kontenerem (brak dostępu sieciowego do hortex.pl w środowisku budowy).
