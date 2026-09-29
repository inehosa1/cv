/**
 * Miniatura del primer diagrama Mermaid de un caso de estudio, renderizada en build
 * (claro y oscuro) para las tarjetas destacadas. Sin JS en el cliente.
 */
import { createMermaidRenderer, type RenderOptions } from 'mermaid-isomorphic';
import { mermaidDark, mermaidLight } from './mermaid-theme.mjs';

type MermaidConfig = NonNullable<RenderOptions['mermaidConfig']>;
const light = mermaidLight as MermaidConfig;
const dark = mermaidDark as MermaidConfig;

export interface DiagramThumb {
  light: string;
  dark: string;
  width: number;
  height: number;
}

const render = createMermaidRenderer();
const cache = new Map<string, Promise<DiagramThumb | null>>();
const toDataUri = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

async function build(code: string, prefix: string): Promise<DiagramThumb | null> {
  const [[l], [d]] = await Promise.all([
    render([code], { mermaidConfig: light, prefix: `${prefix}-l` }),
    render([code], { mermaidConfig: dark, prefix: `${prefix}-d` }),
  ]);
  if (l?.status !== 'fulfilled' || d?.status !== 'fulfilled') return null;
  return {
    light: toDataUri(l.value.svg),
    dark: toDataUri(d.value.svg),
    width: Math.round(l.value.width),
    height: Math.round(l.value.height),
  };
}

export function diagramThumb(
  body: string | undefined,
  prefix: string,
): Promise<DiagramThumb | null> {
  const code = body?.match(/```mermaid\n([\s\S]*?)```/)?.[1];
  if (!code) return Promise.resolve(null);
  const key = `${prefix}:${code}`;
  let hit = cache.get(key);
  if (!hit) {
    hit = build(code, prefix);
    cache.set(key, hit);
  }
  return hit;
}
