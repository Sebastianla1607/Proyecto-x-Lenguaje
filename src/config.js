import Config from 'react-native-config';

export const API_URL = (Config && Config.API_URL) || 'https://api-nodepost-production.up.railway.app';

export async function fetchApi(path, options = {}) {
  const prefix = path.startsWith('/') ? '' : '/';
  const url = `${API_URL}${prefix}${path}`;

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeout = options.timeout || 15000;
  if (controller) {
    options.signal = controller.signal;
    setTimeout(() => controller.abort(), timeout);
  }

  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Fetch error ${res.status}: ${text}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

// Example usage:
// import { fetchApi } from './src/config';
// const data = await fetchApi('/noticias');
