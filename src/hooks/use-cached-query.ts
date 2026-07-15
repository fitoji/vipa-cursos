"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getCache, setCache } from "@/lib/local-cache";

/**
 * Wraps React Query with localStorage persistence.
 *
 * Default staleTime is Infinity: data is never considered stale. The only
 * ways to trigger a refetch are:
 * 1. Mutation invalidation (create/edit/delete → invalidateQueries)
 * 2. Manual refresh button (invalidateQueries)
 * 3. First-time login (no localStorage data yet → queryFn runs once)
 *
 * On cold start, data is served from localStorage immediately.
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
    initialData: () => (getCache<T>(options.cacheKey) ?? undefined) as T | undefined,
    staleTime: options.staleTime ?? Infinity,
    gcTime: options.gcTime ?? Infinity,
  });
}
