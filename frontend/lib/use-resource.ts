"use client";

/**
 * use-resource.ts — canonical data-hook contract for the entire app.
 *
 * Every page-level hook (useGroups, useMyLessons, useShopCatalog, …) returns
 * the same shape via `useResource<T>(fetcher, deps?)`, so page components can
 * hand the result straight to <DashboardPageShell status={…}>.
 *
 * Why not SWR / react-query? Intentional — the Phase K rule is "no new deps".
 * This file is ~70 LOC and covers the three patterns the app actually uses:
 *   - mount-once-with-auth-cookie (most catalog + list hooks)
 *   - re-fetch-on-deps-change (filter-driven lists)
 *   - imperative refetch (after a mutation)
 */

import { useCallback, useEffect, useRef, useState } from "react";

export type ResourceStatus = "idle" | "loading" | "success" | "error";

export interface ResourceResult<T> {
  data: T | null;
  status: ResourceStatus;
  error: Error | null;
  /** Re-run the fetcher. Updates status to "loading" while in flight. */
  refetch: () => Promise<void>;
}

/** Status expected by <DashboardPageShell status={…}>. */
export type ShellStatus = "loading" | "error" | "empty" | "ready";

export function useResource<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[] = [],
): ResourceResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<ResourceStatus>("idle");
  const [error, setError] = useState<Error | null>(null);

  // Ref-stored fetcher so `refetch` identity stays stable across renders
  // even when the caller passes an inline arrow function.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(async (signal: { alive: boolean }) => {
    setStatus("loading");
    setError(null);
    try {
      const result = await fetcherRef.current();
      if (!signal.alive) return;
      setData(result);
      setStatus("success");
    } catch (e) {
      if (!signal.alive) return;
      setError(e instanceof Error ? e : new Error(String(e)));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const signal = { alive: true };
    void run(signal);
    return () => {
      signal.alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const refetch = useCallback(async () => {
    await run({ alive: true });
  }, [run]);

  return { data, status, error, refetch };
}

/**
 * Derive the <DashboardPageShell>/<KidsPageShell> `status` prop from a
 * `ResourceResult`. Pages pass an optional `isEmpty` predicate so an empty
 * array renders <EmptyState> instead of <children>.
 */
export function shellStatus<T>(
  r: ResourceResult<T>,
  isEmpty?: (data: T) => boolean,
): ShellStatus {
  if (r.status === "loading" || r.status === "idle") return "loading";
  if (r.status === "error") return "error";
  if (r.data !== null && isEmpty?.(r.data)) return "empty";
  return "ready";
}
