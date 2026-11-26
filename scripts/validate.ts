/**
 * Valida data/cv.<lang>.yaml contra el esquema, comprueba que los idiomas tengan la misma
 * estructura (también los casos de estudio) y regenera schema/cv.schema.json (autocompletado
 * en el editor). La lógica de comparación vive en src/lib/parity.ts y tiene tests.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { z } from 'zod';
import { loadCV } from '../src/lib/cv.ts';
import { caseSignature, structuralDiff } from '../src/lib/parity.ts';
import { cvSchema, LANGS } from '../src/lib/schema.ts';

mkdirSync('schema', { recursive: true });
writeFileSync(
  'schema/cv.schema.json',
  `${JSON.stringify(z.toJSONSchema(cvSchema, { io: 'input' }), null, 2)}\n`,
);

const errors: string[] = [];
const cvs = LANGS.map((lang) => {
  try {
    const cv = loadCV(lang);
    if (cv.meta.lang !== lang) errors.push(`cv.${lang}.yaml tiene meta.lang=${cv.meta.lang}`);
    return cv;
  } catch (e) {
    errors.push((e as Error).message);
    return undefined;
  }
});

const [base, ...others] = cvs;
if (base) {
  const own = new URL(base.basics.url ?? 'https://invalid').origin;
  others.forEach((cv, i) => {
    if (!cv) return;
    const diff = structuralDiff({ ...base, meta: {} }, { ...cv, meta: {} }, own);
    if (diff.length)
      errors.push(
        `cv.${LANGS[i + 1]}.yaml difiere en estructura de cv.es.yaml:\n  ${diff.join('\n  ')}`,
      );
  });
}

// Casos de estudio: mismo slug, nº de diagramas y de métricas en ambos idiomas.
const projectsDir = 'src/content/projects';
const read = (lang: string, file: string) => readFileSync(`${projectsDir}/${lang}/${file}`, 'utf8');
const [refLang, ...restLangs] = LANGS;
const refFiles = readdirSync(`${projectsDir}/${refLang}`).sort();
for (const lang of restLangs) {
  const files = readdirSync(`${projectsDir}/${lang}`).sort();
  const missing = refFiles.filter((f) => !files.includes(f));
  const extra = files.filter((f) => !refFiles.includes(f));
  if (missing.length || extra.length)
    errors.push(`Casos de estudio ${lang}: faltan [${missing}] · sobran [${extra}]`);
  for (const f of refFiles.filter((f) => files.includes(f))) {
    const a = caseSignature(read(refLang, f));
    const b = caseSignature(read(lang, f));
    if (a !== b) errors.push(`Caso ${f}: ${refLang} (${a}) ≠ ${lang} (${b})`);
  }
}

// Cada principio debe enlazar a un caso de estudio que exista.
const slugs = new Set(refFiles.map((f) => f.replace(/\.mdx$/, '')));
for (const cv of cvs) {
  for (const p of cv?.principles ?? []) {
    if (p.project && !slugs.has(p.project))
      errors.push(
        `cv.${cv?.meta.lang}.yaml: el principio "${p.title}" enlaza a un caso inexistente (${p.project})`,
      );
  }
}

if (errors.length) {
  console.error(`✗ Validación fallida\n\n${errors.join('\n\n')}`);
  process.exit(1);
}
console.log(`✓ CV válido (${LANGS.join(', ')}) · schema/cv.schema.json actualizado`);
