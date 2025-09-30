export function apiBase(): string {
  // Vite exposes env vars prefixed with VITE_ to the client
  const b = import.meta.env.VITE_API_BASE as string | undefined;
  if (!b) return '';
  // strip trailing slash
  return b.replace(/\/$/, '');
}

export function apiUrl(path: string): string {
  const base = apiBase();
  if (!base) return path; // keep relative path for local/dev proxy
  // ensure path begins with '/'
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

export async function apiFetch(path: string, options?: RequestInit) {
  const url = apiUrl(path);
  return fetch(url, options);
}
