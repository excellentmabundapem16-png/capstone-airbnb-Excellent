/**
 * api.js – tiny fetch wrapper used by every page.
 * Attaches the JWT (when present) and turns error payloads into Exceptions.
 */
export async function api(path, { method = 'GET', body, token, formData } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (formData) {
    payload = formData; // browser sets multipart boundary
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`/api${path}`, { method, headers, body: payload });
  let data = {};
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

/** R1 234,56 formatting helper used across the UI. */
export const money = (n) => `R${Number(n ?? 0).toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`;
export const money2 = (n) => `R${Number(n ?? 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
