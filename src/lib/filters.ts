import type { Lang } from './schema.ts';

/** Filtros de la landing de proyectos. Un proyecto coincide si alguna palabra aparece en sus tags o su stack. */
export const techFilters: { id: string; label: Record<Lang, string>; match: string[] }[] = [
  { id: 'django', label: { es: 'Django', en: 'Django' }, match: ['django'] },
  { id: 'fastapi', label: { es: 'FastAPI', en: 'FastAPI' }, match: ['fastapi'] },
  { id: 'react', label: { es: 'React', en: 'React' }, match: ['react', 'next.js'] },
  { id: 'webhooks', label: { es: 'Webhooks', en: 'Webhooks' }, match: ['webhook', 'outbox'] },
  {
    id: 'payments',
    label: { es: 'Pagos', en: 'Payments' },
    match: ['stripe', 'adyen', 'wompi', 'hyperswitch', 'pagos', 'payments'],
  },
  { id: 'gcp', label: { es: 'GCP', en: 'GCP' }, match: ['gcp', 'cloud run', 'firestore'] },
  { id: 'aws', label: { es: 'AWS', en: 'AWS' }, match: ['aws'] },
  { id: 'shopify', label: { es: 'Shopify', en: 'Shopify' }, match: ['shopify'] },
  {
    id: 'migration',
    label: { es: 'Migraciones', en: 'Migrations' },
    match: ['migración', 'migration', 'strangler', 'legacy', 'huawei'],
  },
  {
    id: 'testing',
    label: { es: 'Testing', en: 'Testing' },
    match: ['pytest', 'playwright', 'selenium', 'vitest'],
  },
];

/** IDs de los filtros que aplican a un proyecto. */
export function filtersFor(haystack: string[]): string[] {
  const text = haystack.join(' ').toLowerCase();
  return techFilters.filter((f) => f.match.some((m) => text.includes(m))).map((f) => f.id);
}
