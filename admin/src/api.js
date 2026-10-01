export async function api(path, { method = 'GET', body, token, formData } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (formData) {
    payload = formData;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const res = await fetch(resolveApiUrl(path), { method, headers, body: payload });
  let data = {};

  try {
    data = await res.json();
  } catch {
    /* ignore non-JSON */
  }

  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

export const money = (n) => `R${Number(n ?? 0).toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`;
export const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
