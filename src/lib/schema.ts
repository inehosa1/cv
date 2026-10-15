/**
 * Esquema del CV basado en JSON Resume (https://jsonresume.org/schema)
 * con extensiones propias (`meta`, `technologies`, `competencies`).
 *
 * Lo usan: las páginas Astro (build), scripts/validate.ts y, de forma
 * implícita, la plantilla Typst (que lee el mismo YAML).
 */
import { z } from 'zod';

/** Fecha parcial `YYYY-MM` o `YYYY`. */
const partialDate = z.string().regex(/^\d{4}(-(0[1-9]|1[0-2]))?$/, 'Usa el formato YYYY-MM o YYYY');

/** Texto con énfasis opcional `**negrita**`. Sin HTML. */
const richText = z
  .string()
  .min(1)
  .refine((s) => !/[<>]/.test(s), 'No uses HTML; solo **negrita**')
  .refine((s) => (s.match(/\*\*/g)?.length ?? 0) % 2 === 0, 'Hay un ** sin cerrar');

const url = z.url();

export const cvSchema = z.strictObject({
  meta: z.strictObject({
    lang: z.enum(['es', 'en']),
    /** Título de la página y del PDF. */
    title: z.string(),
    /** Meta description (SEO), 120–160 caracteres. */
    description: z.string().min(80).max(170),
    /** Última revisión del contenido. */
    lastModified: partialDate,
    labels: z.strictObject({
      summary: z.string(),
      competencies: z.string(),
      work: z.string(),
      projects: z.string(),
      skills: z.string(),
      education: z.string(),
      certificates: z.string(),
      languages: z.string(),
      technologies: z.string(),
      present: z.string(),
      downloadPdf: z.string(),
      switchLang: z.string(),
      contact: z.string(),
      degreeIn: z.string(),
      months: z.array(z.string()).length(12),
    }),
  }),

  basics: z.strictObject({
    name: z.string(),
    label: z.string(),
    email: z.email(),
    phone: z.string().optional(),
    url: url.optional(),
    summary: richText,
    /** Modalidad y zona horaria, p. ej. "Remoto · UTC−5". */
    availability: z.string().optional(),
    location: z.strictObject({
      city: z.string(),
      countryCode: z.string().length(2),
      country: z.string(),
      remote: z.string().optional(),
    }),
    profiles: z.array(
      z.strictObject({
        network: z.string(),
        username: z.string(),
        url,
      }),
    ),
  }),

  /** Portada del sitio (home): propuesta de valor y cifras. No aparece en el PDF. */
  home: z.strictObject({
    headline: z.string(),
    intro: z.string(),
    stats: z
      .array(z.strictObject({ value: z.string(), label: z.string() }))
      .min(2)
      .max(4),
  }),

  /** Principios de trabajo (sección "Cómo trabajo" de la web; el PDF los resume en el perfil). */
  principles: z
    .array(z.strictObject({ title: z.string(), description: z.string() }))
    .max(8)
    .default([]),

  /** Competencias clave (chips bajo el resumen). */
  competencies: z.array(z.string()).min(3).max(10),

  work: z
    .array(
      z
        .strictObject({
          name: z.string(),
          position: z.string(),
          location: z.string(),
          url: url.optional(),
          startDate: partialDate,
          endDate: partialDate.optional(),
          summary: richText.optional(),
          highlights: z.array(richText).max(8).default([]),
          /** Logros agrupados por cliente (puestos de consultoría con varios clientes). */
          groups: z
            .array(
              z.strictObject({
                name: z.string(),
                note: z.string().optional(),
                highlights: z.array(richText).min(1).max(4),
              }),
            )
            .max(5)
            .default([]),
          technologies: z.array(z.string()).default([]),
        })
        .refine(
          (w) => w.highlights.length + w.groups.length > 0,
          'Cada puesto necesita highlights o groups',
        ),
    )
    .min(1),

  projects: z
    .array(
      z.strictObject({
        name: z.string(),
        description: richText,
        url: url.optional(),
        highlights: z.array(richText).default([]),
        technologies: z.array(z.string()).default([]),
      }),
    )
    .default([]),

  skills: z.array(
    z.strictObject({
      name: z.string(),
      /** Las más fuertes, se resaltan. */
      featured: z.array(z.string()).default([]),
      keywords: z.array(z.string()).min(1),
    }),
  ),

  education: z.array(
    z.strictObject({
      institution: z.string(),
      area: z.string(),
      studyType: z.string(),
      endDate: partialDate,
      url: url.optional(),
    }),
  ),

  certificates: z
    .array(
      z.strictObject({
        name: z.string(),
        issuer: z.string().optional(),
        date: partialDate.optional(),
        url: url.optional(),
      }),
    )
    .default([]),

  languages: z.array(
    z.strictObject({
      language: z.string(),
      fluency: z.string(),
    }),
  ),
});

export type CV = z.infer<typeof cvSchema>;
export type Lang = CV['meta']['lang'];
export const LANGS = ['es', 'en'] as const satisfies readonly Lang[];
