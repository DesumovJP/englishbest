/**
 * data-cache.ts — tiny in-memory cache with inflight dedupe for catalog
 * fetches. Used by `character-catalog`, `library`, `rooms`, `shop-items`,
 * etc. — anywhere the data is shared app-wide and rarely changes.
 *
 * Why not SWR / react-query? Phase K rule: no new deps. Two patterns cover
 * the whole app:
 *   - createCachedFetcher  → call from any context (lib helpers)
 *   - useCachedResource    → react hook on top of useResource shape
 *
 * The cached fetcher returns the same Promise to concurrent callers (so
 * three components mounting simultaneously trigger one network request),
 * caches the resolved value indefinitely by default, and exposes
 * `reset()` for hard invalidation after mutations.
 *
 * `ttlMs` opt-in: when set, the cached value becomes "stale" after the
 * window expires. The next call returns the stale value immediately AND
 * fires a background refresh (stale-while-revalidate). Mutation-sensitive
 * endpoints should keep `reset()` rather than rely on TTL.
 */

export interface CachedFetcher<T> {
  /** Returns cached value if fresh, otherwise fetches. Concurrent callers share the inflight promise. */
  get: () => Promise<T>;
  /** Drop cached value AND inflight promise. Next get refetches from scratch. */
  reset: () => void;
  /** Synchronous read of the current cached value, or null. Does NOT trigger a fetch. */
  peek: () => T | null;
}

export interface CachedFetcherOptions<T> {
  /** Identifier used in dev warnings. */
  key: string;
  fetch: () => Promise<T>;
  /**
   * If set, cached value becomes stale after this many ms. Stale value is
   * returned immediately while a background refetch updates the cache.
   * Omit (or pass Infinity) for "load once per session" behavior.
   */
  ttlMs?: number;
  /**
   * Optional side-effect run on every successful fetch. Used for example
   * to register fetched characters into the static catalog.
   */
  onFresh?: (value: T) => void;
}

export function createCachedFetcher<T>(opts: CachedFetcherOptions<T>): CachedFetcher<T> {
  const ttl = opts.ttlMs ?? Infinity;
  let value: T | null = null;
  let storedAt = 0;
  let inflight: Promise<T> | null = null;
  let backgroundRefresh = false;

  const isStale = () => ttl !== Infinity && Date.now() - storedAt > ttl;

  function startFetch(): Promise<T> {
    if (inflight) return inflight;
    inflight = opts.fetch()
      .then((fresh) => {
        value = fresh;
        storedAt = Date.now();
        opts.onFresh?.(fresh);
        return fresh;
      })
      .finally(() => {
        inflight = null;
        backgroundRefresh = false;
      });
    return inflight;
  }

  function get(): Promise<T> {
    if (value !== null && !isStale()) return Promise.resolve(value);
    if (value !== null && isStale()) {
      // Stale-while-revalidate: return what we have, refresh in the
      // background. Don't await the background fetch.
      if (!backgroundRefresh) {
        backgroundRefresh = true;
        // Errors swallowed — caller already got the stale value.
        startFetch().catch(() => { /* logged in fetch impl if needed */ });
      }
      return Promise.resolve(value);
    }
    return startFetch();
  }

  return {
    get,
    reset: () => {
      value = null;
      storedAt = 0;
      inflight = null;
      backgroundRefresh = false;
    },
    peek: () => value,
  };
}
