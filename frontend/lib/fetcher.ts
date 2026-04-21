/**
 * Fetch helpers.
 *
 * Three entry points:
 *   - `fetcher`       — anonymous GET (public catalog).
 *   - `fetcherAuth`   — SERVER ONLY. Reads the access JWT from the httpOnly
 *                       cookie and hits Strapi directly. Use from RSC / route
 *                       handlers / server actions.
 *   - `fetcherClient` — client-side fetch against same-origin Next routes
 *                       (`/api/...` proxies). Sends cookies so the proxy can
 *                       attach the Bearer itself. Never talks to BACKEND_URL
 *                       directly from the browser.
 *
 * Non-2xx responses throw `ApiError` with the HTTP status attached.
 */

import { API_BASE_URL } from './config';

export class ApiError extends Error {
  status: number;
  url: string;
  body?: unknown;
  constructor(message: string, status: number, url: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.url = url;
    this.body = body;
  }
}

type FetchInit = Omit<RequestInit, 'body'> & { body?: unknown };

function absolutize(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = API_BASE_URL.replace(/\/+$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

async function parseResponse<T>(res: Response, url: string): Promise<T> {
  const contentType = res.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : await res.text();
  if (!res.ok) {
    throw new ApiError(
      `Fetch ${res.status} ${url}`,
      res.status,
      url,
      body,
    );
  }
  return body as T;
}

function buildInit(init: FetchInit | undefined, bearer?: string): RequestInit {
  const headers = new Headers(init?.headers);
  if (bearer) headers.set('Authorization', `Bearer ${bearer}`);
  let body: BodyInit | undefined;
  if (init?.body !== undefined) {
    if (
      typeof init.body === 'string' ||
      init.body instanceof FormData ||
      init.body instanceof Blob ||
      init.body instanceof ArrayBuffer ||
      (typeof ReadableStream !== 'undefined' && init.body instanceof ReadableStream)
    ) {
      body = init.body as BodyInit;
    } else {
      if (!headers.has('content-type')) headers.set('content-type', 'application/json');
      body = JSON.stringify(init.body);
    }
  }
  return { ...init, headers, body };
}

/**
 * Anonymous fetch. Caller passes the full URL or a path they've already
 * composed against their chosen base — we do not prepend anything, so this
 * stays a drop-in for the legacy `/api/mock/...` call sites.
 */
export async function fetcher<T>(url: string, init?: FetchInit): Promise<T> {
  const res = await fetch(url, { ...buildInit(init), cache: init?.cache ?? 'no-store' });
  return parseResponse<T>(res, url);
}

/**
 * Server-only fetch with the caller's access JWT attached as Bearer.
 * Imports `auth-server` lazily so this module stays safe to import from client
 * code (tree-shaken; the lazy path never executes in the browser).
 */
export async function fetcherAuth<T>(path: string, init?: FetchInit): Promise<T> {
  const { getAccessToken } = await import('./auth-server');
  const token = await getAccessToken();
  const url = absolutize(path);
  const res = await fetch(url, {
    ...buildInit(init, token ?? undefined),
    cache: init?.cache ?? 'no-store',
  });
  return parseResponse<T>(res, url);
}

/**
 * Client-side fetch against same-origin Next proxies. Sends cookies so the
 * Next route handler can forward the access JWT. `path` should start with
 * `/api/...` — we never fabricate an absolute backend URL on the client.
 */
export async function fetcherClient<T>(path: string, init?: FetchInit): Promise<T> {
  if (!path.startsWith('/')) {
    throw new Error(`fetcherClient requires a same-origin path, got: ${path}`);
  }
  const res = await fetch(path, {
    ...buildInit(init),
    credentials: 'include',
    cache: init?.cache ?? 'no-store',
  });
  return parseResponse<T>(res, path);
}
