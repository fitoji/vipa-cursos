"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DatePicker({
  value,
  onChange,
  placeholder = "Elegí una fecha",
  className,
}: {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date | undefined>(
    value ? new Date(value + "T00:00:00") : undefined,
  );

  useEffect(() => {
    if (value) setMonth(new Date(value + "T00:00:00"));
  }, [value]);

  const date = value ? new Date(value + "T00:00:00") : undefined;

  const handleMonthChange = (newMonth: Date) => {
    setMonth(newMonth);

    const currentDay = date ? date.getDate() : 1;
    const lastDayOfNewMonth = new Date(
      newMonth.getFullYear(),
      newMonth.getMonth() + 1,
      0,
    ).getDate();
    const safeDay = Math.min(currentDay, lastDayOfNewMonth);

    const updated = new Date(newMonth.getFullYear(), newMonth.getMonth(), safeDay);

    onChange(format(updated, "yyyy-MM-dd"));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon data-icon="inline-start" />
          {date ? format(date, "dd/MM/yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          month={month}
          onMonthChange={handleMonthChange}
          onSelect={(day) => {
            if (day) {
              onChange(format(day, "yyyy-MM-dd"));
              setOpen(false);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
