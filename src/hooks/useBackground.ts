"use client";

import { useQuery } from "@tanstack/react-query";
import { getBackgroundPreference } from "@/app/actions/courses";

export function useBackground(): { backgroundImage: string; isPending: boolean } {
  const { data, isPending } = useQuery({
    queryKey: ["backgroundPreference"],
    queryFn: () => getBackgroundPreference(),
    staleTime: 5 * 60_000,
  });
  return {
    backgroundImage: data?.backgroundImage ?? "bosque.webp",
    isPending,
  };
}
