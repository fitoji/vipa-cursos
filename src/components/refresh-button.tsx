"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function RefreshButton({ className }: { className?: string }) {
  const qc = useQueryClient();
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = async () => {
    setSpinning(true);
    await qc.invalidateQueries();
    setSpinning(false);
    toast.success("Datos actualizados");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleRefresh}
      aria-label="Actualizar datos"
      className={className}
    >
      <RefreshCw className={cn("h-4 w-4", spinning && "animate-spin")} />
    </Button>
  );
}
