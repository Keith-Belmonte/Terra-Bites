import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format, subDays } from "date-fns";
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  CalendarIcon,
  CheckCircle2Icon,
  InfoIcon,
  MinusIcon,
  SatelliteIcon,
} from "lucide-react";
import type { DateRange } from "react-day-picker";
import ScreenHeader from "@/components/ui/screen-header.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Calendar } from "@/components/ui/calendar.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import MetricChart from "./-component/metric-chart.tsx";
import {
  METRICS,
  RANGE_OPTIONS,
  getSeries,
  type MetricKey,
  type TimeRange,
} from "@/lib/mock/insights.ts";
import { cn } from "@/lib/utils.ts";
import { useFarm } from "@/components/providers/farm-context.tsx";
import { getLocation } from "@/lib/format.ts";

export const Route = createFileRoute("/_app/insights")({
  head: () => ({ meta: [{ title: "NASA Data Insights | TerraBites" }] }),
  component: Insights,
});

// Fixed reference date keeps server and client renders identical.
const TODAY = new Date("2026-10-31T00:00:00");

function Insights() {
  const { locationId } = useFarm();
  const loc = getLocation(locationId);
  const [active, setActive] = useState<MetricKey>("soil");
  const [range, setRange] = useState<TimeRange>("7d");
  const [custom, setCustom] = useState<DateRange | undefined>({
    from: subDays(TODAY, 14),
    to: TODAY,
  });
  const metric = METRICS.find((m) => m.key === active) ?? METRICS[0];
  const data = getSeries(active, range);
  const TrendIcon =
    metric.trend === "up"
      ? ArrowUpRightIcon
      : metric.trend === "down"
        ? ArrowDownRightIcon
        : MinusIcon;

  const customLabel =
    custom?.from && custom.to
      ? `${format(custom.from, "MMM d")} – ${format(custom.to, "MMM d")}`
      : "Pick dates";

  return (
    <>
      <ScreenHeader
        title="NASA Data Insights"
        subtitle={`${loc.city}, ${loc.province}`}
      />
      <div className="mx-auto max-w-3xl px-4 pt-4 md:px-8">
        {/* Metric tabs */}
        <div
          role="tablist"
          aria-label="Data type"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]"
        >
          {METRICS.map((m) => (
            <button
              key={m.key}
              type="button"
              role="tab"
              aria-selected={m.key === active}
              onClick={() => setActive(m.key)}
              className={cn(
                "h-11 shrink-0 cursor-pointer rounded-full border px-4 text-sm font-bold transition-colors",
                m.key === active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted",
              )}
            >
              {m.tab}
            </button>
          ))}
        </div>

        {/* Range filter (climate is always 12 months) */}
        {active !== "climate" && (
          <div className="flex flex-wrap items-center gap-2 pt-3">
            <div className="grid flex-1 grid-cols-4 rounded-xl bg-muted p-1">
              {RANGE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setRange(o.value)}
                  aria-pressed={range === o.value}
                  className={cn(
                    "h-10 cursor-pointer rounded-lg text-sm font-semibold transition-colors",
                    range === o.value
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
            {range === "custom" && (
              <Popover>
                <PopoverTrigger
                  render={
                    <Button variant="secondary" className="h-12 rounded-xl font-semibold" />
                  }
                >
                  <CalendarIcon />
                  {customLabel}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={custom}
                    onSelect={setCustom}
                    defaultMonth={custom?.from}
                    disabled={{ after: TODAY }}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        )}

        {/* Headline */}
        <section className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">
                {metric.title}
              </p>
              <p className="font-serif text-5xl font-semibold tracking-tight">
                {metric.current}
              </p>
              <p className="flex items-center gap-1 pt-1 text-sm font-semibold text-muted-foreground">
                <TrendIcon className="size-4" />
                {metric.change}
              </p>
            </div>
            <span className="rounded-full bg-secondary px-3 py-1.5 text-sm font-bold text-secondary-foreground">
              {metric.status}
            </span>
          </div>
          <div className="pt-4">
            <MetricChart metric={metric} data={data} />
          </div>
          {metric.compareLabel && (
            <div className="flex gap-4 pt-1 text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-4 rounded-full bg-chart-1" />
                {active === "climate" ? "This year" : "Day high"}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-4 rounded-full bg-chart-3" />
                {metric.compareLabel}
              </span>
            </div>
          )}
          <p className="flex items-center gap-1.5 pt-3 text-xs text-muted-foreground">
            <SatelliteIcon className="size-3.5" />
            {metric.source} · sample data
          </p>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 pt-3">
          {metric.stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-muted p-3">
              <p className="text-xs font-semibold text-muted-foreground">{s.label}</p>
              <p className="pt-0.5 font-extrabold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Plain language */}
        <section className="mt-4 rounded-3xl border border-accent/50 bg-accent/12 p-5">
          <h2 className="flex items-center gap-2 font-bold">
            <InfoIcon className="size-5" />
            What does this mean?
          </h2>
          <p className="pt-2 leading-relaxed">{metric.plain}</p>
        </section>

        <section className="mt-4 rounded-3xl border border-border bg-card p-5">
          <h2 className="font-bold">What you can do</h2>
          <ul className="flex flex-col gap-3 pt-3">
            {metric.whatToDo.map((tip) => (
              <li key={tip} className="flex gap-3">
                <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
