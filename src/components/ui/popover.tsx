import * as React from "react";
import { Popover } from "@base-ui/react/popover";

import { cn } from "@/lib/utils";

const PopoverRoot = Popover.Root;

const PopoverTrigger = Popover.Trigger;

// Base UI Popover has no Anchor part — anchor positioning is handled via the Positioner's `anchor` prop.
// This is a passthrough export for backward compatibility.
const PopoverAnchor = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>{children}</div>
);

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof Popover.Popup>,
  React.ComponentPropsWithoutRef<typeof Popover.Popup> & {
    align?: "start" | "center" | "end";
    side?: "top" | "bottom" | "left" | "right";
    sideOffset?: number;
    alignOffset?: number;
  }
>(({ className, align = "center", side, sideOffset = 4, alignOffset, ...props }, ref) => (
  <Popover.Portal>
    <Popover.Positioner positionMethod="fixed" align={align} side={side} sideOffset={sideOffset} alignOffset={alignOffset} className="z-50">
      <Popover.Popup
        ref={ref}
        className={cn(
          "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
          "data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95",
          "origin-[--transform-origin]",
          className,
        )}
        {...props}
      />
    </Popover.Positioner>
  </Popover.Portal>
));
PopoverContent.displayName = "PopoverContent";

export { PopoverRoot as Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
