import type { APIRoute } from 'astro';
import { categories } from '../../../lib/data';
import { categoryTileSVG } from '../../../lib/art';

const TINTS: Record<string, string> = {
  warzywa: '#dce6cc', 'warzywa-do-zapiekania': '#e9dcc6', owoce: '#f2d8d3', zupy: '#f1e0bf', 'dania-gotowe': '#ebdaca',
  pizza: '#f0d6c4', 'menu-kurkowe': '#f2ddb4', frytki: '#f4e3b0', 'linia-szparagowa': '#e0e8d2', horeca: '#d8dfdf',
};

export function getStaticPaths() {
  return categories.map((c) => ({ params: { slug: c.slug }, props: { c } }));
}

export const GET: APIRoute = ({ props }) => {
  const { c } = props as { c: (typeof categories)[number] };
  return new Response(categoryTileSVG(c.slug, c.pieces, TINTS[c.slug] ?? '#ebe2d3'), { headers: { 'Content-Type': 'image/svg+xml' } });
};
