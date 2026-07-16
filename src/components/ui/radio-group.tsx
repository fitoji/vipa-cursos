import * as React from "react";
import * as RadioGroupPrimitive from "@base-ui/react/radio-group";
import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.RadioGroup>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.RadioGroup>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.RadioGroup
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioPrimitive.Root
      ref={ref}
      className={cn(
        "aspect-square size-4 rounded-full border border-primary text-primary shadow cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator className="flex items-center justify-center transition-all duration-200 data-starting-style:opacity-0 data-starting-style:scale-75 data-ending-style:opacity-0 data-ending-style:scale-75">
        <Circle className="size-3.5 fill-primary" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  );
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
