import Cookies from 'js-cookie';

export const API_URL = 'http://localhost:3000/api';

const ACCESS_TOKEN_KEY = 'access_token';

export function setAccessToken(token: string) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(ACCESS_TOKEN_KEY, token);

  Cookies.set(ACCESS_TOKEN_KEY, token, {
    expires: 7,
    sameSite: 'lax',
  });
}

export function getAccessToken() {
  if (typeof window === 'undefined') return null;

  return (
    localStorage.getItem(ACCESS_TOKEN_KEY) ||
    Cookies.get(ACCESS_TOKEN_KEY) ||
    null
  );
}

export function clearAccessToken() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  Cookies.remove(ACCESS_TOKEN_KEY);
}