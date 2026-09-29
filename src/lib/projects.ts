import type { CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

/** `es/culligan` → `culligan`. */
export const projectSlug = (p: Project) => p.id.split('/').slice(1).join('/');

export const sortProjects = (ps: Project[]) => [...ps].sort((a, b) => a.data.order - b.data.order);
