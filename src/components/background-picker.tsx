"use client";

import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Image } from "lucide-react";
import { useTranslations } from "next-intl";

import { setBackgroundPreference } from "@/app/actions/courses";
import { useBackground } from "@/hooks/useBackground";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const BACKGROUNDS = [
  {
    key: "bosque.webp",
    label: "Bosque",
  },
  {
    key: "truthseeker08-bodhi-leaf-5213739_1280.webp",
    label: "Bodhi Leaf",
  },
  {
    key: "kalyanayahaluwo-leaves-6636814_1280.webp",
    label: "Sacred Leaves",
  },
  {
    key: "kalyanayahaluwo-sacred-fig-6656594_1280.webp",
    label: "Sacred Fig",
  },
] as const;

type BackgroundPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BackgroundPicker({ open, onOpenChange }: BackgroundPickerProps) {
  const qc = useQueryClient();
  const { backgroundImage } = useBackground();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = useTranslations("BackgroundPicker") as any;

  const mutation = useMutation({
    mutationFn: (imageKey: string) => setBackgroundPreference(imageKey),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["backgroundPreference"] });
      toast.success(t("saved"));
      onOpenChange(false);
    },
    onError: () => {
      toast.error(t("error"));
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            {t("title")}
          </SheetTitle>
          <SheetDescription>{t("description")}</SheetDescription>
        </SheetHeader>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {BACKGROUNDS.map((bg) => {
            const isSelected = backgroundImage === bg.key;
            return (
              <button
                key={bg.key}
                type="button"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate(bg.key)}
                aria-label={t("selectImage", { name: bg.label })}
                aria-pressed={isSelected}
                className={cn(
                  "group relative aspect-[4/3] overflow-hidden rounded-lg border-2 transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  isSelected
                    ? "border-primary ring-2 ring-primary"
                    : "border-border hover:border-primary/50",
                  mutation.isPending && "opacity-50 cursor-not-allowed",
                )}
              >
                <img
                  src={`/background/${bg.key}`}
                  alt={bg.label}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
