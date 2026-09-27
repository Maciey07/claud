/** Miniatura produktu do koszyka (uproszczona sylwetka w kolorach marki). */
const C: Record<string, string> = {
  orange: 'var(--ofca-orange)', lilac: 'var(--ofca-lilac)', cream: 'var(--ofca-cream)',
  ink: 'var(--ofca-ink)', white: 'var(--ofca-white)', mint: 'var(--ofca-mint)',
};

const SHAPES: Record<string, (fg: string) => string> = {
  tee: (fg) => `<path d="M24 14l10-6h12l10 6 10 10-8 8-6-5v39H28V27l-6 5-8-8z" fill="${fg}"/>`,
  mug: (fg) => `<rect x="20" y="22" width="32" height="38" fill="${fg}"/><path d="M52 30h6a6 6 0 0 1 0 12h-6" fill="none" stroke="${fg}" stroke-width="5"/>`,
  magnet: (fg) => `<rect x="18" y="18" width="44" height="44" fill="${fg}"/>`,
  lettering: (fg) => `<text x="40" y="50" text-anchor="middle" font-family="Anybody Variable, sans-serif" font-weight="900" font-size="22" fill="${fg}">OFCA</text>`,
  'pin-tent': (fg) => `<circle cx="40" cy="40" r="24" fill="${fg}"/><path d="M40 24l14 22H26z" fill="var(--ofca-cream)"/>`,
  'pin-text': (fg) => `<circle cx="40" cy="40" r="24" fill="${fg}"/><text x="40" y="45" text-anchor="middle" font-family="Anybody Variable, sans-serif" font-weight="900" font-size="13" fill="var(--ofca-ink)">OFCA</text>`,
  socks: (fg) => `<path d="M28 12h16v34l12 8a8 8 0 0 1-6 14l-18-8a8 8 0 0 1-4-7z" fill="${fg}"/>`,
  tote: (fg) => `<path d="M30 26v-6a10 10 0 0 1 20 0v6" fill="none" stroke="${fg}" stroke-width="4"/><rect x="20" y="26" width="40" height="40" fill="${fg}"/>`,
};

export function productThumb(kind: string, bg: string, fg: string): string {
  const shape = SHAPES[kind] ?? SHAPES.magnet;
  return `<svg class="thumb" viewBox="0 0 80 80" aria-hidden="true" focusable="false"><rect width="80" height="80" fill="${C[bg] ?? C.cream}"/>${shape(C[fg] ?? C.ink)}</svg>`;
}
