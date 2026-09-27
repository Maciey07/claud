/**
 * Rozmiar nagłówka plakatowego dopasowany do najdłuższego słowa (bez łamania wyrazów).
 * Wymaga kontenera z `container-type: inline-size`. factor ≈ szerokość wersalika w em przy wdth 150.
 */
export function fitFont(text: string, maxRem: number, factor = 1.04, room = 100): string {
  return `min(${maxRem}rem, ${(room / (widestWord(text) * factor)).toFixed(2)}cqi)`;
}

/**
 * Szerokości wersalików w em przy wdth 150 i wadze 900, zmierzone w przeglądarce dla Anybody.
 * Po wgraniu Bacalara zmierzyć ponownie (skrypt w README) i podmienić tabelę.
 */
const GLYPH: Record<string, number> = { '0': 0.96, '1': 0.93, '2': 1, '3': 0.99, '4': 0.95, '5': 0.98, '6': 0.99, '7': 0.89, '8': 0.97, '9': 1, 'A': 1.19, 'B': 1.09, 'C': 1.07, 'D': 1.08, 'E': 0.95, 'F': 0.87, 'G': 1.12, 'H': 1.12, 'I': 0.5, 'J': 1.08, 'K': 1.02, 'L': 0.84, 'M': 1.4, 'N': 1.25, 'O': 1.12, 'P': 1.02, 'Q': 1.12, 'R': 1.06, 'S': 1.09, 'T': 1.06, 'U': 1.13, 'V': 1.11, 'W': 1.6, 'X': 1.09, 'Y': 1.13, 'Z': 0.99, 'Ą': 1.19, 'Ć': 1.07, 'Ę': 0.95, 'Ł': 0.91, 'Ń': 1.25, 'Ó': 1.12, 'Ś': 1.09, 'Ź': 0.99, 'Ż': 0.99, '!': 0.38, '?': 1, ',': 0.48, '.': 0.36, ':': 0.36, '–': 0.83, '’': 0.32, '-': 0.74, '&': 1.27 };

function charWidth(ch: string): number {
  return GLYPH[ch] ?? 1.12;
}

export function widestWord(text: string): number {
  return Math.max(...text.toUpperCase().split(/\s+/).map((w) => [...w].reduce((sum, ch) => sum + charWidth(ch), 0)));
}

/** Jak fitFont, ale w całości w jednostkach cqi (np. plakat skalowany z kontenerem). */
export function fitCqi(text: string, maxCqi: number, factor = 1.2, room = 100): string {
  const longest = Math.max(...text.split(/\s+/).map((w) => w.length));
  return `${Math.min(maxCqi, room / (longest * factor)).toFixed(2)}cqi`;
}
