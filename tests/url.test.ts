import { describe, expect, it } from 'vitest';
import { absoluteUrl, prettyUrl, withBase } from '../src/lib/url.ts';

// En Vitest, import.meta.env.BASE_URL es "/".
describe('withBase', () => {
  it('joins the base and the path without duplicate slashes', () => {
    expect(withBase('/proyectos/')).toBe('/proyectos/');
    expect(withBase('proyectos/')).toBe('/proyectos/');
    expect(withBase()).toBe('/');
  });
});

describe('absoluteUrl', () => {
  it('resolves an internal path against the site origin', () => {
    expect(absoluteUrl('/en/projects/', 'https://example.org')).toBe(
      'https://example.org/en/projects/',
    );
  });
});

describe('prettyUrl', () => {
  it('drops the protocol, www and the trailing slash', () => {
    expect(prettyUrl('https://www.linkedin.com/in/foo/')).toBe('linkedin.com/in/foo');
    expect(prettyUrl('http://github.com/inehosa1')).toBe('github.com/inehosa1');
  });
});
