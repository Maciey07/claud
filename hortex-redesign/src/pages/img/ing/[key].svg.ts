import type { APIRoute } from 'astro';
import { ingredientKeys, ingredientSVG } from '../../../lib/art';

export function getStaticPaths() {
  return ingredientKeys.map((key) => ({ params: { key } }));
}

export const GET: APIRoute = ({ params }) =>
  new Response(ingredientSVG(params.key!), { headers: { 'Content-Type': 'image/svg+xml' } });
