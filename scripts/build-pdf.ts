/**
 * Compila el PDF de cada idioma con Typst y verifica el número de páginas.
 * También genera la imagen Open Graph public/og-<lang>.png.
 * Salida: public/ (Astro lo copia a dist/ en el build).
 */
import { execFileSync } from 'node:child_process';
import { LANGS } from '../src/lib/schema.ts';

const MAX_PAGES = 2;
const common = ['--root', '.', '--font-path', 'typst/fonts', '--ignore-system-fonts'];

let failed = false;
for (const lang of LANGS) {
  const input = ['--input', `lang=${lang}`];
  const out = `public/cv-${lang}.pdf`;
  execFileSync('typst', ['compile', ...common, ...input, 'typst/cv.typ', out], {
    stdio: 'inherit',
  });
  const pages = Number(
    execFileSync(
      'typst',
      ['eval', ...common, ...input, '--in', 'typst/cv.typ', 'query(<page-count>).first().value'],
      { encoding: 'utf8' },
    ).trim(),
  );
  execFileSync('typst', [
    'compile',
    ...common,
    ...input,
    '--format',
    'png',
    '--ppi',
    '72',
    'typst/og.typ',
    `public/og-${lang}.png`,
  ]);
  const ok = pages <= MAX_PAGES;
  failed ||= !ok;
  console.log(`${ok ? '✓' : '✗'} ${out} · ${pages} página(s)${ok ? '' : ` (máximo ${MAX_PAGES})`}`);
}
if (failed) process.exit(1);
