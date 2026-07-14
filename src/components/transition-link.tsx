"use client";

import { forwardRef } from "react";
import { Link } from "@/i18n/navigation";

type LinkProps = React.ComponentProps<typeof Link>;

/**
 * Link wrapper that uses the View Transition API for smooth page transitions.
 * Falls back to normal navigation when the API is not available.
 */
export const TransitionLink = forwardRef<HTMLAnchorElement, LinkProps>(
  function TransitionLink(props, ref) {
    const { onClick, ...rest } = props;

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (typeof document !== "undefined" && "startViewTransition" in document) {
        // Only intercept regular clicks (not middle-click, ctrl/cmd+click)
        if (
          e.button === 0 &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.shiftKey &&
          !e.altKey
        ) {
          e.preventDefault();
          const href =
            typeof rest.href === "string" ? rest.href : (rest.href as { pathname?: string }).pathname ?? "/";
          document.startViewTransition(() => {
            window.location.href = href;
          });
          return;
        }
      }

      onClick?.(e);
    };

    return <Link ref={ref} onClick={handleClick} {...rest} />;
  },
);
