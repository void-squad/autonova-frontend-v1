const DEFAULT_API_BASE_URL = "http://localhost:8080";

export const sanitizeBaseUrl = (value?: string | null) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/\/$/, "");
};

const resolvedBaseUrl = sanitizeBaseUrl(import.meta.env.VITE_API_BASE_URL) ?? DEFAULT_API_BASE_URL;

if (!import.meta.env.VITE_API_BASE_URL && typeof console !== "undefined") {
  console.warn(
    `[api] Falling back to default API base URL (${DEFAULT_API_BASE_URL}). Set VITE_API_BASE_URL to silence this warning.`,
  );
}

const API_BASE_URL = resolvedBaseUrl;

const AUTH_TOKEN_KEY = 'authToken';
const AUTH_TOKEN_ISSUED_AT_KEY = 'authTokenIssuedAt';

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

export interface ApiRequestOptions extends RequestInit {
  baseUrl?: string;
}

const redirectToLogin = () => {
  if (typeof window === 'undefined') return;
  if (window.location.pathname === '/login') return;
  window.location.assign('/login');
};

export const getAuthToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;

export const setAuthToken = (token: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_TOKEN_ISSUED_AT_KEY, new Date().toISOString());
};

export const clearAuthToken = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_TOKEN_ISSUED_AT_KEY);
};

export const getAuthTokenIssuedAt = () =>
  typeof window !== 'undefined'
    ? localStorage.getItem(AUTH_TOKEN_ISSUED_AT_KEY)
    : null;

const shouldSkipContentType = (body: BodyInit | null | undefined) =>
  body instanceof FormData ||
  body instanceof Blob ||
  body instanceof ArrayBuffer ||
  body instanceof URLSearchParams;

const parseResponseBody = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('Content-Type');
  if (contentType?.includes('application/json')) {
    return (await response.json()) as T;
  }

  const text = await response.text();
  return text as unknown as T;
};

export async function api<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { headers, body, credentials, baseUrl, ...rest } = options;

  const requestHeaders = new Headers(headers ?? {});

  if (!shouldSkipContentType(body) && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const token = getAuthToken();
  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  const normalizedBaseUrl =
    baseUrl !== undefined ? sanitizeBaseUrl(baseUrl) : undefined;

  const requestUrl = isAbsoluteUrl(path)
    ? path
    : `${normalizedBaseUrl ?? API_BASE_URL}${path}`;

  const response = await fetch(requestUrl, {
    body,
    headers: requestHeaders,
    credentials: credentials ?? 'include',
    ...rest,
  });

  if (response.status === 401 || response.status === 403) {
    clearAuthToken();
    redirectToLogin();
    const errorBody = await response.json().catch(() => ({
      message: response.statusText,
    }));
    throw new Error(errorBody.error ?? errorBody.message ?? 'Unauthorized');
  }

  const parsedBody = await parseResponseBody<T>(response);

  if (!response.ok) {
    let message: string | undefined;

    if (parsedBody && typeof parsedBody === 'object') {
      const body = parsedBody as Record<string, unknown>;
      message =
        (typeof body.error === 'string' && body.error) ||
        (typeof body.message === 'string' && body.message);
    }

    if (!message && typeof parsedBody === 'string') {
      message = parsedBody;
    }

    throw new Error(message ?? response.statusText);
  }

  return parsedBody;
}

export const apiConfig = {
  API_BASE_URL,
  AUTH_TOKEN_KEY,
  AUTH_TOKEN_ISSUED_AT_KEY,
};
