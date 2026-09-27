import type { APIRoute } from 'astro';
import { sceneSVG } from '../../../lib/art';

export function getStaticPaths() {
  return ['field', 'plant', 'kitchen-pro', 'kitchen-home'].map((name) => ({ params: { name } }));
}

export const GET: APIRoute = ({ params }) =>
  new Response(sceneSVG(params.name!), { headers: { 'Content-Type': 'image/svg+xml' } });
