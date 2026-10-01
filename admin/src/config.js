const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const ASSET_BASE = (import.meta.env.VITE_ASSET_BASE_URL || '').replace(/\/$/, '');

const joinUrl = (base, path) => {
  if (!path) return base || '';
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (!base) return normalized;
  return `${base}${normalized}`;
};

export const resolveApiUrl = (path) => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized.startsWith('/api')) return joinUrl(API_BASE, normalized);
  return joinUrl(API_BASE, `/api${normalized}`);
};

export const resolveAssetUrl = (path) => {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  return joinUrl(ASSET_BASE || API_BASE || '', path);
};
