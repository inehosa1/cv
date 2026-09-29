// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import rehypeMermaid from 'rehype-mermaid';
import { mermaidDark, mermaidLight } from './src/lib/mermaid-theme.mjs';

// En GitHub Actions, SITE y BASE_PATH los inyecta actions/configure-pages.
const site = process.env.SITE || 'https://inehosa1.github.io';
const base = process.env.BASE_PATH || '/cv';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
  },
  markdown: {
    // Mermaid se renderiza a SVG en build (Playwright); sin JS en el cliente.
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid'] },
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
    rehypePlugins: [
      [rehypeMermaid, { strategy: 'img-svg', mermaidConfig: mermaidLight, dark: mermaidDark }],
    ],
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
