import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Casos de estudio técnicos: src/content/projects/<lang>/<slug>.mdx
 * El mismo <slug> debe existir en ambos idiomas (lo valida scripts/validate.ts).
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: z.strictObject({
    title: z.string(),
    /** Frase de una línea para la tarjeta. */
    tagline: z.string(),
    client: z.string(),
    /** Empresa desde la que se hizo el trabajo. */
    company: z.string(),
    role: z.string(),
    start: z.string().regex(/^\d{4}(-\d{2})?$/),
    end: z
      .string()
      .regex(/^\d{4}(-\d{2})?$/)
      .optional(),
    /** Orden en la landing (menor = primero). */
    order: z.number().int(),
    /** Cifras destacadas, siempre entre comillas en YAML ("1.500" sería el número 1,5). Solo datos verificables. */
    metrics: z
      .array(z.strictObject({ value: z.string(), label: z.string() }))
      .max(4)
      .default([]),
    stack: z.array(z.strictObject({ group: z.string(), items: z.array(z.string()).min(1) })),
    /** Etiquetas cortas para filtrar/escanear. */
    tags: z.array(z.string()).max(6),
    /** Confidencialidad: si true, no se enlaza código ni se nombran datos internos. */
    nda: z.boolean().default(true),
  }),
});

export const collections = { projects };
