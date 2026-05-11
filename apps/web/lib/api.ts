export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

const ACCESS_TOKEN_KEY = 'access_token';

export function setAccessToken(token: string) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAccessToken() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
}