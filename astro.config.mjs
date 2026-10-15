// @ts-check
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import rehypeMermaid from 'rehype-mermaid';
import { mermaidDark, mermaidLight } from './src/lib/mermaid-theme.mjs';
import rehypeDiagramWidth from './src/lib/rehype-diagram-width.mjs';

// En GitHub Actions, SITE y BASE_PATH los inyecta actions/configure-pages.
const site = process.env.SITE || 'https://inehosa1.github.io';
const base = process.env.BASE_PATH || '/cv';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  build: {
    // CSS incrustado en cada HTML: GitHub Pages cachea el HTML ~10 min y cada despliegue
    // borra los CSS con hash anteriores; un HTML cacheado pedía un CSS ya borrado (404) y la
    // página se veía sin estilos. Incrustado, cada página es autosuficiente.
    inlineStylesheets: 'always',
  },
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
  },
  markdown: {
    // Mermaid se renderiza a SVG en build (Playwright); sin JS en el cliente.
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid'] },
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
    processor: unified({
      rehypePlugins: [
        [rehypeMermaid, { strategy: 'img-svg', mermaidConfig: mermaidLight, dark: mermaidDark }],
        rehypeDiagramWidth,
      ],
    }),
  },
  integrations: [
    mdx(),
    sitemap({
      i18n: { defaultLocale: 'es', locales: { es: 'es-CO', en: 'en-US' } },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
