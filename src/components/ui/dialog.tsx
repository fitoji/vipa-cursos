"use client";

import * as React from "react";
import { Dialog as DialogBase } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogBase.Root;

const DialogTrigger = DialogBase.Trigger;

const DialogPortal = DialogBase.Portal;

const DialogClose = DialogBase.Close;

const DialogBackdrop = React.forwardRef<
  React.ElementRef<typeof DialogBase.Backdrop>,
  React.ComponentPropsWithoutRef<typeof DialogBase.Backdrop>
>(({ className, ...props }, ref) => (
  <DialogBase.Backdrop
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogBackdrop.displayName = DialogBase.Backdrop.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogBase.Popup>,
  React.ComponentPropsWithoutRef<typeof DialogBase.Popup>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogBackdrop />
    <DialogBase.Popup
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95 sm:rounded-lg",
        className,
      )}
      {...props}
    >
      {children}
      <DialogBase.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[open]:bg-accent data-[open]:text-muted-foreground">
        <X className="size-4" />
        <span className="sr-only">Close</span>
      </DialogBase.Close>
    </DialogBase.Popup>
  </DialogPortal>
));
DialogContent.displayName = DialogBase.Popup.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogBase.Title>,
  React.ComponentPropsWithoutRef<typeof DialogBase.Title>
>(({ className, ...props }, ref) => (
  <DialogBase.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogBase.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogBase.Description>,
  React.ComponentPropsWithoutRef<typeof DialogBase.Description>
>(({ className, ...props }, ref) => (
  <DialogBase.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogBase.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogBackdrop,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
