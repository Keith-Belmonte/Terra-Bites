import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils.ts";

type CalendarProps = {
  mode: "range";
  selected?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
  defaultMonth?: Date;
  disabled?: { after?: Date };
  className?: string;
};

function dateValue(date: Date | undefined): string {
  if (!date) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function parseDate(value: string): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function Calendar({
  selected,
  onSelect,
  disabled,
  className,
}: CalendarProps) {
  const max = dateValue(disabled?.after);
  return (
    <div className={cn("grid gap-3 p-3 sm:grid-cols-2", className)}>
      <label className="grid gap-1 text-sm font-semibold">
        From
        <input
          type="date"
          value={dateValue(selected?.from)}
          max={max}
          onChange={(event) =>
            onSelect?.({
              from: parseDate(event.currentTarget.value),
              to: selected?.to,
            })
          }
          className="h-10 rounded-md border border-input bg-background px-2"
        />
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        To
        <input
          type="date"
          value={dateValue(selected?.to)}
          max={max}
          min={dateValue(selected?.from)}
          onChange={(event) =>
            onSelect?.({
              from: selected?.from,
              to: parseDate(event.currentTarget.value),
            })
          }
          className="h-10 rounded-md border border-input bg-background px-2"
        />
      </label>
    </div>
  );
}
