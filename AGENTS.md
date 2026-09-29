# AGENTS.md

Guía para agentes de IA (Claude Code, Codex, Cursor, Copilot, etc.) que trabajen en este repositorio.
Este archivo es la **fuente canónica** de instrucciones; `CLAUDE.md` lo importa.

## Objetivo del proyecto

Generar el CV profesional del propietario del repositorio a partir de **una única fuente de datos**, con dos salidas:

1. **Sitio web** (preview online, responsive, accesible, SEO) publicado en GitHub Pages.
2. **PDF** optimizado para ATS (texto real y seleccionable, una columna, sin tablas/imágenes para contenido).

Ambas salidas deben quedar siempre sincronizadas: nunca se edita contenido en las plantillas, solo en los datos.

## Stack

| Capa | Tecnología | Motivo |
|------|-----------|--------|
| Datos | YAML inspirado en [JSON Resume](https://jsonresume.org/schema) | Estándar abierto, portable, validable |
| Validación | Zod 4 (`src/lib/schema.ts`) | Falla el build si falta/sobra un campo; genera `schema/cv.schema.json` para el editor |
| Web | [Astro 7](https://astro.build) + TypeScript estricto | HTML estático, 0 JS de cliente |
| Casos de estudio | MDX en content collection (`src/content.config.ts`) | Prosa técnica larga con frontmatter validado |
| Diagramas | Mermaid → SVG en build (rehype-mermaid + Playwright) | Diagramas como código, variante clara/oscura, 0 JS |
| Estilos | Tailwind CSS 4 + Inter Variable (self-hosted) | Tokens en `src/styles/global.css`, modo oscuro, CSS de impresión |
| PDF | [Typst 0.15](https://typst.app) | Lee el YAML nativamente, compila en ms, PDF con texto real (ATS) |
| Lint/format | Biome 2 | Un solo tool, rápido |
| CI/CD | GitHub Actions → GitHub Pages | Preview online; PDFs como artefacto en PRs |

Node **24** (`.nvmrc`; Astro 7 exige ≥ 22.12) · pnpm 10 · Typst 0.15.1.

## Estructura

```
cv/
├── data/
│   ├── cv.es.yaml            # Fuente de verdad (español)
│   └── cv.en.yaml            # Traducción; misma estructura (lo valida `pnpm validate`)
├── schema/cv.schema.json     # Generado: autocompletado/validación del YAML en el editor
├── src/
│   ├── lib/
│   │   ├── schema.ts         # Esquema Zod (contrato de los datos)
│   │   ├── cv.ts             # loadCV(lang): lee + valida
│   │   ├── format.ts         # Fechas, duraciones, **negrita**
│   │   └── url.ts            # withBase(), prettyUrl()
│   ├── content/projects/{es,en}/<slug>.mdx  # Casos de estudio (mismo slug en ambos idiomas)
│   ├── content.config.ts     # Esquema del frontmatter de los casos
│   ├── components/           # Resume, ProjectsIndex, ProjectDetail, SiteNav, Section, Rich, Icon
│   ├── layouts/Base.astro    # <head>: SEO, Open Graph, hreflang, JSON-LD Person
│   ├── pages/index.astro     # /      → CV ES          · pages/en/index.astro → /en/
│   ├── pages/proyectos/      # /proyectos/[slug]/     · pages/en/projects/  → /en/projects/[slug]/
│   ├── lib/i18n.ts           # Rutas y textos de interfaz del sitio (no del CV)
│   ├── lib/mermaid-theme.mjs # Temas Mermaid claro/oscuro (sincronizar con global.css)
│   └── styles/global.css     # Tokens de diseño (sincronizar con typst/cv.typ)
├── typst/
│   ├── cv.typ                # Plantilla PDF (`--input lang=es|en`)
│   ├── og.typ                # Imagen Open Graph 1200×630
│   └── fonts/                # Inter (OFL), embebida en el PDF
├── scripts/
│   ├── validate.ts           # Esquema + paridad es/en (CV y casos de estudio) + genera schema/
│   └── build-pdf.ts          # PDFs + OG, y verifica máx. 2 páginas
├── public/                   # favicon, robots; cv-*.pdf y og-*.png se generan (ignorados en git)
├── reference/                # CV original de partida (solo consulta)
└── .github/workflows/deploy.yml
```

## Comandos

```bash
pnpm install              # Instalar dependencias
pnpm dev                  # Genera PDFs y levanta la web en http://localhost:4321/cv/
pnpm pdf                  # Solo PDFs + OG; falla si alguno supera 2 páginas
pnpm pdf:watch            # Recompila el PDF en español al guardar
pnpm validate             # Valida YAML (esquema + paridad es/en)
pnpm check                # validate + astro check + biome
pnpm build                # validate + pdf + astro build → dist/
pnpm preview              # Sirve dist/ localmente
pnpm lint:fix             # Biome con autofix
```

Los scripts `.ts` se ejecutan con Node directamente (type stripping), por eso los imports llevan extensión `.ts`.
Typst debe estar en el PATH (binario de GitHub Releases en `~/.local/bin`); en CI se usa `typst-community/setup-typst`.

## Buenas prácticas de contenido (obligatorias)

- **Longitud:** 1 página (≤10 años de experiencia) o máximo 2. Verificar tras cada cambio en el PDF.
- **Logros, no tareas:** cada bullet = verbo de acción + qué + impacto cuantificado (%, tiempo, dinero, usuarios).
  - ❌ "Responsable del backend"  ✅ "Reduje la latencia p95 de la API un 40 % migrando a caché Redis"
- **Orden:** cronológico inverso. Rol más reciente con más detalle (3–5 bullets), roles antiguos 1–2.
- **Resumen:** 2–3 líneas, orientado al puesto objetivo, sin clichés ("proactivo", "trabajo en equipo").
- **Skills:** agrupadas por categoría; solo tecnologías que se puedan defender en entrevista.
- **Sin datos sensibles:** nada de foto, edad, estado civil, DNI ni dirección completa (solo ciudad/país).
- **Fechas consistentes:** formato `YYYY-MM` en el YAML; la presentación la decide cada plantilla.
- **Enlaces:** LinkedIn, GitHub y portfolio con URL completa y visible en el PDF.
- No inventar información: si falta un dato, dejar un `TODO` en el YAML y avisar al usuario.

## Casos de estudio (landing de proyectos)

- Un caso = `src/content/projects/es/<slug>.mdx` + `src/content/projects/en/<slug>.mdx`, con el mismo nº de diagramas y métricas (lo valida `pnpm validate`).
- **Confidencialidad (proyectos de clientes, `nda: true`)**: nunca incluir secretos, hosts o IDs internos, datos personales, nombres de clientes finales del cliente, ni detalles explotables de vulnerabilidades (describir la mejora, no el agujero). Cifras de negocio siempre redondeadas.
- Métricas solo verificables (historial de git, informes de cobertura, documentación del proyecto). En YAML van **siempre entre comillas** (`"1.500"` sin comillas es el número 1,5).
- Diagramas en bloques ```` ```mermaid ````. Priorizar `flowchart TB`, agrupar nodos similares en uno y mensajes cortos en `sequenceDiagram`: el SVG debe medir ≤ ~1100 px de ancho para leerse sin escalar (comprobar el atributo `width` del `<img>` en `dist/`).
- Tras cambiar un caso, revisar la página renderizada (escritorio, móvil y modo oscuro).

## Reglas técnicas

- **Una sola fuente de verdad:** todo texto del CV vive en `data/*.yaml`. Las plantillas (Astro y Typst) solo presentan.
- Al añadir un campo al YAML: actualizar el esquema Zod **y** ambas plantillas en el mismo cambio.
- `cv.es.yaml` y `cv.en.yaml` deben tener la misma estructura; `pnpm check` lo valida.
- **ATS (PDF):** una columna, encabezados estándar (Experiencia, Educación, Habilidades), fuentes embebidas, sin texto en imágenes, sin iconos que sustituyan palabras.
- **Web:**
  - HTML semántico (`<header>`, `<section>`, `<article>`, `<time datetime>`), un solo `<h1>`.
  - Accesibilidad WCAG 2.2 AA: contraste ≥ 4.5:1, foco visible, `lang` correcto.
  - Modo claro/oscuro con `prefers-color-scheme`; hoja `@media print` limpia.
  - Metadatos: `<title>`, description, Open Graph, `hreflang` es/en y JSON-LD `schema.org/Person`.
  - Objetivo Lighthouse: 100 en Performance, Accessibility, Best Practices y SEO.
  - Sin JavaScript de cliente salvo que sea imprescindible (p. ej. selector de idioma puede ser un enlace).
- Botón visible "Descargar PDF" que apunte al PDF del idioma actual.
- **Privacidad:** el teléfono sale en el PDF y en la cabecera de la web (decisión del usuario), pero nunca en el JSON-LD.
- Biome no entiende el uso de variables en las plantillas `.astro`: las reglas de "unused" están desactivadas para esos archivos en `biome.json`; no borrar imports "sin usar" en `.astro`.
- Textos de interfaz (títulos de sección, meses, botones) viven en `meta.labels` del YAML, no en el código.
- TypeScript en modo `strict`; sin `any`.

## Flujo de trabajo para agentes

1. Leer `data/cv.es.yaml` antes de proponer cambios de contenido.
2. Cambios de contenido → editar YAML (ambos idiomas) → `pnpm check` → `pnpm pdf` y revisar número de páginas.
3. Cambios de diseño → verificar en `pnpm dev` a 375 px, 768 px y 1280 px, en modo oscuro y en vista de impresión. Si cambias colores, mantenerlos sincronizados entre `global.css` y `typst/cv.typ`.
4. Antes de dar algo por terminado: `pnpm check && pnpm build` sin errores.
5. No hacer commit ni push salvo que el usuario lo pida. Mensajes de commit en formato Conventional Commits (`feat:`, `fix:`, `content:`, `style:`).

## Despliegue

- Push a `main` → GitHub Actions ejecuta `pnpm build` (incluye Typst) → publica `dist/` en GitHub Pages.
- URLs: `https://inehosa1.github.io/cv/` (ES), `/cv/en/` (EN), `/cv/proyectos/`, `/cv/en/projects/`, `/cv/cv-es.pdf`, `/cv/cv-en.pdf`.
- El build necesita Chromium de Playwright (`pnpm exec playwright install chromium`) para los diagramas.
- En pull requests no se publica: los PDFs quedan como artefacto `cv-pdf` del workflow.
- Rebuild mensual programado (actualiza la duración del empleo actual).
- `SITE` y `BASE_PATH` los inyecta `actions/configure-pages`; los valores por defecto locales están en `astro.config.mjs`. Si hay dominio propio, actualizar también `basics.url` en el YAML y `public/robots.txt`.
