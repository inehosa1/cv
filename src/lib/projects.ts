import type { CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

/** Lo mínimo que necesitan las funciones puras de este módulo (facilita los tests). */
type ProjectLike = { id: string; data: { order: number; tier: 'main' | 'other' } };

/** `es/seguros-mascotas` → `seguros-mascotas`. */
export const projectSlug = (p: Pick<ProjectLike, 'id'>) => p.id.split('/').slice(1).join('/');

/** Orden de la landing: menor `order` primero. No muta la entrada. */
export const sortProjects = <T extends ProjectLike>(ps: readonly T[]): T[] =>
  [...ps].sort((a, b) => a.data.order - b.data.order);

/** Separa los casos principales de la lista compacta "Otros proyectos", ambos ordenados. */
export function splitByTier<T extends ProjectLike>(ps: readonly T[]): { main: T[]; other: T[] } {
  const sorted = sortProjects(ps);
  return {
    main: sorted.filter((p) => p.data.tier === 'main'),
    other: sorted.filter((p) => p.data.tier === 'other'),
  };
}
