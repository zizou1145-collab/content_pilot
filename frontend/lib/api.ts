/**
 * API client for Content Pilot backend.
 * Uses NEXT_PUBLIC_API_URL for all requests (no hardcoded host).
 */

const getApiBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set. Add it to .env.local (e.g. NEXT_PUBLIC_API_URL=http://localhost:4000)"
    );
  }
  return url.replace(/\/$/, "");
};

/**
 * Base URL for the backend API (e.g. http://localhost:4000).
 * Use this for fetch or apiFetch.
 */
export function getApiUrl(): string {
  return getApiBaseUrl();
}

/**
 * Full URL for an API path (e.g. /api/v1/health -> http://localhost:4000/api/v1/health).
 * In development with rewrites, you can use path like "/api/v1/health" and Next.js will proxy.
 */
export function apiPath(path: string): string {
  const base = getApiBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

type RequestInitWithAuth = RequestInit & {
  token?: string | null;
  /** Called when this request returns 401; overrides global handler for this call if set. */
  on401?: () => void;
};

let global401Handler: (() => void) | null = null;

/**
 * Register a global handler for 401 responses. When any apiFetch returns 401,
 * this handler is called (e.g. clear auth and redirect to login).
 * Should be set once by a component inside AuthProvider (e.g. Auth401Handler).
 */
export function setGlobal401Handler(handler: (() => void) | null): void {
  global401Handler = handler;
}

/**
 * Fetch from the backend API with optional Bearer token.
 * Uses NEXT_PUBLIC_API_URL; pass path like "/api/v1/projects".
 * When the response is 401, calls the per-request on401 or the global 401 handler.
 */
export async function apiFetch(
  path: string,
  init?: RequestInitWithAuth
): Promise<Response> {
  const { token, on401, ...options } = init ?? {};
  const url = apiPath(path);
  const headers = new Headers(options?.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (
    options?.body &&
    typeof options.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    const handler = on401 ?? global401Handler;
    handler?.();
  }
  return res;
}
