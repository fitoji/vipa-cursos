import * as React from "react";
import { AlertDialog as AlertDialogBase } from "@base-ui/react/alert-dialog";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";

const AlertDialog = AlertDialogBase.Root;

const AlertDialogTrigger = AlertDialogBase.Trigger;

const AlertDialogPortal = AlertDialogBase.Portal;

const AlertDialogBackdrop = React.forwardRef<
  React.ElementRef<typeof AlertDialogBase.Backdrop>,
  React.ComponentPropsWithoutRef<typeof AlertDialogBase.Backdrop>
>(({ className, ...props }, ref) => (
  <AlertDialogBase.Backdrop
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0",
      className,
    )}
    {...props}
    ref={ref}
  />
));
AlertDialogBackdrop.displayName = AlertDialogBase.Backdrop.displayName;

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogBase.Popup>,
  React.ComponentPropsWithoutRef<typeof AlertDialogBase.Popup>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogBackdrop />
    <AlertDialogBase.Popup
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95 sm:rounded-lg",
        className,
      )}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogBase.Popup.displayName;

const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-2 text-center sm:text-left", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2", className)}
    {...props}
  />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogBase.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogBase.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogBase.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = AlertDialogBase.Title.displayName;

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogBase.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogBase.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogBase.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
AlertDialogDescription.displayName = AlertDialogBase.Description.displayName;

// Base UI AlertDialog does not have Action/Cancel parts.
// AlertDialogAction is a styled button; AlertDialogCancel uses Dialog.Close.
const AlertDialogAction = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants(), className)} {...props} />
  ),
);
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogBase.Close>,
  React.ComponentPropsWithoutRef<typeof AlertDialogBase.Close>
>(({ className, ...props }, ref) => (
  <AlertDialogBase.Close
    ref={ref}
    className={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)}
    {...props}
  />
));
AlertDialogCancel.displayName = AlertDialogBase.Close.displayName;

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogBackdrop,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
