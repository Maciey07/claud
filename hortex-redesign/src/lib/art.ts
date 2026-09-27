/**
 * Generator ilustracji zastępczych (SVG).
 *
 * Prototyp nie używa zdjęć z hortex.pl. Zamiast nich każda "fotografia" jest
 * rysowana w docelowych proporcjach systemu (packshot 4:5, składnik 1:1,
 * potrawa 3:2 i 4:5, produkt w użyciu 16:9, pole i zakład 21:9).
 * Po sesji zdjęciowej wystarczy podmienić ścieżki w src/lib/images.ts.
 */

/* ---------- Narzędzia ---------- */

export function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rng(seed: string) {
  let a = hash(seed) || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

function svgDoc(w: number, h: number, body: string, title: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img"><title>${esc(title)}</title>${body}</svg>`;
}

export function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function radial(id: string, a: string, b: string, cx = 0.38, cy = 0.32, r = 0.75) {
  return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`;
}
function linear(id: string, a: string, b: string, x2 = 0, y2 = 1) {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
}

/* ---------- Składniki (cut-out, 1:1, viewBox 200×200) ---------- */

type Draw = (p: string) => string;

function cube(x: number, y: number, s: number, top: string, left: string, right: string, rot = 0) {
  const h = s * 0.5;
  return `<g transform="rotate(${rot} ${x} ${y})">
<path d="M${x} ${y - h} L${x + s} ${y} L${x} ${y + h} L${x - s} ${y} Z" fill="${top}"/>
<path d="M${x - s} ${y} L${x} ${y + h} L${x} ${y + h + s} L${x - s} ${y + s} Z" fill="${left}"/>
<path d="M${x + s} ${y} L${x} ${y + h} L${x} ${y + h + s} L${x + s} ${y + s} Z" fill="${right}"/></g>`;
}

function floretCrown(p: string, pts: number[][], grad: string, dot: string, hi: string) {
  return pts
    .map(
      ([x, y, r]) =>
        `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${p}${grad})"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.35}" r="${r * 0.38}" fill="${hi}" opacity=".45"/><circle cx="${x + r * 0.35}" cy="${y + r * 0.2}" r="${r * 0.12}" fill="${dot}" opacity=".5"/>`,
    )
    .join('');
}

const pod = (p: string) => `<defs>${radial(p + 'pe', '#b4e07a', '#4f9a33')}${linear(p + 'po', '#5aa640', '#2f7229')}</defs>
<path d="M14 128 C46 58 150 44 190 80 C170 132 72 158 14 128 Z" fill="url(#${p}po)"/>
<path d="M30 122 C62 80 146 70 174 86 C152 120 80 138 30 122 Z" fill="#9fcf6c"/>
${[58, 86, 114, 142].map((x, i) => `<circle cx="${x}" cy="${110 - i * 6}" r="16" fill="url(#${p}pe)"/><circle cx="${x - 5}" cy="${104 - i * 6}" r="5" fill="#fff" opacity=".45"/>`).join('')}
<path d="M186 80 C194 74 196 66 192 60" stroke="#2f7229" stroke-width="5" fill="none" stroke-linecap="round"/>`;

export const INGREDIENTS: Record<string, { label: string; draw: Draw }> = {
  broccoli: {
    label: 'brokuł',
    draw: (p) => `<defs>${radial(p + 'g', '#7cb84a', '#2c6424')}</defs>
<path d="M86 116 C84 140 80 160 74 180 Q100 190 126 180 C120 160 116 140 114 116 Z" fill="#a6cc72"/>
<path d="M88 118 C86 150 82 170 78 182 Q88 186 96 186 C96 160 96 140 98 118Z" fill="#c4de98" opacity=".6"/>
<path d="M100 126 L68 98 M100 126 L132 98 M100 130 L100 92" stroke="#94bd60" stroke-width="14" stroke-linecap="round"/>
${floretCrown(p, [[58, 86, 26], [142, 86, 26], [82, 62, 30], [118, 60, 30], [100, 40, 22], [100, 84, 30], [72, 104, 20], [128, 104, 20]], 'g', '#1f4a1a', '#a5d86f')}`,
  },
  cauliflower: {
    label: 'kalafior',
    draw: (p) => `<defs>${radial(p + 'g', '#fbf4df', '#d6c7a0')}${linear(p + 'l', '#7fb561', '#3f7c35')}</defs>
<path d="M30 130 C20 90 50 70 70 96 C70 120 60 140 30 130Z" fill="url(#${p}l)"/>
<path d="M170 130 C180 90 150 70 130 96 C130 120 140 140 170 130Z" fill="url(#${p}l)"/>
<path d="M84 120 C84 150 80 166 76 182 Q100 190 124 182 C120 166 116 150 116 120Z" fill="#e8e2c4"/>
${floretCrown(p, [[62, 96, 28], [138, 96, 28], [84, 70, 32], [118, 68, 32], [100, 46, 24], [100, 98, 32]], 'g', '#b8a67a', '#ffffff')}`,
  },
  pea: { label: 'groszek', draw: pod },
  bean: {
    label: 'fasolka szparagowa',
    draw: (p) => `<defs>${linear(p + 'b', '#6fb04a', '#2f7229', 1, 1)}</defs>
${[
  ['M28 152 C70 128 122 76 176 42', 0],
  ['M20 118 C66 104 118 70 162 30', 1],
  ['M44 182 C92 150 140 110 184 84', 2],
]
  .map(
    ([d]) =>
      `<path d="${d}" stroke="url(#${p}b)" stroke-width="17" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#a8d57a" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6" transform="translate(-3 -4)"/>`,
  )
  .join('')}`,
  },
  carrot: {
    label: 'marchewka',
    draw: (p) => `<defs>${linear(p + 'c', '#f7a646', '#d8641a', 1, 0)}</defs>
<g transform="rotate(-32 100 100)">
<path d="M100 44 C88 22 76 16 70 18 M100 44 C100 20 104 10 110 8 M100 44 C112 24 124 20 132 22" stroke="#4d9a38" stroke-width="7" fill="none" stroke-linecap="round"/>
<path d="M78 48 Q100 36 122 48 L106 186 Q100 196 94 186 Z" fill="url(#${p}c)"/>
<path d="M86 76 L96 78 M102 104 L114 102 M88 128 L98 130 M104 152 L110 150" stroke="#b9531a" stroke-width="3" stroke-linecap="round"/>
<path d="M86 52 Q90 110 97 180" stroke="#ffd29a" stroke-width="4" fill="none" opacity=".5"/></g>`,
  },
  'carrot-cube': {
    label: 'marchew w kostce',
    draw: () =>
      cube(70, 80, 30, '#f7a646', '#d8641a', '#e98330', -6) +
      cube(132, 96, 28, '#f7a646', '#d8641a', '#e98330', 8) +
      cube(96, 138, 30, '#f5b25a', '#d06019', '#e5802c', 2),
  },
  'potato-cube': {
    label: 'ziemniaki w kostce',
    draw: () =>
      cube(74, 78, 30, '#f5e2a8', '#d9bd72', '#e8cf8a', 4) +
      cube(134, 100, 28, '#f5e2a8', '#d9bd72', '#e8cf8a', -8) +
      cube(94, 142, 30, '#f7e7b5', '#d5b86a', '#e6cc86', 6),
  },
  corn: {
    label: 'kukurydza',
    draw: (p) => {
      let k = '';
      for (let row = 0; row < 11; row++)
        for (let col = 0; col < 4; col++)
          k += `<rect x="${74 + col * 14}" y="${36 + row * 12.5}" width="12.5" height="11" rx="4" fill="url(#${p}k)" stroke="#dca52a" stroke-width="1"/>`;
      return `<defs>${radial(p + 'k', '#fff0a0', '#f2c23c', 0.4, 0.3, 0.8)}</defs><g transform="rotate(-28 100 100)"><rect x="70" y="30" width="60" height="146" rx="28" fill="#e9b53a"/>${k}<path d="M70 150 C50 176 60 196 86 190 L100 176Z" fill="#9ec26a"/></g>`;
    },
  },
  brussels: {
    label: 'brukselka',
    draw: (p) => `<defs>${radial(p + 'g', '#b3d77f', '#437f30')}</defs>
<circle cx="100" cy="102" r="62" fill="url(#${p}g)"/>
<path d="M100 42 C58 58 56 144 100 162 M100 42 C142 58 144 144 100 162 M58 70 C80 96 80 128 64 150 M142 70 C120 96 120 128 136 150" stroke="#2f6a26" stroke-width="3" fill="none" opacity=".45"/>
<ellipse cx="80" cy="76" rx="16" ry="10" fill="#fff" opacity=".28" transform="rotate(-30 80 76)"/>
<rect x="92" y="158" width="16" height="16" rx="4" fill="#e3e6b8"/>`,
  },
  spinach: {
    label: 'szpinak',
    draw: (p) => `<defs>${linear(p + 's', '#4f9a44', '#1f5327', 1, 1)}</defs>
<path d="M100 18 C156 40 176 112 112 172 L100 186 L88 172 C24 112 44 40 100 18Z" fill="url(#${p}s)"/>
<path d="M100 30 L100 186 M100 70 L74 56 M100 70 L128 54 M100 104 L66 88 M100 104 L136 86 M100 138 L72 126 M100 138 L128 124" stroke="#9fd081" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>
<path d="M100 184 L100 198" stroke="#6ea54f" stroke-width="6" stroke-linecap="round"/>`,
  },
  pepper: {
    label: 'papryka',
    draw: (p) => `<defs>${radial(p + 'r', '#f26a4a', '#a8201a')}</defs>
<path d="M58 70 C58 40 142 40 142 70 C164 110 146 176 100 176 C54 176 36 110 58 70Z" fill="url(#${p}r)"/>
<path d="M100 60 C96 90 96 140 100 170" stroke="#8c1813" stroke-width="3" fill="none" opacity=".4"/>
<ellipse cx="76" cy="92" rx="10" ry="26" fill="#fff" opacity=".28" transform="rotate(12 76 92)"/>
<path d="M78 54 Q100 64 122 54 Q112 44 100 46 Q88 44 78 54Z" fill="#3f7c2c"/>
<path d="M100 50 C100 36 108 26 118 22" stroke="#4d8f35" stroke-width="8" fill="none" stroke-linecap="round"/>`,
  },
  onion: {
    label: 'cebulka',
    draw: (p) => `<defs>${radial(p + 'o', '#fbf1d8', '#d8bf8e')}</defs>
<path d="M100 32 C132 66 156 100 146 136 C136 168 64 168 54 136 C44 100 68 66 100 32Z" fill="url(#${p}o)"/>
<path d="M100 36 C86 70 80 110 86 160 M100 36 C114 70 120 110 114 160 M100 36 L100 162" stroke="#c7a978" stroke-width="2.5" fill="none" opacity=".6"/>
<path d="M100 32 L96 16 M100 32 L106 18" stroke="#b69668" stroke-width="3" stroke-linecap="round"/>`,
  },
  potato: {
    label: 'ziemniak',
    draw: (p) => `<defs>${radial(p + 'p', '#e7c893', '#a97a45')}</defs>
<ellipse cx="100" cy="104" rx="76" ry="54" fill="url(#${p}p)" transform="rotate(-14 100 104)"/>
${[[70, 88], [120, 80], [140, 118], [92, 128], [58, 116]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="2.5" fill="#6d4a24" opacity=".55"/>`).join('')}`,
  },
  fry: {
    label: 'frytki',
    draw: (p) => `<defs>${linear(p + 'f', '#ffd978', '#e6a93a', 1, 0)}</defs>
${[[-22, 64], [4, 98], [26, 132], [-8, 116]].map(([a, x]) => `<rect x="${x - 12}" y="36" width="24" height="136" rx="5" fill="url(#${p}f)" transform="rotate(${a} ${x} 104)"/><rect x="${x - 8}" y="40" width="5" height="128" rx="2" fill="#fff3c4" opacity=".6" transform="rotate(${a} ${x} 104)"/>`).join('')}`,
  },
  chanterelle: {
    label: 'kurki',
    draw: (p) => `<defs>${linear(p + 'k', '#f9cf5c', '#dc8d1f')}${linear(p + 's', '#f5c254', '#e3a33a')}</defs>
<path d="M36 64 Q54 46 72 58 Q88 42 104 56 Q122 42 140 58 Q158 48 168 66 C156 84 132 90 120 94 C114 124 112 152 110 176 L90 176 C88 152 86 124 80 94 C64 90 44 82 36 64Z" fill="url(#${p}k)"/>
<path d="M80 94 C88 120 90 150 90 176 L110 176 C110 150 112 120 120 94Z" fill="url(#${p}s)"/>
<path d="M86 96 L94 150 M100 96 L100 156 M114 96 L106 150" stroke="#c9801b" stroke-width="2.5" opacity=".6"/>
<path d="M46 66 Q60 58 72 64 Q88 54 104 64 Q120 54 136 64 Q150 58 160 68" stroke="#fde39a" stroke-width="3" fill="none" opacity=".7"/>`,
  },
  asparagus: {
    label: 'szparagi zielone',
    draw: (p) => `<defs>${linear(p + 'a', '#8cc063', '#3f7f33', 1, 0)}</defs>
${[[-14, 78], [10, 118]].map(([a, x]) => `<g transform="rotate(${a} ${x} 110)"><rect x="${x - 11}" y="48" width="22" height="146" rx="11" fill="url(#${p}a)"/><path d="M${x} 16 C${x + 16} 30 ${x + 16} 50 ${x + 10} 62 L${x - 10} 62 C${x - 16} 50 ${x - 16} 30 ${x} 16Z" fill="#3c7a2e"/>${[84, 116, 150].map((y) => `<path d="M${x - 8} ${y} L${x} ${y - 10} L${x + 8} ${y}" stroke="#2f6424" stroke-width="3" fill="none"/>`).join('')}</g>`).join('')}`,
  },
  'asparagus-white': {
    label: 'szparagi białe',
    draw: (p) => `<defs>${linear(p + 'a', '#fbf5e3', '#dccfa8', 1, 0)}</defs>
${[[-14, 78], [10, 118]].map(([a, x]) => `<g transform="rotate(${a} ${x} 110)"><rect x="${x - 12}" y="48" width="24" height="146" rx="12" fill="url(#${p}a)"/><path d="M${x} 16 C${x + 17} 30 ${x + 17} 50 ${x + 11} 62 L${x - 11} 62 C${x - 17} 50 ${x - 17} 30 ${x} 16Z" fill="#d7c39a"/>${[84, 116, 150].map((y) => `<path d="M${x - 8} ${y} L${x} ${y - 10} L${x + 8} ${y}" stroke="#c4b287" stroke-width="3" fill="none"/>`).join('')}</g>`).join('')}`,
  },
  strawberry: {
    label: 'truskawka',
    draw: (p) => {
      const r = rng('seeds');
      let s = '';
      for (let i = 0; i < 22; i++) {
        const x = 62 + r() * 76;
        const y = 76 + r() * 76;
        const dx = (x - 100) / 50;
        if (Math.abs(dx) > 1 - (y - 70) / 140) continue;
        s += `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="2.2" ry="3.4" fill="#ffd66e"/>`;
      }
      return `<defs>${radial(p + 's', '#ff5a4c', '#b01a24')}</defs>
<path d="M100 178 C56 152 38 110 46 80 C54 54 80 52 100 62 C120 52 146 54 154 80 C162 110 144 152 100 178Z" fill="url(#${p}s)"/>${s}
<path d="M100 66 L78 48 L94 58 L88 36 L100 54 L112 36 L106 58 L122 48 Z" fill="#3f8a33"/>
<ellipse cx="72" cy="88" rx="8" ry="16" fill="#fff" opacity=".25" transform="rotate(20 72 88)"/>`;
    },
  },
  cherry: {
    label: 'wiśnie',
    draw: (p) => `<defs>${radial(p + 'c', '#e03245', '#6a0a1a')}</defs>
<path d="M72 128 C78 90 96 58 118 36 M132 136 C128 100 122 66 118 36" stroke="#5f7d2c" stroke-width="5" fill="none" stroke-linecap="round"/>
<path d="M118 36 C136 22 160 24 170 36 C152 46 134 46 118 36Z" fill="#4f9a3a"/>
<circle cx="70" cy="140" r="34" fill="url(#${p}c)"/><circle cx="134" cy="146" r="34" fill="url(#${p}c)"/>
<ellipse cx="58" cy="128" rx="7" ry="11" fill="#fff" opacity=".35"/><ellipse cx="122" cy="134" rx="7" ry="11" fill="#fff" opacity=".35"/>`,
  },
  raspberry: {
    label: 'maliny',
    draw: (p) => {
      let s = '';
      const rows = [[5, 70], [6, 94], [6, 118], [5, 140], [4, 160]];
      rows.forEach(([n, y], ri) => {
        const w = n * 22;
        for (let i = 0; i < n; i++) s += `<circle cx="${100 - w / 2 + 11 + i * 22 + (ri % 2 ? 5 : 0)}" cy="${y}" r="13" fill="url(#${p}r)"/>`;
      });
      return `<defs>${radial(p + 'r', '#ff7890', '#b3203e', 0.35, 0.3, 0.8)}</defs><path d="M100 60 L84 44 L96 52 L100 36 L104 52 L116 44Z" fill="#6aa63f"/>${s}`;
    },
  },
  blueberry: {
    label: 'borówki',
    draw: (p) => `<defs>${radial(p + 'b', '#6a78b8', '#1c2350')}</defs>
${[[72, 90, 34], [132, 98, 32], [100, 146, 34]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${p}b)"/><circle cx="${x}" cy="${y}" r="${r}" fill="#a9b3d8" opacity=".18"/><path d="M${x - 6} ${y - r * 0.55} L${x} ${y - r * 0.42} L${x + 6} ${y - r * 0.55} L${x + 3} ${y - r * 0.4} L${x} ${y - r * 0.3} L${x - 3} ${y - r * 0.4}Z" fill="#141a38"/>`).join('')}`,
  },
  currant: {
    label: 'czarna porzeczka',
    draw: (p) => `<defs>${radial(p + 'c', '#5a4a6a', '#0f0a14')}</defs>
<path d="M40 40 C80 50 120 90 150 170" stroke="#6b7a3a" stroke-width="4" fill="none" stroke-linecap="round"/>
${[[66, 62], [92, 82], [116, 108], [134, 136], [70, 96], [104, 134], [150, 166]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="17" fill="url(#${p}c)"/><circle cx="${x - 5}" cy="${y - 6}" r="4" fill="#fff" opacity=".35"/>`).join('')}`,
  },
  dill: {
    label: 'koperek',
    draw: () => {
      let s = '<path d="M100 190 C98 140 100 90 104 30" stroke="#5a8f3a" stroke-width="4" fill="none" stroke-linecap="round"/>';
      const r = rng('dill');
      for (let i = 0; i < 9; i++) {
        const y = 40 + i * 16;
        const side = i % 2 ? 1 : -1;
        const len = 40 + r() * 24;
        const ex = 102 + side * len;
        s += `<path d="M102 ${y + 20} Q${102 + side * len * 0.5} ${y} ${ex} ${y - 4}" stroke="#6aa645" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
        for (let j = 0; j < 4; j++) {
          const fx = 102 + side * len * (0.3 + j * 0.18);
          const fy = y + 12 - j * 4;
          s += `<path d="M${r1(fx)} ${r1(fy)} l${side * 8} -12 M${r1(fx)} ${r1(fy)} l${side * 12} 2" stroke="#7fbd55" stroke-width="1.6" stroke-linecap="round"/>`;
        }
      }
      return s;
    },
  },
  tomato: {
    label: 'pomidor',
    draw: (p) => `<defs>${radial(p + 't', '#ff6a4a', '#b22418')}</defs>
<circle cx="100" cy="108" r="62" fill="url(#${p}t)"/>
<ellipse cx="76" cy="84" rx="12" ry="18" fill="#fff" opacity=".3" transform="rotate(30 76 84)"/>
<path d="M100 54 L84 40 L96 50 L90 30 L100 46 L110 30 L104 50 L116 40Z" fill="#3f8a33"/>`,
  },
  mushroom: {
    label: 'pieczarki',
    draw: (p) => `<defs>${radial(p + 'm', '#fbf6ec', '#cbbba0', 0.4, 0.2, 0.9)}</defs>
<rect x="80" y="100" width="40" height="70" rx="14" fill="#efe7d6"/>
<path d="M36 112 C36 52 164 52 164 112 C140 124 60 124 36 112Z" fill="url(#${p}m)"/>
<path d="M50 112 C80 120 120 120 150 112" stroke="#b7a584" stroke-width="3" fill="none"/>`,
  },
  basil: {
    label: 'bazylia',
    draw: (p) => `<defs>${linear(p + 'b', '#5cb04d', '#2d6f2e', 1, 1)}</defs>
<path d="M60 170 C30 120 50 60 100 40 C120 90 110 140 60 170Z" fill="url(#${p}b)"/>
<path d="M140 176 C170 130 160 70 116 50 C92 96 100 146 140 176Z" fill="url(#${p}b)"/>
<path d="M62 166 C74 120 86 80 100 44 M138 172 C126 128 120 90 116 54" stroke="#a6dc8d" stroke-width="2.5" fill="none" opacity=".7"/>`,
  },
  cheese: {
    label: 'ser',
    draw: () => `<path d="M30 130 L170 70 L170 130 Z" fill="#f7d672"/><path d="M30 130 L170 130 L170 160 L30 160Z" fill="#ecc052"/>
<circle cx="120" cy="112" r="10" fill="#e3b448"/><circle cx="150" cy="100" r="6" fill="#e3b448"/><circle cx="80" cy="145" r="7" fill="#d6a63b"/>`,
  },
  zucchini: {
    label: 'cukinia',
    draw: (p) => `<defs>${radial(p + 'z', '#f4f1c4', '#d6dca0')}</defs>
<circle cx="100" cy="100" r="68" fill="#3f7a31"/><circle cx="100" cy="100" r="60" fill="#8fbf5a"/><circle cx="100" cy="100" r="54" fill="url(#${p}z)"/>
${Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return `<ellipse cx="${r1(100 + Math.cos(a) * 22)}" cy="${r1(100 + Math.sin(a) * 22)}" rx="3" ry="6" fill="#c9cf8a" transform="rotate(${r1((a * 180) / Math.PI)} ${r1(100 + Math.cos(a) * 22)} ${r1(100 + Math.sin(a) * 22)})"/>`; }).join('')}`,
  },
  beet: {
    label: 'burak',
    draw: (p) => `<defs>${radial(p + 'b', '#b0325a', '#4e0d25')}</defs>
<path d="M92 50 C80 30 70 18 60 14 M100 48 C100 26 104 14 110 8 M108 50 C122 30 136 24 146 24" stroke="#4d8a35" stroke-width="7" fill="none" stroke-linecap="round"/>
<path d="M100 46 C140 46 162 80 160 116 C158 150 130 170 104 172 C104 184 100 192 96 196 C94 186 94 178 94 172 C66 168 40 148 40 114 C40 78 62 46 100 46Z" fill="url(#${p}b)"/>
<ellipse cx="74" cy="92" rx="10" ry="18" fill="#fff" opacity=".2" transform="rotate(24 74 92)"/>`,
  },
  plum: {
    label: 'śliwki',
    draw: (p) => `<defs>${radial(p + 'u', '#6a5aa8', '#2a1a4e')}</defs>
${[[74, 116, 44, -10], [130, 108, 42, 14]].map(([x, y, r, a]) => `<ellipse cx="${x}" cy="${y}" rx="${r * 0.86}" ry="${r}" fill="url(#${p}u)" transform="rotate(${a} ${x} ${y})"/><path d="M${x} ${y - r + 4} C${x - 8} ${y - 10} ${x - 6} ${y + 20} ${x} ${y + r - 4}" stroke="#1d1238" stroke-width="2.5" fill="none" opacity=".5"/><ellipse cx="${x - 14}" cy="${y - 14}" rx="8" ry="14" fill="#c9c0ec" opacity=".3"/>`).join('')}
<path d="M100 68 C100 50 104 40 112 34" stroke="#5f7d2c" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  },
  'scoop-vanilla': { label: 'lody waniliowe', draw: (p) => scoop(p, '#fbeecd', '#e8cf97') },
  'scoop-strawberry': { label: 'lody truskawkowe', draw: (p) => scoop(p, '#f9bcc4', '#e0808e') },
  'scoop-chocolate': { label: 'lody czekoladowe', draw: (p) => scoop(p, '#9a6444', '#5a3421') },
};

function scoop(p: string, a: string, b: string) {
  return `<defs>${radial(p + 'i', a, b)}</defs>
<path d="M40 110 C36 58 68 34 100 34 C132 34 164 58 160 110 Q150 124 140 114 Q128 132 116 116 Q104 134 92 118 Q80 132 70 116 Q56 126 40 110Z" fill="url(#${p}i)"/>
<ellipse cx="78" cy="66" rx="16" ry="10" fill="#fff" opacity=".35" transform="rotate(-25 78 66)"/>
<path d="M50 120 L100 190 L150 120 Q126 132 100 128 Q74 132 50 120Z" fill="#d9a55a"/>
<path d="M62 132 L124 176 M84 128 L136 150 M138 132 L78 176 M116 128 L64 150" stroke="#b9803a" stroke-width="2.5" opacity=".6"/>`;
}

export const ingredientKeys = Object.keys(INGREDIENTS);

export function ingredientLabel(key: string) {
  return INGREDIENTS[key]?.label ?? key;
}

/** Wewnętrzna grupa składnika do zagnieżdżania w większych kompozycjach */
function ingredientNested(key: string, x: number, y: number, size: number, rot: number, prefix: string) {
  const ing = INGREDIENTS[key];
  if (!ing) return '';
  return `<g transform="translate(${r1(x)} ${r1(y)}) rotate(${r1(rot)}) translate(${r1(-size / 2)} ${r1(-size / 2)}) scale(${r1((size / 200) * 1000) / 1000})">${ing.draw(prefix)}</g>`;
}

export function ingredientSVG(key: string) {
  const ing = INGREDIENTS[key];
  const shadow = `<defs><filter id="sh" x="-20%" y="-20%" width="140%" height="160%"><feGaussianBlur stdDeviation="4"/></filter></defs><ellipse cx="100" cy="186" rx="58" ry="7" fill="#3a2a10" opacity=".16" filter="url(#sh)"/>`;
  return svgDoc(200, 200, shadow + ing.draw('i'), ing.label);
}

/* ---------- Packshoty (4:5, 400×500, wycięte) ---------- */

export interface PackInput {
  slug: string;
  name: string;
  weight: string;
  category: string;
  ingredients: string[];
  horeca?: boolean;
}

export const BAG_COLORS: Record<string, [string, string]> = {
  warzywa: ['#2f7d43', '#1d5a2d'],
  'warzywa-do-zapiekania': ['#86603a', '#5e3f22'],
  owoce: ['#b8323f', '#86202b'],
  zupy: ['#cf8a2a', '#9c6116'],
  'dania-gotowe': ['#8a4b2f', '#5f301b'],
  pizza: ['#c2462e', '#8d2c1a'],
  'menu-kurkowe': ['#d98c1e', '#a26112'],
  frytki: ['#e0a52a', '#a8731a'],
  'linia-szparagowa': ['#5f8f3e', '#3f6a27'],
  horeca: ['#2b3a36', '#18231f'],
};

function crimp(x1: number, x2: number, y: number, dir: 1 | -1, teeth = 22) {
  const step = (x2 - x1) / teeth;
  let d = '';
  for (let i = 0; i < teeth; i++) {
    const xa = x1 + step * i;
    d += ` L${r1(xa + step / 2)} ${r1(y - dir * 5)} L${r1(xa + step)} ${y}`;
  }
  return d;
}

function wrapWords(text: string, max: number) {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  // Polska typografia: jednoliterowe słowo nie może zostać na końcu wiersza
  for (let i = 0; i < lines.length - 1; i++) {
    const m = lines[i].match(/^(.*) (\S)$/);
    if (m) {
      lines[i] = m[1];
      lines[i + 1] = `${m[2]} ${lines[i + 1]}`;
    }
  }
  return lines;
}

const LEAF_MARK = (x: number, y: number, s: number, c: string) =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M0 16 C0 6 8 0 20 0 C20 12 12 18 0 16Z M0 16 C6 12 10 8 14 4" fill="${c}" stroke="${c}" stroke-width="0"/>`;

export function packshotSVG(pk: PackInput) {
  const [base, deep] = BAG_COLORS[pk.horeca ? 'horeca' : pk.category] ?? BAG_COLORS.warzywa;
  const top = pk.horeca ? 30 : 42;
  const bottom = 462;
  const L = pk.horeca ? 36 : 54;
  const R = pk.horeca ? 364 : 346;
  const body = `M${L} ${top}${crimp(L, R, top, 1)} C${R + 12} 150 ${R + 14} 340 ${R + 4} ${bottom}${crimp(R + 4, L - 4, bottom, -1)} C${L - 14} 340 ${L - 12} 150 ${L} ${top} Z`;
  const cream = '#f6efe2';
  const lines = wrapWords(pk.name, pk.horeca ? 20 : 17).slice(0, 3);
  const fs = lines.length > 2 ? 23 : 27;
  const nameY = (pk.horeca ? 372 : 382) - (lines.length > 2 ? 16 : lines.length > 1 ? 4 : 0);
  const winR = pk.horeca ? 86 : 104;
  const winY = pk.horeca ? 222 : 232;
  const ings = pk.ingredients.slice(0, 4);
  const layouts: number[][][] = [
    [[0, 0, 170, -8]],
    [[-34, -8, 130, -14], [38, 14, 120, 12]],
    [[-40, -26, 110, -12], [40, -18, 104, 16], [0, 36, 110, 4]],
    [[-44, -30, 96, -12], [42, -30, 92, 14], [-34, 36, 96, 8], [40, 38, 92, -10]],
  ];
  const lay = layouts[Math.max(0, ings.length - 1)];
  const scale = winR / 104;
  const ingSvg = ings
    .map((k, i) => ingredientNested(k, 200 + lay[i][0] * scale, winY + lay[i][1] * scale, lay[i][2] * scale, lay[i][3], `p${i}`))
    .join('');

  const b = `<defs>
${linear('gl', 'rgba(255,255,255,.28)', 'rgba(255,255,255,0)', 1, 0)}
${linear('sh', 'rgba(0,0,0,0)', 'rgba(0,0,0,.28)', 1, 0)}
${radial('win', '#fbf6ec', '#eadfca', 0.5, 0.4, 0.7)}
<clipPath id="bag"><path d="${body}"/></clipPath>
<clipPath id="w"><circle cx="200" cy="${winY}" r="${winR}"/></clipPath>
<filter id="blur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>
</defs>
<ellipse cx="200" cy="474" rx="150" ry="12" fill="#2a1d0c" opacity=".24" filter="url(#blur)"/>
<path d="${body}" fill="${base}"/>
<g clip-path="url(#bag)">
  <rect x="0" y="${top - 10}" width="400" height="${pk.horeca ? 76 : 86}" fill="${deep}"/>
  <circle cx="200" cy="${winY}" r="${winR + 14}" fill="${deep}" opacity=".55"/>
  <rect x="0" y="0" width="140" height="500" fill="url(#gl)"/>
  <rect x="270" y="0" width="140" height="500" fill="url(#sh)"/>
</g>
<text x="200" y="${top + (pk.horeca ? 42 : 46)}" text-anchor="middle" font-family="'Bricolage Grotesque','Arial Black',Arial,sans-serif" font-weight="800" font-size="${pk.horeca ? 30 : 36}" letter-spacing="-1" fill="${cream}">Hortex</text>
${LEAF_MARK(pk.horeca ? 262 : 272, top + (pk.horeca ? 16 : 16), 1.1, '#9fd47a')}
<text x="200" y="${top + (pk.horeca ? 62 : 68)}" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="600" font-size="11" letter-spacing="2.4" fill="${cream}" opacity=".85">${pk.horeca ? 'FOODSERVICE · HoReCa' : 'PROSTO Z NATURY'}</text>
<circle cx="200" cy="${winY}" r="${winR}" fill="url(#win)"/>
<g clip-path="url(#w)">${ingSvg}</g>
<circle cx="200" cy="${winY}" r="${winR}" fill="none" stroke="${cream}" stroke-width="4"/>
${lines.map((l, i) => `<text x="200" y="${nameY + i * (fs + 4)}" text-anchor="middle" font-family="'Bricolage Grotesque','Arial Narrow',Arial,sans-serif" font-weight="700" font-size="${fs}" fill="${cream}">${esc(l)}</text>`).join('')}
<circle cx="${R - 30}" cy="${winY + winR - 6}" r="${pk.horeca ? 38 : 32}" fill="${cream}"/>
<text x="${R - 30}" y="${winY + winR + (pk.horeca ? 2 : 1)}" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="800" font-size="${pk.horeca ? 19 : 18}" fill="${deep}">${esc(pk.weight)}</text>
${pk.horeca ? `<rect x="${L + 20}" y="${bottom - 46}" width="${R - L - 40}" height="24" rx="4" fill="${cream}" opacity=".14"/><text x="200" y="${bottom - 29}" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="12" font-weight="600" letter-spacing="1.5" fill="${cream}">OPAKOWANIE GASTRONOMICZNE</text>` : `<text x="200" y="${bottom - 16}" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="11" font-weight="600" letter-spacing="2" fill="${cream}" opacity=".7">MROŻONKI · -18°C</text>`}`;
  return svgDoc(400, 500, b, `${pk.name}, ${pk.weight} (packshot zastępczy)`);
}

/* ---------- Potrawy (3:2 i 4:5, widok z góry) ---------- */

export interface DishInput {
  slug: string;
  title: string;
  dish: string;
  pieces: string[];
  table?: number;
}

const TABLES = [
  ['#ece3d4', '#e2d6c3'],
  ['#e3e6dc', '#d6dbcd'],
  ['#efe1cf', '#e3d0b8'],
  ['#e6e0d6', '#d8d0c3'],
  ['#dfd2bf', '#cfbfa7'],
];
const NAPKINS = ['#c9d8b8', '#e8c7bf', '#d9c7e0', '#f0d9a8', '#bfd3d6'];

function scatter(pieces: string[], cx: number, cy: number, radius: number, count: number, size: number, rand: () => number, prefix: string, ring = false) {
  let s = '';
  for (let i = 0; i < count; i++) {
    const a = ring ? (i / count) * Math.PI * 2 + rand() * 0.4 : rand() * Math.PI * 2;
    const d = ring ? radius * (0.82 + rand() * 0.18) : Math.sqrt(rand()) * radius;
    const k = pieces[i % pieces.length];
    s += ingredientNested(k, cx + Math.cos(a) * d, cy + Math.sin(a) * d, size * (0.8 + rand() * 0.4), rand() * 360, `${prefix}${i}`);
  }
  return s;
}

function plate(cx: number, cy: number, r: number) {
  return `<ellipse cx="${cx + r * 0.06}" cy="${cy + r * 0.09}" rx="${r * 1.02}" ry="${r * 1.02}" fill="#3a2a10" opacity=".14" filter="url(#soft)"/>
<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fbf8f2"/><circle cx="${cx}" cy="${cy}" r="${r * 0.78}" fill="#f4efe5"/><circle cx="${cx}" cy="${cy}" r="${r * 0.78}" fill="none" stroke="#e6ddcd" stroke-width="${r * 0.02}"/>`;
}

function bowl(cx: number, cy: number, r: number, fill: string) {
  return `<ellipse cx="${cx + r * 0.08}" cy="${cy + r * 0.1}" rx="${r * 1.04}" ry="${r * 1.04}" fill="#3a2a10" opacity=".18" filter="url(#soft)"/>
<circle cx="${cx}" cy="${cy}" r="${r}" fill="#f7f2e8"/><circle cx="${cx}" cy="${cy}" r="${r * 0.86}" fill="${fill}"/>
<circle cx="${cx}" cy="${cy}" r="${r * 0.86}" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="${r * 0.05}"/>`;
}

function fork(x: number, y: number, len: number, rot: number) {
  return `<g transform="translate(${x} ${y}) rotate(${rot})" fill="#b9b3a8"><rect x="-6" y="0" width="12" height="${len * 0.62}" rx="6"/><rect x="-16" y="${len * 0.62}" width="32" height="${len * 0.14}" rx="6"/>${[-14, -5, 4, 13].map((dx) => `<rect x="${dx - 1}" y="${len * 0.72}" width="4" height="${len * 0.28}" rx="2"/>`).join('')}</g>`;
}

export function dishSVG(d: DishInput, ratio: '3x2' | '4x5' | '1x1' = '3x2') {
  const [W, H] = ratio === '3x2' ? [1200, 800] : ratio === '4x5' ? [800, 1000] : [900, 900];
  const rand = rng(d.slug + ratio);
  const [t1, t2] = TABLES[(d.table ?? hash(d.slug)) % TABLES.length];
  const napkin = NAPKINS[hash(d.slug) % NAPKINS.length];
  const cx = W / 2 + (ratio === '3x2' ? W * 0.04 : 0);
  const cy = H / 2 + (ratio === '4x5' ? H * 0.04 : 0);
  const R = Math.min(W, H) * 0.36;
  const pieces = d.pieces.length ? d.pieces : ['dill'];

  let bg = `<rect width="${W}" height="${H}" fill="${t1}"/>`;
  for (let i = 0; i < 14; i++) {
    const y = rand() * H;
    bg += `<path d="M0 ${r1(y)} C${W * 0.3} ${r1(y + (rand() - 0.5) * 30)} ${W * 0.7} ${r1(y + (rand() - 0.5) * 30)} ${W} ${r1(y + (rand() - 0.5) * 20)}" stroke="${t2}" stroke-width="${r1(1 + rand() * 3)}" fill="none" opacity=".7"/>`;
  }
  const nx = ratio === '3x2' ? W * 0.12 : W * 0.18;
  const ny = ratio === '3x2' ? H * 0.18 : H * 0.12;
  bg += `<g transform="rotate(-12 ${nx} ${ny})"><rect x="${nx - 170}" y="${ny - 120}" width="340" height="260" rx="6" fill="${napkin}"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${nx - 170}" y="${ny - 100 + i * 48}" width="340" height="6" fill="#fff" opacity=".35"/>`).join('')}</g>`;

  let food = '';
  const pr = (s: number) => R * s;
  switch (d.dish) {
    case 'patties': {
      food += plate(cx, cy, R);
      const pos = [[-0.34, -0.2], [0.18, -0.36], [0.36, 0.1], [-0.08, 0.3], [-0.2, 0.02]];
      pos.forEach(([dx, dy], i) => {
        const x = cx + dx * R, y = cy + dy * R, rr = pr(0.27);
        food += `<ellipse cx="${x + 6}" cy="${y + 8}" rx="${rr}" ry="${rr * 0.94}" fill="#6b4413" opacity=".18"/><ellipse cx="${x}" cy="${y}" rx="${rr}" ry="${rr * 0.94}" fill="url(#pat)" transform="rotate(${i * 30} ${x} ${y})"/>`;
        for (let k = 0; k < 7; k++) food += `<circle cx="${r1(x + (rand() - 0.5) * rr * 1.3)}" cy="${r1(y + (rand() - 0.5) * rr * 1.2)}" r="${r1(3 + rand() * 5)}" fill="${k % 2 ? '#4f8f36' : '#efe6c8'}" opacity=".85"/>`;
      });
      const sx = cx - R * 1.28, sy = cy + R * 0.55;
      food += bowl(sx, sy, pr(0.3), '#eef0dc') + scatter(['dill'], sx, sy, pr(0.12), 2, pr(0.16), rand, 'sd');
      food += scatter(pieces, cx, cy, R * 0.55, 3, pr(0.2), rand, 'pt');
      break;
    }
    case 'soup':
    case 'soup-green':
    case 'soup-red': {
      const col = d.dish === 'soup-green' ? '#a8c070' : d.dish === 'soup-red' ? '#b9442f' : '#f0d7a0';
      food += bowl(cx, cy, R * 0.92, col);
      food += `<path d="M${cx - R * 0.4} ${cy - R * 0.1} C${cx - R * 0.1} ${cy - R * 0.4} ${cx + R * 0.3} ${cy - R * 0.1} ${cx + R * 0.05} ${cy + R * 0.2} C${cx - R * 0.1} ${cy + R * 0.34} ${cx + R * 0.3} ${cy + R * 0.4} ${cx + R * 0.44} ${cy + R * 0.2}" stroke="#fffaf0" stroke-width="${pr(0.07)}" fill="none" stroke-linecap="round" opacity=".85"/>`;
      food += scatter(pieces, cx, cy, R * 0.6, 7, pr(0.2), rand, 'sp');
      for (let k = 0; k < 6; k++) food += `<rect x="${r1(cx + (rand() - 0.5) * R * 1.1)}" y="${r1(cy + (rand() - 0.5) * R * 1.1)}" width="${pr(0.1)}" height="${pr(0.1)}" rx="4" fill="#d9a04c" transform="rotate(${r1(rand() * 90)} ${cx} ${cy})"/>`;
      food += `<g transform="rotate(${-30} ${cx + R * 1.1} ${cy})"><ellipse cx="${cx + R * 1.1}" cy="${cy - R * 0.2}" rx="${pr(0.14)}" ry="${pr(0.2)}" fill="#bdb6aa"/><rect x="${cx + R * 1.1 - 6}" y="${cy}" width="12" height="${pr(0.7)}" rx="6" fill="#bdb6aa"/></g>`;
      break;
    }
    case 'pasta': {
      food += plate(cx, cy, R);
      for (let k = 0; k < 26; k++) {
        const a = rand() * Math.PI * 2, rr = rand() * R * 0.55;
        const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
        food += `<path d="M${r1(x)} ${r1(y)} q${r1((rand() - 0.5) * 80)} ${r1((rand() - 0.5) * 80)} ${r1((rand() - 0.5) * 120)} ${r1((rand() - 0.5) * 120)}" stroke="${k % 3 ? '#f0d48a' : '#e6c26c'}" stroke-width="${pr(0.06)}" fill="none" stroke-linecap="round"/>`;
      }
      food += scatter(pieces, cx, cy, R * 0.55, 9, pr(0.22), rand, 'pa');
      food += scatter(['cheese'], cx, cy, R * 0.4, 2, pr(0.12), rand, 'pc');
      food += fork(cx + R * 1.18, cy - R * 0.7, R * 1.4, 12);
      break;
    }
    case 'berries':
    case 'smoothie': {
      const col = d.dish === 'smoothie' ? '#f2a3b0' : '#efe4d0';
      food += bowl(cx, cy, R * 0.9, col);
      if (d.dish === 'berries') for (let k = 0; k < 40; k++) food += `<ellipse cx="${r1(cx + (rand() - 0.5) * R * 1.2)}" cy="${r1(cy + (rand() - 0.5) * R * 1.2)}" rx="10" ry="6" fill="#e0cfae" transform="rotate(${r1(rand() * 180)} ${cx} ${cy})"/>`;
      food += scatter(pieces, cx, cy, R * 0.5, 10, pr(0.22), rand, 'br');
      if (d.dish === 'smoothie') food += `<rect x="${cx + R * 0.2}" y="${cy - R * 1.2}" width="${pr(0.07)}" height="${R * 1.1}" rx="6" fill="#1f6b3a" transform="rotate(24 ${cx} ${cy})"/>`;
      food += scatter(pieces, cx + R * 1.2, cy + R * 0.7, R * 0.25, 3, pr(0.2), rand, 'bl');
      break;
    }
    case 'tart': {
      food += `<circle cx="${cx + 10}" cy="${cy + 14}" r="${R * 1.02}" fill="#3a2a10" opacity=".16" filter="url(#soft)"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="#d9a45a"/><circle cx="${cx}" cy="${cy}" r="${R * 0.86}" fill="#f2e2b3"/>`;
      for (let k = 0; k < 32; k++) { const a = (k / 32) * Math.PI * 2; food += `<circle cx="${r1(cx + Math.cos(a) * R * 0.93)}" cy="${r1(cy + Math.sin(a) * R * 0.93)}" r="${pr(0.06)}" fill="#c98f45"/>`; }
      const spear = pieces.includes('asparagus-white') ? 'asparagus-white' : 'asparagus';
      for (let k = 0; k < 9; k++) food += ingredientNested(spear, cx + Math.cos((k / 9) * Math.PI * 2) * R * 0.42, cy + Math.sin((k / 9) * Math.PI * 2) * R * 0.42, pr(0.5), (k / 9) * 360 + 90, `ta${k}`);
      food += scatter(['cheese', 'dill'], cx, cy, R * 0.2, 2, pr(0.2), rand, 'tc');
      break;
    }
    case 'salad': {
      food += bowl(cx, cy, R * 0.95, '#e9eed8');
      food += scatter(['spinach', 'basil'], cx, cy, R * 0.55, 8, pr(0.34), rand, 'sl');
      food += scatter(pieces, cx, cy, R * 0.55, 10, pr(0.24), rand, 'sa');
      food += scatter(['tomato'], cx, cy, R * 0.5, 3, pr(0.2), rand, 'st');
      break;
    }
    case 'fries': {
      food += plate(cx, cy, R);
      food += scatter(['fry'], cx - R * 0.1, cy, R * 0.45, 9, pr(0.42), rand, 'fr');
      const kx = cx + R * 0.42, ky = cy + R * 0.3;
      food += `<circle cx="${kx}" cy="${ky}" r="${pr(0.24)}" fill="#fbf8f2"/><circle cx="${kx}" cy="${ky}" r="${pr(0.19)}" fill="#b8321f"/><ellipse cx="${kx - 8}" cy="${ky - 10}" rx="10" ry="6" fill="#fff" opacity=".3"/>`;
      food += scatter(pieces.filter((p) => p !== 'fry').concat('dill'), cx, cy, R * 0.9, 2, pr(0.18), rand, 'fg');
      break;
    }
    case 'curry':
    case 'risotto': {
      const pan = d.dish === 'risotto';
      if (pan) food += `<rect x="${cx + R * 0.9}" y="${cy - 16}" width="${R * 0.9}" height="32" rx="14" fill="#2b2b2b"/><circle cx="${cx + 8}" cy="${cy + 12}" r="${R * 1.02}" fill="#3a2a10" opacity=".2" filter="url(#soft)"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="#303030"/><circle cx="${cx}" cy="${cy}" r="${R * 0.9}" fill="#efe1bd"/>`;
      else food += bowl(cx, cy, R * 0.94, '#e3a43e');
      for (let k = 0; k < 90; k++) food += `<ellipse cx="${r1(cx + (rand() - 0.5) * R * 1.5)}" cy="${r1(cy + (rand() - 0.5) * R * 1.5)}" rx="6" ry="3" fill="${pan ? '#f8f0da' : '#f1c46a'}" opacity=".9" transform="rotate(${r1(rand() * 180)} ${cx} ${cy})"/>`;
      food += scatter(pieces, cx, cy, R * 0.6, 9, pr(0.24), rand, 'cu');
      if (!pan) food += bowl(cx - R * 1.25, cy + R * 0.5, pr(0.34), '#f8f4ea');
      break;
    }
    case 'crumble': {
      food += `<rect x="${cx - R * 1.1 + 10}" y="${cy - R * 0.8 + 14}" width="${R * 2.2}" height="${R * 1.6}" rx="40" fill="#3a2a10" opacity=".16" filter="url(#soft)"/><rect x="${cx - R * 1.1}" y="${cy - R * 0.8}" width="${R * 2.2}" height="${R * 1.6}" rx="40" fill="#f7f2e8"/><rect x="${cx - R}" y="${cy - R * 0.7}" width="${R * 2}" height="${R * 1.4}" rx="30" fill="#8e2437"/>`;
      for (let k = 0; k < 70; k++) food += `<circle cx="${r1(cx + (rand() - 0.5) * R * 1.8)}" cy="${r1(cy + (rand() - 0.5) * R * 1.2)}" r="${r1(8 + rand() * 14)}" fill="${k % 3 ? '#e2b36a' : '#cf9a4e'}"/>`;
      food += scatter(pieces, cx, cy, R * 0.5, 6, pr(0.2), rand, 'cr');
      break;
    }
    case 'pizza': {
      food += `<circle cx="${cx + 10}" cy="${cy + 14}" r="${R * 1.02}" fill="#3a2a10" opacity=".16" filter="url(#soft)"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="#dcaa62"/><circle cx="${cx}" cy="${cy}" r="${R * 0.86}" fill="#c8452e"/>`;
      for (let k = 0; k < 14; k++) food += `<circle cx="${r1(cx + (rand() - 0.5) * R * 1.2)}" cy="${r1(cy + (rand() - 0.5) * R * 1.2)}" r="${r1(pr(0.08) + rand() * pr(0.08))}" fill="#f6e7b9"/>`;
      food += scatter(pieces, cx, cy, R * 0.6, 10, pr(0.2), rand, 'pz');
      break;
    }
    default: {
      food += plate(cx, cy, R);
      food += scatter(pieces, cx, cy, R * 0.55, 12, pr(0.26), rand, 'df');
    }
  }
  const loose = scatter(pieces, ratio === '3x2' ? W * 0.86 : W * 0.82, ratio === '3x2' ? H * 0.82 : H * 0.88, 60, 3, 70, rand, 'ls');
  const defs = `<defs><filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>${radial('pat', '#e7b865', '#b77a2e')}</defs>`;
  return svgDoc(W, H, defs + bg + food + loose, `${d.title} (zdjęcie zastępcze)`);
}

/* ---------- Sceny: produkt w użyciu 16:9, pole i zakład 21:9 ---------- */

export function sceneSVG(name: string) {
  const rand = rng(name);
  if (name === 'field' || name === 'plant') {
    const W = 2100, H = 900;
    let s = `<defs>${linear('sky', '#f6ead3', '#efdcb8')}${linear('soil', '#8b6a3e', '#5f4526')}</defs><rect width="${W}" height="${H}" fill="url(#sky)"/>
