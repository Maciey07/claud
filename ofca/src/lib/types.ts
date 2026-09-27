export type Lang = 'pl' | 'en';
export type I18n = Record<Lang, string>;

export interface Artist {
  slug: string;
  name: string;
  /** Nazwa na plakacie: [mixed case, WERSALIKI] jak w ref-02. */
  posterLines: [string, string];
  country: string | null;
  discipline: I18n | null;
  description: I18n | null;
  image: string | null;
  imageAlt: I18n | null;
  videoUrl: string | null;
  links: { label: string; url: string }[];
  editions: number[];
}

export type EventType = 'street' | 'stage' | 'workshop' | 'concert' | 'fire' | 'other';

export interface FestivalEvent {
  id: string;
  artistSlug: string | null;
  title: I18n | null;
  locationId: string;
  start: string;
  end: string;
  type: EventType;
  ticket: { kind: 'free' } | { kind: 'paid'; url: string | null; price: string | null };
  forKids: boolean;
  noLanguage: boolean;
  minAge: number | null;
}

export type LocationType =
  | 'stage' | 'street' | 'highline' | 'food' | 'info' | 'wc' | 'firstaid'
  | 'camping' | 'mural' | 'parking' | 'club' | 'workshop' | 'fire';

export type MapLayer = 'stages' | 'highline' | 'food' | 'info' | 'firstaid' | 'camping' | 'murals' | 'parking' | 'access';

export interface Location {
  id: string;
  name: I18n;
  type: LocationType;
  layers: MapLayer[];
  description: I18n;
  map: { x: number; y: number };
  geo?: { lat: number; lng: number };
  navQuery?: string;
  accessibility?: I18n;
  amenities?: string[];
}

export type ProductCategory = 'odziez' | 'torby' | 'przypinki-magnesy' | 'akcesoria';
export type BrandColor = 'orange' | 'lilac' | 'cream' | 'ink' | 'white' | 'mint';

export interface ProductArt {
  kind: 'tee' | 'mug' | 'magnet' | 'lettering' | 'pin-tent' | 'pin-text' | 'socks' | 'tote';
  bg: BrandColor;
  fg: BrandColor;
  print?: string;
  motif?: string;
  size?: 's' | 'm' | 'l';
}

export interface Product {
  slug: string;
  name: I18n;
  category: ProductCategory;
  price: number;
  art: ProductArt;
  variants: { size?: string; color?: string; sku: string; stock: number | null }[] | null;
  description: I18n;
  material: I18n;
  sizeGuide: 'tee' | 'socks' | null;
}

export interface Alert {
  id: string;
  active: boolean;
  from: string;
  to: string;
  priority: 'info' | 'change' | 'urgent';
  title: I18n;
  body: I18n;
  link?: string;
}

export interface FaqItem {
  id: string;
  category: string;
  q: I18n;
  a: I18n;
}
