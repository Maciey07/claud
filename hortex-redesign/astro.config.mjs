// @ts-check
import { defineConfig } from 'astro/config';

// Prototyp statyczny: URL-e 1:1 ze strukturą hortex.pl (katalogi z końcowym ukośnikiem).
export default defineConfig({
  site: 'https://hortex-redesign.example',
  trailingSlash: 'always',
  // CSS wbudowany w HTML: brak zasobów blokujących renderowanie
  build: { format: 'directory', inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
  // Katalog przeniesiony z Aktualności do huba B2B (na hostingu: prawdziwe 301)
  redirects: {
    '/aktualnosci/katalogi-hortex/': { status: 301, destination: '/dla-biznesu/katalogi/' },
  },
});
