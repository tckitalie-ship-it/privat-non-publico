import Cookies from "js-cookie";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001/api";

const ACCESS_TOKEN_KEY = "access_token";

export function setAccessToken(token: string) {
  if (typeof window === "undefined") return;

  // Scrivi sempre prima i cookie (usati dal server)
  Cookies.set(ACCESS_TOKEN_KEY, token, {
    expires: 7,
    sameSite: "lax",
  });

  // Poi localStorage (solo client)
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;

  // Cookie ha priorità: è più affidabile e leggibile dal server
  const cookieToken = Cookies.get(ACCESS_TOKEN_KEY);
  if (cookieToken) return cookieToken;

  // Fallback al localStorage
  return localStorage.getItem(ACCESS_TOKEN_KEY) || null;
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;

  Cookies.remove(ACCESS_TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}
