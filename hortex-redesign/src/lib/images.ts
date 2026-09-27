/**
 * Jedno miejsce z adresami obrazów. Dziś wskazuje na ilustracje zastępcze (SVG),
 * po sesji zdjęciowej podmieniamy na AVIF/WebP z <Picture> bez zmian w szablonach.
 */
export const img = {
  pack: (slug: string) => `/img/pack/${slug}.svg`,
  ing: (key: string) => `/img/ing/${key}.svg`,
  dish: (slug: string, ratio: '3x2' | '4x5' | '1x1' = '3x2') => `/img/dish/${slug}-${ratio}.svg`,
  scene: (name: string) => `/img/scene/${name}.svg`,
  cat: (slug: string) => `/img/cat/${slug}.svg`,
  path: (p: string) => `/img/${p}.svg`,
};

export const RATIO = {
  pack: { w: 400, h: 500 },
  ing: { w: 200, h: 200 },
  '3x2': { w: 1200, h: 800 },
  '4x5': { w: 800, h: 1000 },
  '1x1': { w: 900, h: 900 },
  wide: { w: 1600, h: 900 },
  ultra: { w: 2100, h: 900 },
} as const;
