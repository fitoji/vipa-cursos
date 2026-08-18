"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getCache, setCache } from "@/lib/local-cache";

/**
 * Wraps React Query with localStorage persistence.
 *
 * Each successful fetch syncs data to localStorage for cross-session
 * persistence (key scoped by userId). React Query's staleTime controls
 * when a refetch is triggered without invalidation.
 *
 * Cache keys are scoped by userId so different users on the same browser
 * do NOT see each other's cached data. If userId is not yet available,
 * no localStorage caching occurs (prevents cross-user data leakage).
 *
 * Invalidation works correctly: staleTime is NOT Infinity, so
 * invalidateQueries triggers an actual refetch.
 */
export function useCachedQuery<T>(options: {
  queryKey: unknown[];
  queryFn: () => Promise<T>;
  cacheKey: string;
  userId?: string;
  staleTime?: number;
  gcTime?: number;
}): UseQueryResult<T> {
  const { userId, cacheKey } = options;
  // Scope cache key by userId so localStorage is NOT shared across users.
  // If userId is unknown (session not loaded yet), skip localStorage caching
  // entirely to avoid showing another user's data.
  const effectiveCacheKey = userId ? `${cacheKey}:${userId}` : undefined;
  // scoped queryKey so React Query cache is isolated per user
  const queryKey = userId ? [...options.queryKey, userId] : options.queryKey;

  return useQuery({
    queryKey,
    queryFn: async () => {
      const data = await options.queryFn();
      if (effectiveCacheKey) setCache(effectiveCacheKey, data);
      return data;
    },
    staleTime: options.staleTime ?? 1000 * 60 * 5,
    gcTime: options.gcTime ?? Infinity,
  });
}
