# CV — Ricardo Andrés Arango Ruiz

CV como código: **una sola fuente de datos** (`data/cv.*.yaml`) genera

- 🌐 un sitio web estático, bilingüe y accesible → https://inehosa1.github.io/cv/
- 🧩 una landing de casos de estudio técnicos con diagramas → https://inehosa1.github.io/cv/proyectos/
- 📄 un PDF compatible con ATS → [`cv-es.pdf`](https://inehosa1.github.io/cv/cv-es.pdf) · [`cv-en.pdf`](https://inehosa1.github.io/cv/cv-en.pdf)

Stack: Astro 7 · MDX · Mermaid · Tailwind CSS 4 · Typst · Zod · Biome · GitHub Actions/Pages.

## Uso

```bash
nvm use            # Node 24
pnpm install
pnpm dev           # http://localhost:4321/cv/
```

Requiere [Typst](https://github.com/typst/typst/releases) en el PATH y Chromium de Playwright (`pnpm exec playwright install chromium`) para los diagramas.

Para editar el contenido, modifica `data/cv.es.yaml` y `data/cv.en.yaml` y ejecuta `pnpm check`.
Las reglas de contenido y de código están en [`AGENTS.md`](./AGENTS.md).
