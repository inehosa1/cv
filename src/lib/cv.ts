import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { type CV, cvSchema, type Lang } from './schema.ts';

/** Ruta del YAML de un idioma, relativa a la raíz del proyecto. */
export const dataPath = (lang: Lang) => resolve(process.cwd(), 'data', `cv.${lang}.yaml`);

/** Lee y valida el CV. Lanza un error legible si el YAML no cumple el esquema. */
export function loadCV(lang: Lang): CV {
  const raw: unknown = parse(readFileSync(dataPath(lang), 'utf8'));
  const result = cvSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.') || '(raíz)'}: ${i.message}`)
      .join('\n');
    throw new Error(`data/cv.${lang}.yaml no es válido:\n${issues}`);
  }
  return result.data;
}
