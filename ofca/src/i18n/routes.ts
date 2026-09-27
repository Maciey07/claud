import type { Lang } from '../lib/types';

/** Adresy podstron w obu językach (PRD 6 i 7.11). */
export const routes = {
  home: { pl: '/', en: '/en/' },
  program: { pl: '/program', en: '/en/program' },
  artists: { pl: '/artysci', en: '/en/artists' },
  artist: { pl: '/artysci/[slug]', en: '/en/artists/[slug]' },
  map: { pl: '/mapa', en: '/en/map' },
  info: { pl: '/info', en: '/en/info' },
  travel: { pl: '/info/dojazd', en: '/en/info/getting-here' },
  stay: { pl: '/info/nocleg', en: '/en/info/accommodation' },
  highline: { pl: '/info/highline-slackline', en: '/en/info/highline-slackline' },
  faq: { pl: '/info/faq', en: '/en/info/faq' },
  access: { pl: '/info/dostepnosc', en: '/en/info/accessibility' },
  shop: { pl: '/sklepik', en: '/en/shop' },
  product: { pl: '/sklepik/[slug]', en: '/en/shop/[slug]' },
  checkout: { pl: '/sklepik/zamowienie', en: '/en/shop/checkout' },
  shopInfo: { pl: '/sklepik/informacje', en: '/en/shop/information' },
  gallery: { pl: '/galeria', en: '/en/gallery' },
  about: { pl: '/o-festiwalu', en: '/en/about' },
  volunteer: { pl: '/wolontariat', en: '/en/volunteer' },
  forArtists: { pl: '/dla-artystow', en: '/en/for-artists' },
  partners: { pl: '/partnerzy', en: '/en/partners' },
  contact: { pl: '/kontakt', en: '/en/contact' },
} as const;

export type RouteKey = keyof typeof routes;

export function href(key: RouteKey, lang: Lang, params: Record<string, string> = {}): string {
  let path: string = routes[key][lang];
  for (const [k, v] of Object.entries(params)) path = path.replace(`[${k}]`, v);
  return path;
}

/** Nazwy parametrów filtrów w URL (PL i EN). */
export const queryKeys = {
  pl: { day: 'dzien', type: 'typ', place: 'miejsce', kids: 'dzieci', nolang: 'bez-slow', ticket: 'bilet', view: 'widok' },
  en: { day: 'day', type: 'type', place: 'place', kids: 'kids', nolang: 'no-words', ticket: 'ticket', view: 'view' },
} as const;
