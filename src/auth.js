import * as Keychain from 'react-native-keychain';
import { fetchApi } from './config';

export async function login(credentials) {
  const resp = await fetchApi('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const token = resp && resp.token ? resp.token : null;
  if (token) {
    await Keychain.setGenericPassword('user', token);
  }
  return resp;
}

export async function logout() {
  await Keychain.resetGenericPassword();
}

export async function getToken() {
  const creds = await Keychain.getGenericPassword();
  return creds ? creds.password : null;
}

export async function authFetch(path, options = {}) {
  const token = await getToken();
  const headers = { ...(options.headers || {}), Authorization: token ? `Bearer ${token}` : '' };
  return fetchApi(path, { ...options, headers });
}
