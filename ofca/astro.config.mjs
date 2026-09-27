// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** @type {Record<string, string>} Stare adresy WordPressa → nowe (301). */
const redirects = JSON.parse(readFileSync(new URL('./redirects.json', import.meta.url), 'utf8'));

/** Strona /styleguide istnieje tylko w dev (lub gdy PUBLIC_STYLEGUIDE=true). */
function styleguide() {
  return {
    name: 'ofca-styleguide',
    hooks: {
      /** @param {any} opts */
      'astro:config:setup': ({ command, injectRoute }) => {
        if (command === 'dev' || process.env.PUBLIC_STYLEGUIDE === 'true') {
          injectRoute({ pattern: '/styleguide', entrypoint: './src/dev/styleguide.astro' });
        }
      },
    },
  };
}

/** Zapisuje reguły 301 w formacie _redirects (Netlify, Cloudflare Pages). */
function redirectsFile() {
  return {
    name: 'ofca-redirects-file',
    hooks: {
      /** @param {{ dir: URL }} opts */
      'astro:build:done': ({ dir }) => {
        const lines = Object.entries(redirects).map(([from, to]) => `${from} ${to} 301`);
        writeFileSync(fileURLToPath(new URL('_redirects', dir)), lines.join('\n') + '\n');
      },
    },
  };
}

export default defineConfig({
  site: 'https://festiwalofca.pl',
  trailingSlash: 'ignore',
  redirects: Object.fromEntries(Object.entries(redirects).map(([from, to]) => [from, { status: 301, destination: to }])),
  integrations: [
    styleguide(),
    redirectsFile(),
    sitemap({
      filter: (page) => !page.includes('/styleguide'),
      i18n: { defaultLocale: 'pl', locales: { pl: 'pl-PL', en: 'en-GB' } },
    }),
  ],
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  // Krytyczny CSS w HTML: brak blokujących żądań przed pierwszym malowaniem (PRD 10.8)
  build: { inlineStylesheets: 'always' },
});
