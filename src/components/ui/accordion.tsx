import * as React from "react";
import { Accordion } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const AccordionRoot = Accordion.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof Accordion.Item>,
  React.ComponentPropsWithoutRef<typeof Accordion.Item>
>(({ className, ...props }, ref) => (
  <Accordion.Item ref={ref} className={cn("border-b", className)} {...props} />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof Accordion.Trigger>,
  React.ComponentPropsWithoutRef<typeof Accordion.Trigger>
>(({ className, children, ...props }, ref) => (
  <Accordion.Header className="flex">
    <Accordion.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left [&[data-panel-open]>svg]:rotate-180",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </Accordion.Trigger>
  </Accordion.Header>
));
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof Accordion.Panel>,
  React.ComponentPropsWithoutRef<typeof Accordion.Panel>
>(({ className, children, ...props }, ref) => (
  <Accordion.Panel
    ref={ref}
    className="overflow-hidden text-sm"
    {...props}
  >
    <div
      className={cn(
        "pb-4 pt-0 transition-all duration-200",
        "data-starting-style:h-0 data-ending-style:h-0 h-(--accordion-panel-height)",
        className,
      )}
    >
      {children}
    </div>
  </Accordion.Panel>
));
AccordionContent.displayName = "AccordionContent";

export { AccordionRoot as Accordion, AccordionItem, AccordionTrigger, AccordionContent };
