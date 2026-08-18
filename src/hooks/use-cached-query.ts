"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getCache, setCache } from "@/lib/local-cache";

/**
 * Wraps React Query with localStorage persistence.
 *
 * Uses placeholderData so React Query correctly manages loading states.
 * The queryFn always runs on mount (no initialData), but staleTime is
 * preserved to avoid redundant fetches. After each successful fetch,
 * data is synced to localStorage for cross-session persistence.
 *
 * Invalidation works correctly: staleTime is NOT Infinity, so
 * invalidateQueries triggers an actual refetch.
 */
export function useCachedQuery<T>(options: {
  queryKey: unknown[];
  queryFn: () => Promise<T>;
  cacheKey: string;
  staleTime?: number;
  gcTime?: number;
}): UseQueryResult<T> {
  return useQuery({
    queryKey: options.queryKey,
    queryFn: async () => {
      const data = await options.queryFn();
      setCache(options.cacheKey, data);
      return data;
    },
    // Show stale localStorage data while fetching fresh data in background.
    // Unlike initialData, this does NOT suppress isLoading on the initial fetch,
    // so invalidation triggers real refetches correctly.
    placeholderData: () => (getCache<T>(options.cacheKey) ?? undefined) as T | undefined,
    // Default to 5 minutes instead of Infinity so invalidateQueries actually works.
    staleTime: options.staleTime ?? 1000 * 60 * 5,
    gcTime: options.gcTime ?? Infinity,
  });
}
