"use client";

import { useState, useEffect, useCallback } from "react";

interface CachedEntry<T> {
  data: T[];
  timestamp: number;
}

const DEFAULT_TTL = 1000 * 60 * 60; // 1 hour

/**
 * Generic hook for caching fetched data in localStorage.
 * - Checks localStorage first
 * - If valid (not expired), returns cached data immediately
 * - If expired or missing, fetches from server, stores in localStorage, returns
 */
export function useCachedData<T>(
  key: string,
  fetchFn: () => Promise<T[]>,
  ttlMs: number = DEFAULT_TTL,
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const safeGetItem = (k: string): string | null => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  };
  const safeSetItem = (k: string, v: string): void => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* storage unavailable, skip cache */
    }
  };

  const load = useCallback(async () => {
    try {
      // Try cache first
      const raw = safeGetItem(`cache:${key}`);
      if (raw) {
        const entry: CachedEntry<T> = JSON.parse(raw);
        if (Date.now() - entry.timestamp < ttlMs) {
          setData(entry.data);
          setLoading(false);
          return;
        }
      }
    } catch {
      safeSetItem(`cache:${key}`, "");
    }

    try {
      const fresh = await fetchFn();
      const entry: CachedEntry<T> = { data: fresh, timestamp: Date.now() };
      safeSetItem(`cache:${key}`, JSON.stringify(entry));
      setData(fresh);
    } catch (err) {
      console.error(`Failed to fetch data for cache key "${key}":`, err);
    } finally {
      setLoading(false);
    }
  }, [key, fetchFn, ttlMs]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, refresh: load };
}
