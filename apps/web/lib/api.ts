import Cookies from "js-cookie";

export const API_URL = "/api";

const ACCESS_TOKEN_KEY = "access_token";

export function setAccessToken(token: string) {
  if (typeof window === "undefined") return;

  Cookies.set(ACCESS_TOKEN_KEY, token, {
    expires: 7,
    sameSite: "lax",
  });

  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;

  const cookieToken = Cookies.get(ACCESS_TOKEN_KEY);

  if (cookieToken) {
    return cookieToken;
  }

  return localStorage.getItem(ACCESS_TOKEN_KEY) || null;
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;

  Cookies.remove(ACCESS_TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}