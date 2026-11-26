/**
 * Recorre el sitio construido (dist/) como lo haría un visitante y falla si encuentra:
 *  - violaciones de accesibilidad WCAG 2.2 A/AA (axe), en modo claro y oscuro;
 *  - enlaces o recursos internos que no respondan 200.
 *
 * Uso: `pnpm build && pnpm check:site`. Levanta `astro preview` en un puerto libre.
 */
import { type ChildProcess, spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { chromium, type Page } from 'playwright';

const PORT = 4329;
const ORIGIN = `http://localhost:${PORT}`;
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** Rutas de todas las páginas, sacadas del sitemap generado (sin dominio). */
function pagePaths(): string[] {
  const xml = readFileSync('dist/sitemap-0.xml', 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1] ?? '').pathname);
}

async function startPreview(): Promise<ChildProcess> {
  const server = spawn('pnpm', ['exec', 'astro', 'preview', '--port', String(PORT)], {
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('astro preview no arrancó en 30 s')), 30_000);
    server.stdout?.on('data', (chunk: Buffer) => {
      if (chunk.toString().includes(String(PORT))) {
        clearTimeout(timer);
        resolve();
      }
    });
    server.on('exit', (code) => reject(new Error(`astro preview terminó (código ${code})`)));
  });
  return server;
}

/** URLs internas que referencia la página: enlaces, imágenes y hojas de estilo. */
async function internalRefs(page: Page): Promise<string[]> {
  const refs = await page.$$eval('a[href], img[src], link[href]', (els) =>
    els.map((el) =>
      el instanceof HTMLAnchorElement || el instanceof HTMLLinkElement
        ? el.href
        : (el as HTMLImageElement).src,
    ),
  );
  return refs
    .map((r) => new URL(r))
    .filter((u) => u.origin === ORIGIN)
    .map((u) => `${u.origin}${u.pathname}`);
}

async function main() {
  const server = await startPreview();
  const browser = await chromium.launch();
  const problems: string[] = [];
  const refs = new Set<string>();
  const paths = pagePaths();

  try {
    for (const scheme of ['light', 'dark'] as const) {
      const context = await browser.newContext({ colorScheme: scheme, reducedMotion: 'reduce' });
      const page = await context.newPage();
      for (const path of paths) {
        const res = await page.goto(`${ORIGIN}${path}`);
        if (res?.status() !== 200) problems.push(`${path}: HTTP ${res?.status()}`);
        const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
        for (const v of violations) {
          const nodes = v.nodes
            .map(
              (n) => `      ${n.target.join(' ')} — ${n.any[0]?.message ?? n.failureSummary ?? ''}`,
            )
            .join('\n');
          problems.push(`${path} [${scheme}] ${v.id}: ${v.help}\n${nodes}`);
        }
        if (scheme === 'light') for (const r of await internalRefs(page)) refs.add(r);
      }
      await context.close();
    }

    for (const ref of refs) {
      const res = await fetch(ref, { method: 'HEAD' });
      if (res.status !== 200) problems.push(`enlace roto: ${ref} → ${res.status}`);
    }
  } finally {
    await browser.close();
    server.kill();
  }

  if (problems.length) {
    console.error(`✗ ${problems.length} problema(s) en el sitio:\n  ${problems.join('\n  ')}`);
    process.exit(1);
  }
  console.log(
    `✓ ${paths.length} páginas sin violaciones WCAG (claro y oscuro) · ${refs.size} enlaces internos OK`,
  );
}

await main();
