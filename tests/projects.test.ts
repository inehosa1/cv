import { describe, expect, it } from 'vitest';
import { filtersFor } from '../src/lib/filters.ts';
import { projectSlug, sortProjects, splitByTier } from '../src/lib/projects.ts';

const project = (id: string, order: number, tier: 'main' | 'other' = 'main') => ({
  id,
  data: { order, tier },
});

describe('projectSlug', () => {
  it('removes the language folder from the entry id', () => {
    expect(projectSlug({ id: 'es/seguros-mascotas' })).toBe('seguros-mascotas');
    expect(projectSlug({ id: 'en/cv-as-code' })).toBe('cv-as-code');
  });
});

describe('sortProjects', () => {
  it('sorts by order without mutating the input', () => {
    const input = [project('es/b', 2), project('es/a', 1)];
    const sorted = sortProjects(input);
    expect(sorted.map((p) => p.id)).toEqual(['es/a', 'es/b']);
    expect(input.map((p) => p.id)).toEqual(['es/b', 'es/a']);
  });
});

describe('splitByTier', () => {
  it('separates main and other projects, each one sorted', () => {
    const { main, other } = splitByTier([
      project('es/x', 9, 'other'),
      project('es/b', 2),
      project('es/y', 7, 'other'),
      project('es/a', 1),
    ]);
    expect(main.map((p) => p.id)).toEqual(['es/a', 'es/b']);
    expect(other.map((p) => p.id)).toEqual(['es/y', 'es/x']);
  });
});

describe('filtersFor', () => {
  it('matches filters case-insensitively against tags and stack', () => {
    expect(filtersFor(['FastAPI', 'React 19', 'Cloud Run'])).toEqual(['fastapi', 'react', 'gcp']);
  });

  it('maps related technologies to the same filter', () => {
    expect(filtersFor(['Next.js'])).toEqual(['react']);
    expect(filtersFor(['Strangler fig'])).toEqual(['migration']);
  });

  it('returns nothing for unrelated text', () => {
    expect(filtersFor(['Typst', 'YAML'])).toEqual([]);
  });
});
