import artistsJson from '../content/artists.json';
import eventsJson from '../content/events.json';
import locationsJson from '../content/locations.json';
import productsJson from '../content/products.json';
import alertsJson from '../content/alerts.json';
import faqJson from '../content/faq.json';
import type { Alert, Artist, FaqItem, FestivalEvent, I18n, Location, Product } from './types';

export const artists = artistsJson.artists as unknown as Artist[];
export const events = (eventsJson.events as unknown as FestivalEvent[]).slice().sort((a, b) => a.start.localeCompare(b.start));
export const programIsDemo = eventsJson._meta.status === 'demo';
export const locations = locationsJson.locations as unknown as Location[];
export const products = productsJson.products as unknown as Product[];
export const alerts = alertsJson.alerts as unknown as Alert[];
export const faq = faqJson.items as FaqItem[];
export const faqCategories = faqJson.categories as { id: string; name: I18n }[];

export const artistBySlug = (slug: string | null) => artists.find((a) => a.slug === slug);
export const locationById = (id: string) => locations.find((l) => l.id === id);
export const productBySlug = (slug: string) => products.find((p) => p.slug === slug);
export const eventsForArtist = (slug: string) => events.filter((e) => e.artistSlug === slug);

/** Tytuł wydarzenia: własny lub nazwa artysty. */
export function eventTitle(e: FestivalEvent, lang: 'pl' | 'en'): string {
  if (e.title) return e.title[lang];
  return artistBySlug(e.artistSlug)?.name ?? '[DO UZUPEŁNIENIA]';
}

/** Dni festiwalu jako klucze YYYY-MM-DD (strefa Europe/Warsaw). */
export const festivalDays = ['2026-08-14', '2026-08-15', '2026-08-16'];

/** Dzień programu, do którego należy wydarzenie (nocne koncerty po północy zaliczamy do poprzedniego dnia). */
export function eventDay(e: FestivalEvent): string {
  return e.start.slice(0, 10);
}
