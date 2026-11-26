/** Une `import.meta.env.BASE_URL` con una ruta interna, sin barras duplicadas. */
export const withBase = (path = '') =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

/** URL absoluta de una ruta interna (canonical, JSON-LD, Open Graph). */
export const absoluteUrl = (path: string, site: URL | string) => new URL(withBase(path), site).href;

/** `https://www.linkedin.com/in/foo/` → `linkedin.com/in/foo`. */
export const prettyUrl = (url: string) =>
  url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
