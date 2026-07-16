"use client";

import { forwardRef, useCallback, useTransition } from "react";
import { Link } from "@/i18n/navigation";

type LinkProps = React.ComponentProps<typeof Link>;

/**
 * Link wrapper that uses the View Transition API for smooth page transitions.
 *
 * Start a React transition alongside the view transition so the browser
 * can capture both the "old" and "new" snapshots correctly.
 */
export const TransitionLink = forwardRef<HTMLAnchorElement, LinkProps>(function TransitionLink(
  { onClick, href, ...rest },
  ref,
) {
  const [, startTransition] = useTransition();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;

      if (
        typeof document !== "undefined" &&
        "startViewTransition" in document &&
        e.button === 0 &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        e.preventDefault();

        const url = typeof href === "string" ? href : (href?.pathname ?? "/");

        // Wrap the state update in a view transition.
        // React will commit synchronously, allowing the browser to
        // capture the updated state for the transition.
        document.startViewTransition(() => {
          startTransition(() => {
            window.location.href = url;
          });
        });
        return;
      }
    },
    [onClick, href],
  );

  return <Link ref={ref} href={href} onClick={handleClick} {...rest} />;
});
