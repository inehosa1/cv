import { afterEach, describe, expect, it, vi } from 'vitest';
import { duration, formatDate, plain, richSegments, yearRange } from '../src/lib/format.ts';
import type { CV } from '../src/lib/schema.ts';

const labels = {
  months: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
} as CV['meta']['labels'];

describe('formatDate', () => {
  it('formats YYYY-MM with the localized month', () => {
    expect(formatDate('2023-10', labels)).toBe('oct 2023');
    expect(formatDate('2026-01', labels)).toBe('ene 2026');
  });

  it('keeps a bare year as is', () => {
    expect(formatDate('2018', labels)).toBe('2018');
  });
});

describe('yearRange', () => {
  it('shows both years of a closed range', () => {
    expect(yearRange('2020-01', '2022-11', 'Actualidad')).toBe('2020 – 2022');
  });

  it('collapses a range that starts and ends in the same year', () => {
    expect(yearRange('2026-09', '2026-11', 'Actualidad')).toBe('2026');
  });

  it('uses the "present" label for an open range', () => {
    expect(yearRange('2023-10', undefined, 'Present')).toBe('2023 – Present');
  });
});

describe('duration', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts both ends inclusively', () => {
    expect(duration('2020-01', '2022-11', 'es')).toBe('2 años 11 meses');
    expect(duration('2022-11', '2023-11', 'en')).toBe('1 yr 1 mo');
  });

  it('uses singular units and drops empty parts', () => {
    expect(duration('2024-01', '2024-12', 'es')).toBe('1 año');
    expect(duration('2024-01', '2024-01', 'es')).toBe('1 mes');
  });

  it('measures an open range up to the current month', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 15)); // nov 2026
    expect(duration('2026-10', undefined, 'en')).toBe('2 mos');
  });
});

describe('richSegments', () => {
  it('splits **bold** markers into segments', () => {
    expect(richSegments('uso **FastAPI** y **React**')).toEqual([
      { text: 'uso ', bold: false },
      { text: 'FastAPI', bold: true },
      { text: ' y ', bold: false },
      { text: 'React', bold: true },
    ]);
  });

  it('returns plain text as a single segment', () => {
    expect(richSegments('sin marcas')).toEqual([{ text: 'sin marcas', bold: false }]);
  });
});

describe('plain', () => {
  it('removes bold markers', () => {
    expect(plain('**8+ años** de experiencia')).toBe('8+ años de experiencia');
  });
});
