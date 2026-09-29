import type { Lang } from './schema.ts';

/** Rutas de cada sección por idioma. */
export const routes = {
  cv: { es: '/', en: '/en/' },
  projects: { es: '/proyectos/', en: '/en/projects/' },
  project: (slug: string) => ({ es: `/proyectos/${slug}/`, en: `/en/projects/${slug}/` }),
} as const;

/** Textos de interfaz del sitio que no forman parte del CV (el CV usa meta.labels del YAML). */
export const ui = {
  es: {
    navCv: 'CV',
    navProjects: 'Proyectos',
    switchLang: 'English',
    skip: 'Saltar al contenido',
    projectsTitle: 'Proyectos',
    projectsKicker: 'Casos de estudio técnicos',
    projectsIntro:
      'Sistemas que he diseñado y construido en producción: arquitectura, integraciones, decisiones técnicas y resultados. Los diagramas se generan desde código.',
    readCase: 'Ver caso de estudio',
    client: 'Cliente',
    company: 'Empresa',
    role: 'Rol',
    period: 'Periodo',
    stack: 'Stack',
    onThisPage: 'En esta página',
    allProjects: 'Todos los proyectos',
    prev: 'Anterior',
    next: 'Siguiente',
    nda: 'Proyecto bajo confidencialidad: se omiten datos internos, código y nombres de sistemas privados.',
    viewCv: 'Ver CV completo',
    projectsLd: 'Proyectos de',
  },
  en: {
    navCv: 'Resume',
    navProjects: 'Projects',
    switchLang: 'Español',
    skip: 'Skip to content',
    projectsTitle: 'Projects',
    projectsKicker: 'Technical case studies',
    projectsIntro:
      'Production systems I have designed and built: architecture, integrations, technical decisions and outcomes. Diagrams are generated from code.',
    readCase: 'Read case study',
    client: 'Client',
    company: 'Company',
    role: 'Role',
    period: 'Period',
    stack: 'Stack',
    onThisPage: 'On this page',
    allProjects: 'All projects',
    prev: 'Previous',
    next: 'Next',
    nda: 'Project under NDA: internal data, source code and private system names are omitted.',
    viewCv: 'View full resume',
    projectsLd: 'Projects by',
  },
} as const satisfies Record<Lang, Record<string, string>>;
