import type { CSSProperties, ReactElement, ReactNode } from "react";
import {
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  type TooltipContentProps,
} from "recharts";
import { cn } from "@/lib/utils.ts";

export type ChartConfig = Record<
  string,
  { label?: string; color?: string }
>;

export function ChartContainer({
  config,
  className,
  children,
}: {
  config: ChartConfig;
  className?: string;
  children: ReactElement;
}) {
  const variables = Object.fromEntries(
    Object.entries(config).map(([key, item]) => [
      `--color-${key}`,
      item.color ?? "currentColor",
    ]),
  ) as CSSProperties;
  return (
    <div className={cn("w-full", className)} style={variables}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export const ChartTooltip = RechartsTooltip;

export function ChartTooltipContent({
  active,
  payload,
  label,
}: Partial<TooltipContentProps<number, string>> & {
  indicator?: "line" | "dot";
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      {label && <p className="font-semibold">{String(label)}</p>}
      {payload.map((item, index) => {
        const name =
          typeof item.name === "function"
            ? String(item.dataKey)
            : String(item.name ?? item.dataKey);
        return (
          <p key={`${item.dataKey ?? "value"}-${index}`}>
            {name}: {String(item.value)}
          </p>
        );
      })}
    </div>
  );
}
