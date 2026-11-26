import { describe, expect, it } from 'vitest';
import { caseSignature, shape, structuralDiff } from '../src/lib/parity.ts';

describe('shape', () => {
  it('records list lengths and untranslated values only', () => {
    expect(
      shape({ work: [{ name: 'Acme', startDate: '2020-01', highlights: ['a', 'b'] }] }),
    ).toEqual(['work[1]', 'work[0].startDate=2020-01', 'work[0].highlights[2]']);
  });
});

describe('structuralDiff', () => {
  const es = {
    work: [{ position: 'Ingeniero', startDate: '2020-01' }],
    basics: { url: 'https://x.dev/' },
  };

  it('ignores translated text', () => {
    const en = {
      work: [{ position: 'Engineer', startDate: '2020-01' }],
      basics: { url: 'https://x.dev/' },
    };
    expect(structuralDiff(es, en)).toEqual([]);
  });

  it('reports different dates and list lengths in both directions', () => {
    const en = {
      work: [{ position: 'Engineer', startDate: '2020-02' }, { position: 'Dev' }],
      basics: { url: 'https://x.dev/' },
    };
    expect(structuralDiff(es, en)).toEqual(
      expect.arrayContaining([
        'work[1]',
        'work[2]',
        'work[0].startDate=2020-01',
        'work[0].startDate=2020-02',
      ]),
    );
  });

  it('allows the site own URLs to differ by language', () => {
    const en = { ...es, basics: { url: 'https://x.dev/en/' } };
    expect(structuralDiff(es, en, 'https://x.dev')).toEqual([]);
    expect(structuralDiff(es, en)).not.toEqual([]);
  });
});

describe('caseSignature', () => {
  it('counts Mermaid diagrams and frontmatter metrics', () => {
    const mdx = [
      '---',
      'metrics:',
      '  - value: "1"',
      '    label: a',
      '  - value: "2"',
      '    label: b',
      '---',
      '```mermaid',
      'flowchart TB',
      '```',
    ].join('\n');
    expect(caseSignature(mdx)).toBe('diagramas=1 métricas=2');
  });
});
