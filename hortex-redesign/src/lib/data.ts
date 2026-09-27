import productsJson from '../../content/products.json';
import recipesJson from '../../content/recipes.json';
import categoriesJson from '../../content/categories.json';
import siteJson from '../../content/site.json';

export interface Nutrition { kj: number; kcal: number; fat: number; sat: number; carbs: number; sugars: number; fiber: number; protein: number; salt: number }
export interface Product {
  slug: string; name: string; category: string; sub?: string; weight: string; line?: string;
  pack: 'konsumenckie' | 'gastronomiczne'; isNew: boolean;
  prep: Record<string, string>; description: string;
  ingredients: { key: string; name: string; pct?: number }[];
  composition?: string; nutrition: Nutrition; portion: number;
  allergens: string[]; mayContain: string[];
  horeca?: string; consumer?: string;
  proPrep?: string; yield?: string;
  spec?: Record<string, string | null>;
}
export interface RecipeItem { qty: number | null; unit: string; name: string; product?: string }
export interface Recipe {
  slug: string; title: string; category: string; time: number; servings: number; difficulty: string;
  diet: string[]; products: string[]; dish: string; pieces: string[]; date: string; collections: string[];
  lead: string; groups: { name: string; items: RecipeItem[] }[]; steps: string[];
  tips: string[]; substitutes: string[]; allergens: string[];
}
export interface Category { slug: string; name: string; group: 'stale' | 'linie' | 'b2b'; motif: string; pieces: string[]; description: string; subcategories: string[] }

export const products = productsJson as Product[];
export const recipes = (recipesJson as Recipe[]).slice().sort((a, b) => b.date.localeCompare(a.date));
export const categories = categoriesJson as Category[];
export const site = siteJson;

export const consumerProducts = products.filter((p) => p.pack === 'konsumenckie');
export const horecaProducts = products.filter((p) => p.pack === 'gastronomiczne');

export const productBySlug = (slug: string) => products.find((p) => p.slug === slug);
export const categoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);
export const recipeBySlug = (slug: string) => recipes.find((r) => r.slug === slug);
export const recipeCategoryName = (slug: string) => site.recipeCategories.find((c) => c.slug === slug)?.name ?? slug;
export const dietName = (slug: string) => site.diets.find((d) => d.slug === slug)?.name ?? slug;

export const productsInCategory = (slug: string) => products.filter((p) => p.category === slug);

/** Przepisy z produktem; dla wariantu HoReCa bierzemy przepisy wersji konsumenckiej */
export function recipesForProduct(p: Product) {
  const slug = p.consumer ?? p.slug;
  return recipes.filter((r) => r.products.includes(slug));
}

/** "Spróbuj również": tylko ta sama grupa opakowań, najpierw ta sama kategoria */
export function relatedProducts(p: Product, n = 4) {
  const same = products.filter((x) => x.slug !== p.slug && x.pack === p.pack);
  const sameCat = same.filter((x) => x.category === p.category);
  const rest = same.filter((x) => x.category !== p.category);
  return [...sameCat, ...rest].slice(0, n);
}

export function relatedRecipes(r: Recipe, n = 3) {
  const score = (x: Recipe) => (x.category === r.category ? 2 : 0) + x.products.filter((s) => r.products.includes(s)).length * 3 + x.diet.filter((d) => r.diet.includes(d)).length;
  return recipes.filter((x) => x.slug !== r.slug).sort((a, b) => score(b) - score(a)).slice(0, n);
}

export const tintVar = (cat: string) => `var(--tint-${cat}, var(--c-sunk))`;

/* ---------- Przygotowanie ---------- */
export const PREP_LABELS: Record<string, string> = {
  patelnia: 'Patelnia',
  gotowanie: 'Gotowanie',
  piekarnik: 'Piekarnik',
  frytkownica: 'Frytkownica',
  airfryer: 'Air fryer',
  rozmrazanie: 'Rozmrażanie',
};
export const PREP_TEXT: Record<string, string> = {
  patelnia: 'Rozgrzej łyżkę oleju lub masła na patelni. Wsyp zamrożony produkt bez rozmrażania i smaż na średnim ogniu, co jakiś czas mieszając. Dopraw pod koniec smażenia.',
  gotowanie: 'Wsyp zamrożony produkt do wrzącej, lekko osolonej wody (ok. 1 l na opakowanie). Od ponownego zagotowania gotuj pod przykryciem, potem odcedź.',
  piekarnik: 'Rozgrzej piekarnik do 200°C (termoobieg 180°C). Rozłóż produkt jedną warstwą na blasze wyłożonej papierem i piecz, w połowie czasu przewracając.',
  frytkownica: 'Rozgrzej olej do 175°C. Wsyp porcję do koszyka, nie więcej niż do połowy, i smaż do złocistego koloru. Odsącz na papierze.',
  airfryer: 'Rozgrzej urządzenie do 200°C. Wsyp porcję jedną warstwą i piecz, potrząsając koszem w połowie czasu.',
  rozmrazanie: 'Rozmrażaj w lodówce w zamkniętym pojemniku. Do koktajli, sosów i ciast możesz używać owoców prosto z zamrażarki.',
};

/* ---------- Polska typografia ---------- */
const NBSP = ' ';
/** Twarda spacja po jednoliterowych słowach i między liczbą a jednostką */
export function fixOrphans(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .replace(/(?<=^|[\s(„\u00A0])([aiouwzAIOUWZ])\s+/g, `$1${NBSP}`)
    .replace(/(\d)\s+(g|kg|ml|l|min|h|mm|cm|szt\.|°C|%|kcal|kJ|porcj\w*|łyż\w*|ząb\w*|minut\w*|sekund\w*)(?=[\s,.;:)!?]|$)/g, `$1${NBSP}$2`)
    .replace(/(\d)\s+(×)\s+(\d)/g, `$1${NBSP}$2${NBSP}$3`);
}
export const t = fixOrphans;

/** Liczba po polsku: przecinek dziesiętny, ułamki zwykłe dla połówek i ćwiartek */
export function formatQty(q: number | null) {
  if (q == null) return '';
  const whole = Math.floor(q);
  const frac = Math.round((q - whole) * 100) / 100;
  const map: Record<string, string> = { '0.25': '¼', '0.5': '½', '0.75': '¾', '0.33': '⅓', '0.67': '⅔' };
  if (frac && map[String(frac)]) return (whole ? whole : '') + map[String(frac)];
  return String(Math.round(q * 10) / 10).replace('.', ',');
}
export const num = (n: number, digits = 1) => n.toFixed(digits).replace('.', ',');

export function timeLabel(min: number) {
  return min >= 60 ? `${Math.floor(min / 60)}${NBSP}h${min % 60 ? ` ${min % 60}${NBSP}min` : ''}` : `${min}${NBSP}min`;
}
export function timeBucket(min: number) {
  return min <= 15 ? 15 : min <= 30 ? 30 : min <= 60 ? 60 : 999;
}

export const formatDate = (iso: string) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }).replace(' ', NBSP);
