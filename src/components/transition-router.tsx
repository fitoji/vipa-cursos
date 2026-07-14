"use client";

import { useRouter } from "@/i18n/navigation";

/**
 * Hook that wraps router.push with the View Transition API.
 * Falls back to the regular router when the API is not available.
 */
export function useTransitionRouter() {
  const router = useRouter();

  const push = (href: string) => {
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      document.startViewTransition(() => {
        router.push(href);
      });
    } else {
      router.push(href);
    }
  };

  return { push };
}
