import type { APIRoute } from 'astro';
import { recipes } from '../../../lib/data';
import { dishSVG } from '../../../lib/art';

const RATIOS = ['3x2', '4x5', '1x1'] as const;

export function getStaticPaths() {
  return recipes.flatMap((r) => RATIOS.map((ratio) => ({ params: { slug: `${r.slug}-${ratio}` }, props: { r, ratio } })));
}

export const GET: APIRoute = ({ props }) => {
  const { r, ratio } = props as { r: (typeof recipes)[number]; ratio: (typeof RATIOS)[number] };
  return new Response(dishSVG({ slug: r.slug, title: r.title, dish: r.dish, pieces: r.pieces }, ratio), { headers: { 'Content-Type': 'image/svg+xml' } });
};
