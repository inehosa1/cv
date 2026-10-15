/** Une `import.meta.env.BASE_URL` con una ruta interna, sin barras duplicadas. */
export const withBase = (path = '') =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

/** `https://www.linkedin.com/in/foo/` → `linkedin.com/in/foo`. */
export const prettyUrl = (url: string) =>
  url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
