/** Comprobaciones sobre los datos reales del CV: lo que un cambio de contenido no debe romper. */
import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { loadCV } from '../src/lib/cv.ts';
import { structuralDiff } from '../src/lib/parity.ts';
import { LANGS } from '../src/lib/schema.ts';

const cvs = Object.fromEntries(LANGS.map((lang) => [lang, loadCV(lang)]));
const slugs = readdirSync('src/content/projects/es').map((f) => f.replace(/\.mdx$/, ''));

describe('CV data', () => {
  it.each(LANGS)('%s matches the schema and declares its language', (lang) => {
    expect(cvs[lang]?.meta.lang).toBe(lang);
  });

  it('has the same structure in every language', () => {
    const own = new URL(cvs.es?.basics.url ?? '').origin;
    expect(structuralDiff({ ...cvs.es, meta: {} }, { ...cvs.en, meta: {} }, own)).toEqual([]);
  });

  it('links every principle to an existing case study', () => {
    for (const cv of Object.values(cvs)) {
      for (const p of cv?.principles ?? []) {
        if (p.project) expect(slugs).toContain(p.project);
      }
    }
  });

  it('lists jobs in reverse chronological order', () => {
    const starts = cvs.es?.work.map((w) => w.startDate) ?? [];
    expect(starts).toEqual([...starts].sort().reverse());
  });
});
