/**
 * Fetch helpers.
 *
 * Two entry points:
 *   - `fetcher`       — anonymous GET (public catalog).
 *   - `fetcherClient` — client-side fetch against same-origin Next routes
 *                       (`/api/...` proxies). Sends cookies so the proxy can
 *                       attach the Bearer itself. Never talks to BACKEND_URL
 *                       directly from the browser.
 *
 * Server-side authenticated fetching (that reads the httpOnly access cookie)
 * belongs in a separate module — colocate it with the caller so this file
 * stays safe to import from client components.
 *
 * Non-2xx responses throw `ApiError` with the HTTP status attached.
 */

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

/**
 * UA-localised message for any thrown value from fetcher.* helpers.
 * Prefers Strapi's `error.message` in the response body, falls back to
 * the caller-supplied copy, finally to a generic network-error string.
 */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const bodyMsg =
      err.body && typeof err.body === 'object' && 'error' in err.body
        ? (err.body as { error?: { message?: string } }).error?.message
        : undefined;
    return bodyMsg || err.message || fallback;
  }
  return "Помилка мережі. Перевірте з'єднання та спробуйте знову.";
}

type FetchInit = Omit<RequestInit, 'body'> & { body?: unknown };

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
