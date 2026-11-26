/**
 * Comparación estructural entre las versiones de idioma del CV.
 *
 * Dos traducciones son equivalentes si tienen las mismas listas con las mismas
 * longitudes y los mismos valores no traducibles (fechas, URLs, email, teléfono).
 */

/** Claves cuyo valor no se traduce y debe coincidir entre idiomas. */
const UNTRANSLATED = /(Date|url|email|phone|lastModified|project)$/;

/** Firma estructural de un valor: rutas de listas con su longitud y valores no traducibles. */
export function shape(value: unknown, path = ''): string[] {
  if (Array.isArray(value))
    return [`${path}[${value.length}]`, ...value.flatMap((x, i) => shape(x, `${path}[${i}]`))];
  if (value && typeof value === 'object')
    return Object.entries(value).flatMap(([k, x]) => shape(x, path ? `${path}.${k}` : k));
  return UNTRANSLATED.test(path) ? [`${path}=${String(value)}`] : [];
}

/**
 * Diferencias de estructura entre dos versiones (simétrica).
 * `ownOrigin`: las URLs del propio sitio pueden cambiar por idioma (p. ej. `/en/`) y se ignoran.
 */
export function structuralDiff(a: unknown, b: unknown, ownOrigin?: string): string[] {
  const ref = new Set(shape(a));
  const cur = new Set(shape(b));
  const diff = [...ref].filter((x) => !cur.has(x)).concat([...cur].filter((x) => !ref.has(x)));
  if (!ownOrigin) return diff;
  return diff.filter((d) => !/url=/.test(d) || !d.split('=')[1]?.startsWith(ownOrigin));
}

/** Firma de un caso de estudio MDX: nº de diagramas Mermaid y de métricas del frontmatter. */
export const caseSignature = (mdx: string) =>
  `diagramas=${mdx.match(/```mermaid/g)?.length ?? 0} métricas=${mdx.match(/^ {2}- value:/gm)?.length ?? 0}`;
