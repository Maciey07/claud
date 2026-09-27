import type { FestivalMode } from './lib/festival-mode';

/**
 * Konfiguracja edycji. Steruje trybami strony (PRD 7.1).
 * Wszystkie daty w strefie Europe/Warsaw (zapis ISO z przesunięciem).
 */
export const festival = {
  edition: 2026,
  /** Ogłoszenie daty edycji: od tego momentu tryb `announce`. [DO UZUPEŁNIENIA] faktyczna data ogłoszenia. */
  announceAt: '2026-01-15T00:00:00+01:00',
  start: '2026-08-14T00:00:00+02:00',
  end: '2026-08-16T23:59:59+02:00',
  /** Liczba dni trybu `after` po zakończeniu festiwalu. */
  afterDays: 14,
  /** Kolejna edycja (tryb `offseason` pokazuje „Save the date”, gdy znana). PRD 14, pytanie 9. */
  next: {
    edition: 2027,
    start: null as string | null,
    end: null as string | null,
    announceAt: null as string | null,
  },
  /** Ręczne nadpisanie trybu, np. 'live'. `null` = tryb wg dat. */
  forceMode: null as FestivalMode | null,
  /** Chwila symulowana w podglądzie ?mode=… (bez ?now=). Tylko dev/preview. */
  previewAt: {
    offseason: '2026-10-15T12:00:00+02:00',
    announce: '2026-08-01T10:00:00+02:00',
    live: '2026-08-15T16:40:00+02:00',
    after: '2026-08-20T12:00:00+02:00',
  },
} as const;

export const site = {
  name: 'OFCA',
  fullName: { pl: 'Festiwal Cyrku Współczesnego OFCA', en: 'OFCA Contemporary Circus Festival' },
  url: 'https://festiwalofca.pl',
  foundation: {
    name: 'Fundacja OFCA',
    street: 'ul. Ignacego Solarza 2B',
    city: '56-400 Oleśnica',
  },
  emails: {
    office: 'biuro@festiwalofca.pl',
    media: 'media@festiwalofca.pl',
    shop: 'sklepik@festiwalofca.pl',
  },
  /** Linki do profili. `null` = adres do potwierdzenia, strona pokazuje placeholder. */
  social: {
    instagram: 'https://www.instagram.com/festiwalofca/',
    facebook: null as string | null,
    youtube: null as string | null,
  },
  /** Zewnętrzny dostawca biletów (PRD 14, pytanie 5). */
  ticketsUrl: null as string | null,
};
