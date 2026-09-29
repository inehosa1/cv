import type { CV } from './schema.ts';

type Labels = CV['meta']['labels'];

/** `2023-10` → `oct 2023`; `2018` → `2018`. */
export function formatDate(date: string, labels: Labels): string {
  const [year, month] = date.split('-');
  return month ? `${labels.months[Number(month) - 1]} ${year}` : (year ?? date);
}

/** Duración legible entre dos fechas `YYYY-MM` (fin abierto = hoy). */
export function duration(start: string, end: string | undefined, lang: CV['meta']['lang']): string {
  const toMonths = (d: string) => {
    const [y, m = '1'] = d.split('-');
    return Number(y) * 12 + Number(m) - 1;
  };
  const now = new Date();
  const endMonths = end ? toMonths(end) : now.getFullYear() * 12 + now.getMonth();
  const total = endMonths - toMonths(start) + 1;
  const years = Math.floor(total / 12);
  const months = total % 12;
  const unit = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  const parts =
    lang === 'es'
      ? [years && unit(years, 'año', 'años'), months && unit(months, 'mes', 'meses')]
      : [years && unit(years, 'yr', 'yrs'), months && unit(months, 'mo', 'mos')];
  return parts.filter(Boolean).join(' ');
}

/** Divide `texto con **negrita**` en segmentos para renderizar sin HTML crudo. */
export function richSegments(text: string): { text: string; bold: boolean }[] {
  return text
    .split('**')
    .map((t, i) => ({ text: t, bold: i % 2 === 1 }))
    .filter((s) => s.text.length > 0);
}

/** Texto plano (sin marcas) para meta tags y JSON-LD. */
export const plain = (text: string) => text.replaceAll('**', '');
