import type { APIRoute } from 'astro';
import { products, recipes, site } from '../lib/data';
import { img } from '../lib/images';

/** Statyczny indeks wyszukiwarki, ładowany dopiero przy otwarciu okna wyszukiwania */
export const GET: APIRoute = () => {
  const index = {
    produkty: products.map((p) => ({ t: p.name + (p.pack === 'gastronomiczne' ? ` (HoReCa ${p.weight})` : ''), u: `/produkty/${p.slug}/`, i: img.pack(p.slug), m: p.weight, k: p.ingredients.map((i) => i.name).join(' ') })),
    przepisy: recipes.map((r) => ({ t: r.title, u: `/przepisy/${r.slug}/`, i: img.dish(r.slug, '1x1'), m: `${r.time} min`, k: r.groups.flatMap((g) => g.items.map((i) => i.name)).join(' ') })),
    porady: site.advice.map((a) => ({ t: a.title, u: `/porady/${a.slug}/`, i: img.ing(a.pieces[0]), m: 'Porada', k: a.excerpt })),
  };
  return new Response(JSON.stringify(index), { headers: { 'Content-Type': 'application/json' } });
};
