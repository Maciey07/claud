import type { APIRoute } from 'astro';
import { products } from '../../../lib/data';
import { packshotSVG } from '../../../lib/art';

export function getStaticPaths() {
  return products.map((p) => ({ params: { slug: p.slug } }));
}

export const GET: APIRoute = ({ params }) => {
  const p = products.find((x) => x.slug === params.slug)!;
  const svg = packshotSVG({ slug: p.slug, name: p.name, weight: p.weight, category: p.category, ingredients: p.ingredients.map((i) => i.key), horeca: p.pack === 'gastronomiczne' });
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
};
