export const API_URL = 'http://127.0.0.1:3001';

export function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

export function saveAccessToken(token: string) {
  localStorage.setItem('access_token', token);
}

export function clearAccessToken() {
  localStorage.removeItem('access_token');
}

export function authHeaders() {
  const token = getAccessToken();

  return {
    Authorization: token ? `Bearer ${token}` : '',
  };
}