<circle cx="${W * 0.78}" cy="${H * 0.26}" r="90" fill="#f7c65a" opacity=".85"/>
<path d="M0 ${H * 0.5} C${W * 0.2} ${H * 0.42} ${W * 0.4} ${H * 0.52} ${W * 0.6} ${H * 0.46} C${W * 0.8} ${H * 0.4} ${W * 0.9} ${H * 0.46} ${W} ${H * 0.44} L${W} ${H} L0 ${H}Z" fill="#9dbb73"/>
<path d="M0 ${H * 0.58} C${W * 0.3} ${H * 0.52} ${W * 0.6} ${H * 0.6} ${W} ${H * 0.54} L${W} ${H} L0 ${H}Z" fill="#6f9a4c"/>`;
    if (name === 'plant') {
      const bx = W * 0.56, by = H * 0.52;
      s += `<g fill="#123f22"><rect x="${bx}" y="${by - 150}" width="420" height="150"/><path d="M${bx} ${by - 150} l70 -60 l70 60 l70 -60 l70 60 l70 -60 l70 60Z"/><rect x="${bx + 440}" y="${by - 230}" width="46" height="230"/><rect x="${bx - 200}" y="${by - 90}" width="200" height="90"/><rect x="${bx + 500}" y="${by - 110}" width="260" height="110"/></g>`;
      for (let i = 0; i < 8; i++) s += `<rect x="${bx + 24 + i * 50}" y="${by - 110}" width="26" height="40" fill="#f7c65a" opacity=".75"/>`;
    }
    const vx = W * 0.5, vy = H * 0.5;
    s += `<path d="M0 ${H * 0.66} L${W} ${H * 0.62} L${W} ${H} L0 ${H}Z" fill="#557f37"/>`;
    for (let i = -14; i <= 14; i++) {
      const x = W / 2 + i * 150;
      s += `<path d="M${vx + i * 18} ${H * 0.64} L${x} ${H}" stroke="#3d6628" stroke-width="${10 + Math.abs(i)}" opacity=".55"/>`;
      for (let k = 0; k < 7; k++) {
        const tt = 0.1 + k * 0.14;
        const px = vx + i * 18 + (x - (vx + i * 18)) * tt;
        const py = H * 0.64 + (H - H * 0.64) * tt;
        const rr = 6 + tt * 26;
        s += `<circle cx="${r1(px)}" cy="${r1(py)}" r="${r1(rr)}" fill="${k % 2 ? '#86b85a' : '#9fcb6d'}"/>`;
      }
    }
    void vy;
    return svgDoc(W, H, s, name === 'plant' ? 'Zakład produkcyjny wśród pól (ilustracja zastępcza)' : 'Pole uprawne o poranku (ilustracja zastępcza)');
  }
  if (name === 'kitchen-pro') {
    const W = 1600, H = 900;
    let s = `<defs>${linear('steel', '#d5dada', '#a9b2b2', 1, 1)}<filter id="soft"><feGaussianBlur stdDeviation="10"/></filter></defs><rect width="${W}" height="${H}" fill="url(#steel)"/>`;
    for (let i = 0; i < 60; i++) s += `<rect x="0" y="${r1(rand() * H)}" width="${W}" height="1.5" fill="#fff" opacity=".18"/>`;
    const cont: [number, number, number, number, string[]][] = [
      [80, 90, 420, 300, ['broccoli', 'cauliflower']],
      [540, 90, 300, 300, ['carrot-cube']],
      [880, 90, 300, 300, ['pea']],
      [80, 430, 300, 380, ['fry']],
      [420, 430, 300, 380, ['bean']],
      [760, 430, 420, 380, ['chanterelle']],
    ];
    cont.forEach(([x, y, w, h, p], ci) => {
      s += `<rect x="${x + 8}" y="${y + 12}" width="${w}" height="${h}" rx="18" fill="#000" opacity=".2" filter="url(#soft)"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#e4e8e8" stroke="#8d9696" stroke-width="6"/><rect x="${x + 16}" y="${y + 16}" width="${w - 32}" height="${h - 32}" rx="10" fill="#c3cbcb"/>`;
      for (let k = 0; k < Math.round((w * h) / 9000); k++) s += ingredientNested(p[k % p.length], x + 40 + rand() * (w - 80), y + 40 + rand() * (h - 80), 90 + rand() * 30, rand() * 360, `k${ci}_${k}`);
    });
    s += `<circle cx="1390" cy="330" r="200" fill="#000" opacity=".22" filter="url(#soft)"/><circle cx="1380" cy="320" r="190" fill="#2b2b2b"/><circle cx="1380" cy="320" r="168" fill="#3a3a3a"/>${scatter(['broccoli', 'carrot', 'pepper', 'zucchini'], 1380, 320, 120, 12, 90, rand, 'pan')}<rect x="1370" y="500" width="30" height="340" rx="15" fill="#2b2b2b"/>`;
    s += `<rect x="1230" y="620" width="300" height="220" rx="12" fill="#e8dcc4"/>${scatter(['dill', 'basil'], 1380, 730, 60, 3, 90, rand, 'bd')}`;
    return svgDoc(W, H, s, 'Kuchnia profesjonalna: pojemniki GN z warzywami Hortex (ilustracja zastępcza)');
  }
  // kitchen-home
  const W = 1600, H = 900;
  let s = `<defs>${linear('wood', '#d8b88c', '#c49c6a', 1, 0)}<filter id="soft"><feGaussianBlur stdDeviation="12"/></filter></defs><rect width="${W}" height="${H}" fill="url(#wood)"/>`;
  for (let i = 0; i < 9; i++) s += `<rect x="0" y="${i * 100}" width="${W}" height="3" fill="#a88257" opacity=".5"/>`;
  for (let i = 0; i < 40; i++) { const y = rand() * H; s += `<path d="M0 ${r1(y)} C400 ${r1(y + 10)} 1200 ${r1(y - 10)} ${W} ${r1(y + 6)}" stroke="#b58c5c" stroke-width="1.5" fill="none" opacity=".5"/>`; }
  s += `<rect x="130" y="120" width="520" height="620" rx="10" fill="#f1ece0"/>${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="130" y="${150 + i * 100}" width="520" height="8" fill="#c9d8b8"/>`).join('')}`;
  s += bowl(1050, 450, 280, '#f0d7a0').replace(/url\(#soft\)/g, 'url(#soft)');
  s += scatter(['broccoli', 'cauliflower', 'carrot', 'pea'], 1050, 450, 170, 12, 110, rand, 'hb');
  s += scatter(['dill', 'onion', 'potato'], 380, 430, 180, 5, 130, rand, 'hn');
  return svgDoc(W, H, s, 'Domowa kuchnia: obiad z warzyw Hortex (ilustracja zastępcza)');
}

/* ---------- Kafel kategorii (1:1) ---------- */

export function categoryTileSVG(slug: string, pieces: string[], tint: string) {
  const rand = rng(slug);
  let s = `<rect width="800" height="800" fill="${tint}"/>`;
  s += `<circle cx="400" cy="420" r="250" fill="#fff" opacity=".35"/>`;
  s += scatter(pieces, 400, 420, 210, 7, 210, rand, 'ct');
  return svgDoc(800, 800, `<defs><filter id="soft"><feGaussianBlur stdDeviation="10"/></filter></defs>${s}`, `Kategoria ${slug} (ilustracja zastępcza)`);
}
