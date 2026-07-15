"use client";

import { useQuery } from "@tanstack/react-query";
import { getBackgroundPreference } from "@/app/actions/courses";

const DEFAULT_OVERLAY_OPACITY = 55;

export function useBackground(): {
  backgroundImage: string;
  overlayOpacity: number;
  isPending: boolean;
} {
  const { data, isPending } = useQuery({
    queryKey: ["backgroundPreference"],
    queryFn: () => getBackgroundPreference(),
    staleTime: 5 * 60_000,
  });
  return {
    backgroundImage: data?.backgroundImage ?? "bosque.webp",
    overlayOpacity: data?.overlayOpacity ?? DEFAULT_OVERLAY_OPACITY,
    isPending,
  };
}
