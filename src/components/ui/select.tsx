"use client";

import * as React from "react";
import { Select } from "@base-ui/react/select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";

const SelectRoot = Select.Root;

const SelectGroup = Select.Group;

const SelectValue = Select.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof Select.Trigger>,
  React.ComponentPropsWithoutRef<typeof Select.Trigger>
>(({ className, children, ...props }, ref) => (
  <Select.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className,
    )}
    {...props}
  >
    {children}
    <Select.Icon>
      <ChevronDown className="size-4 opacity-50" />
    </Select.Icon>
  </Select.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof Select.ScrollUpArrow>,
  React.ComponentPropsWithoutRef<typeof Select.ScrollUpArrow>
>(({ className, ...props }, ref) => (
  <Select.ScrollUpArrow
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronUp className="size-4" />
  </Select.ScrollUpArrow>
));
SelectScrollUpButton.displayName = "SelectScrollUpButton";

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof Select.ScrollDownArrow>,
  React.ComponentPropsWithoutRef<typeof Select.ScrollDownArrow>
>(({ className, ...props }, ref) => (
  <Select.ScrollDownArrow
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronDown className="size-4" />
  </Select.ScrollDownArrow>
));
SelectScrollDownButton.displayName = "SelectScrollDownButton";

const SelectContent = React.forwardRef<
  React.ElementRef<typeof Select.Popup>,
  React.ComponentPropsWithoutRef<typeof Select.Popup> & {
    position?: string;
  }
>(({ className, children, position: _position, ...props }, ref) => (
    <Select.Portal>
      <Select.Positioner positionMethod="fixed" alignItemWithTrigger={false} className="z-50">
        <Select.Popup
        ref={ref}
        className={cn(
          "relative z-50 min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
          "data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95",
          "origin-[--transform-origin]",
          className,
        )}
        {...props}
      >
        <SelectScrollUpButton />
        {children}
        <SelectScrollDownButton />
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
));
SelectContent.displayName = "SelectContent";

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof Select.GroupLabel>,
  React.ComponentPropsWithoutRef<typeof Select.GroupLabel>
>(({ className, ...props }, ref) => (
  <Select.GroupLabel
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = "SelectLabel";

const SelectItem = React.forwardRef<
  React.ElementRef<typeof Select.Item>,
  React.ComponentPropsWithoutRef<typeof Select.Item>
>(({ className, children, ...props }, ref) => (
  <Select.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <Select.ItemText>{children}</Select.ItemText>
    <span className="absolute right-2 flex size-3.5 items-center justify-center">
      <Select.ItemIndicator>
        <Check className="size-4" />
      </Select.ItemIndicator>
    </span>
  </Select.Item>
));
SelectItem.displayName = "SelectItem";

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof Select.Separator>,
  React.ComponentPropsWithoutRef<typeof Select.Separator>
>(({ className, ...props }, ref) => (
  <Select.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = "SelectSeparator";

export {
  SelectRoot as Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
