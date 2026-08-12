const DEFAULT_BACKEND_API_URL = "http://127.0.0.1:3001/api";

function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

/**
 * Returns the NestJS API URL used by server-side Next.js routes.
 * BACKEND_API_URL can remain private on the server; NEXT_PUBLIC_API_URL is
 * supported for compatibility with the current local and Vercel setup.
 */
export function getBackendApiUrl(path = "") {
  const baseUrl = normalizeBaseUrl(
    process.env.BACKEND_API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      DEFAULT_BACKEND_API_URL,
  );

  const normalizedPath = path.trim().replace(/^\/+/, "");

  return normalizedPath ? `${baseUrl}/${normalizedPath}` : baseUrl;
}
