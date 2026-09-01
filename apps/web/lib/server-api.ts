const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://privat-non-publico.onrender.com/api";

export function getBackendApiUrl(path: string) {
  return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
}
