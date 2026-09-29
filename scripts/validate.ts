/**
 * Valida data/cv.<lang>.yaml contra el esquema, comprueba que los idiomas tengan
 * la misma estructura y regenera schema/cv.schema.json (autocompletado en el editor).
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { z } from 'zod';
import { loadCV } from '../src/lib/cv.ts';
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

/** Firma estructural: longitudes de listas y valores que no se traducen. */
const shape = (v: unknown, path = ''): string[] => {
  if (Array.isArray(v))
    return [`${path}[${v.length}]`, ...v.flatMap((x, i) => shape(x, `${path}[${i}]`))];
  if (v && typeof v === 'object')
    return Object.entries(v).flatMap(([k, x]) => shape(x, path ? `${path}.${k}` : k));
  return /(Date|url|email|phone|lastModified)$/.test(path) ? [`${path}=${String(v)}`] : [];
};

const [base, ...others] = cvs;
if (base) {
  const ref = new Set(shape({ ...base, meta: {} }));
  others.forEach((cv, i) => {
    if (!cv) return;
    const lang = LANGS[i + 1];
    const cur = new Set(shape({ ...cv, meta: {} }));
    const diff = [...ref].filter((x) => !cur.has(x)).concat([...cur].filter((x) => !ref.has(x)));
    // Las URLs del propio sitio pueden variar por idioma (p. ej. /en/).
    const own = new URL(base.basics.url ?? 'https://invalid').origin;
    const relevant = diff.filter((d) => !/url=/.test(d) || !d.split('=')[1]?.startsWith(own));
    if (relevant.length)
      errors.push(
        `cv.${lang}.yaml difiere en estructura de cv.es.yaml:\n  ${relevant.join('\n  ')}`,
      );
  });
}

// Casos de estudio: mismo slug, nº de diagramas y de métricas en ambos idiomas.
const projectsDir = 'src/content/projects';
const signature = (lang: string, file: string) => {
  const src = readFileSync(`${projectsDir}/${lang}/${file}`, 'utf8');
  return `diagramas=${src.match(/```mermaid/g)?.length ?? 0} métricas=${src.match(/^ {2}- value:/gm)?.length ?? 0}`;
};
const [refLang, ...restLangs] = LANGS;
const refFiles = readdirSync(`${projectsDir}/${refLang}`).sort();
for (const lang of restLangs) {
  const files = readdirSync(`${projectsDir}/${lang}`).sort();
  const missing = refFiles.filter((f) => !files.includes(f));
  const extra = files.filter((f) => !refFiles.includes(f));
  if (missing.length || extra.length)
    errors.push(`Casos de estudio ${lang}: faltan [${missing}] · sobran [${extra}]`);
  for (const f of refFiles.filter((f) => files.includes(f))) {
    const a = signature(refLang, f);
    const b = signature(lang, f);
    if (a !== b) errors.push(`Caso ${f}: ${refLang} (${a}) ≠ ${lang} (${b})`);
  }
}

if (errors.length) {
  console.error(`✗ Validación fallida\n\n${errors.join('\n\n')}`);
  process.exit(1);
}
console.log(`✓ CV válido (${LANGS.join(', ')}) · schema/cv.schema.json actualizado`);
