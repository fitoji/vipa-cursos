"use client";

import * as React from "react";
import { Tooltip } from "@base-ui/react/tooltip";

import { cn } from "@/lib/utils";

const TooltipProvider = ({
  delayDuration,
  skipDelayDuration,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Tooltip.Provider> & {
  delayDuration?: number;
  skipDelayDuration?: number;
}) => (
  <Tooltip.Provider
    delay={delayDuration}
    timeout={skipDelayDuration}
    {...props}
  >
    {children}
  </Tooltip.Provider>
);

const TooltipRoot = Tooltip.Root;

const TooltipTrigger = Tooltip.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof Tooltip.Popup>,
  React.ComponentPropsWithoutRef<typeof Tooltip.Popup> & {
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
    sideOffset?: number;
    alignOffset?: number;
  }
>(({ className, side, align, sideOffset, alignOffset, ...props }, ref) => (
  <Tooltip.Portal>
    <Tooltip.Positioner side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset}>
      <Tooltip.Popup
        ref={ref}
        className={cn(
          "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground",
          "data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95",
          "origin-[--transform-origin]",
          className,
        )}
        {...props}
      />
    </Tooltip.Positioner>
  </Tooltip.Portal>
));
TooltipContent.displayName = "TooltipContent";

export { TooltipRoot as Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
