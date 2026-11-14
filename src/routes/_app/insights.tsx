import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { format, subDays } from "date-fns";
import {
  CalendarIcon,
  CheckCircle2Icon,
  InfoIcon,
  SatelliteIcon,
} from "lucide-react";
import type { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import ScreenHeader from "@/components/ui/screen-header.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Calendar } from "@/components/ui/calendar.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import MetricChart from "./-component/metric-chart.tsx";
import { useFarm } from "@/components/providers/farm-context.tsx";
import { getWeatherHistory, type WeatherMetric } from "@/lib/farm-api.ts";
import { useNasaPower } from "@/hooks/use-nasa-power.ts";
import { useNasaGeosForecast } from "@/hooks/use-nasa-geos-forecast.ts";
import { cn } from "@/lib/utils.ts";

export const Route = createFileRoute("/_app/insights")({
  head: () => ({ meta: [{ title: "Weather Insights | TerraBites" }] }),
  component: Insights,
});

type Range = "7d" | "30d" | "custom";
type MetricOption = {
  key: WeatherMetric;
  tab: string;
  title: string;
  unit: string;
  chart: "area" | "bar" | "line";
  description: (average: number, total: number) => string;
  actions: string[];
};

const METRICS: MetricOption[] = [
  {
    key: "temperature",
    tab: "Temperature",
    title: "Average daily temperature",
    unit: "°C",
    chart: "line",
    description: (average) =>
      `The average daily temperature over this period was ${average.toFixed(1)}°C. Compare this with crop-specific temperature requirements.`,
    actions: [
      "Use crop-specific temperature thresholds when planning sowing and transplanting.",
      "Check local extension guidance before making heat-stress or planting decisions.",
    ],
  },
  {
    key: "rainfall",
    tab: "Rainfall",
    title: "Daily precipitation",
    unit: "mm",
    chart: "bar",
    description: (_average, total) =>
      `${total.toFixed(1)} mm of precipitation was recorded in the returned daily observations. Rainfall does not equal water available to roots.`,
    actions: [
      "Check drainage after heavy rainfall, especially in poorly drained fields.",
      "Use a field rain gauge to compare local rainfall with gridded estimates.",
    ],
  },
  {
    key: "soil-moisture",
    tab: "Modelled soil moisture",
    title: "Modelled surface soil moisture",
    unit: "%",
    chart: "area",
    description: (average) =>
      `The weather model's 0–7 cm surface soil-moisture estimate averaged ${average.toFixed(1)}%. It is not a field sensor or a full root-zone measurement.`,
    actions: [
      "Confirm modelled soil moisture with a field observation or soil probe before irrigation.",
      "Compare several days of readings rather than relying on one observation.",
    ],
  },
];

const RANGE_OPTIONS: Array<{ value: Range; label: string }> = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "custom", label: "Custom" },
];

function Insights() {
  const { location } = useFarm();
  const nasaPower = useNasaPower();
  const nasaForecast = useNasaGeosForecast();
  const [active, setActive] = useState<WeatherMetric>("temperature");
  const [range, setRange] = useState<Range>("7d");
  const [custom, setCustom] = useState<DateRange | undefined>();
  const metric = METRICS.find((item) => item.key === active) ?? METRICS[0]!;
  const latestAvailableDay = subDays(new Date(), 5);
  const defaultDays = range === "30d" ? 30 : 7;
  const from =
    range === "custom"
      ? custom?.from
      : subDays(latestAvailableDay, defaultDays - 1);
  const to = range === "custom" ? custom?.to : latestAvailableDay;
  const startDate = from ? format(from, "yyyy-MM-dd") : "";
  const endDate = to ? format(to, "yyyy-MM-dd") : "";
  const history = useQuery({
    queryKey: [
      "weather-history",
      location?.lat,
      location?.lng,
      active,
      startDate,
      endDate,
    ],
    queryFn: () =>
      getWeatherHistory({
        data: {
          latitude: location!.lat,
          longitude: location!.lng,
          startDate,
          endDate,
          metric: active,
        },
      }),
    enabled: Boolean(location && startDate && endDate && startDate <= endDate),
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });

  const points = useMemo(
    () =>
      (history.data ?? []).map(({ label, value }) => ({
        label: format(new Date(`${label}T00:00:00`), "MMM d"),
        value: active === "soil-moisture" ? value * 100 : value,
      })),
    [history.data, active],
  );
  const values = points.map((point) => point.value);
  const average = values.length
    ? values.reduce((total, value) => total + value, 0) / values.length
    : null;
  const total = values.reduce((sum, value) => sum + value, 0);
  const customLabel =
    custom?.from && custom.to
      ? `${format(custom.from, "MMM d")} – ${format(custom.to, "MMM d")}`
      : "Pick dates";

  if (!location) {
    return (
      <>
        <ScreenHeader
          title="Weather insights"
          subtitle="Historical weather for your farm"
        />
        <div className="mx-auto max-w-3xl px-4 pt-6 md:px-8">
          <p className="rounded-2xl border border-border bg-card p-5 text-muted-foreground">
            Set a farm location to load historical weather data.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <ScreenHeader
        title="Weather insights"
        subtitle={`${location.city}${location.province ? `, ${location.province}` : ""}`}
      />
      <div className="mx-auto max-w-3xl px-4 pt-4 md:px-8">
        <div
          role="tablist"
          aria-label="Weather metric"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]"
        >
          {METRICS.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={item.key === active}
              onClick={() => setActive(item.key)}
              className={cn(
                "h-11 shrink-0 rounded-full border px-4 text-sm font-bold transition-colors",
                item.key === active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted",
              )}
            >
              {item.tab}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-3">
          <div className="grid flex-1 grid-cols-3 rounded-xl bg-muted p-1">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRange(option.value)}
                aria-pressed={range === option.value}
                className={cn(
                  "h-10 rounded-lg text-sm font-semibold transition-colors",
                  range === option.value
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          {range === "custom" && (
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant="secondary"
                    className="h-12 rounded-xl font-semibold"
                  />
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
                  disabled={{
                    after: latestAvailableDay,
                    before: subDays(latestAvailableDay, 91),
                  }}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
        <p className="pt-2 text-xs text-muted-foreground">
          Historical archive data can lag by several days. Select dates ending
          on or before {format(latestAvailableDay, "MMM d, yyyy")}.
        </p>

        <section className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">
                {metric.title}
              </p>
              <p className="font-serif text-5xl font-semibold tracking-tight">
                {history.isPending
                  ? "…"
                  : average === null
                    ? "—"
                    : average.toFixed(1)}
                {average !== null && (
                  <span className="pl-1 text-2xl">{metric.unit}</span>
                )}
              </p>
              {average !== null && (
                <p className="pt-1 text-sm font-semibold text-muted-foreground">
                  {active === "rainfall"
                    ? `${total.toFixed(1)} mm total`
                    : `${values.length} daily readings`}
                </p>
              )}
            </div>
            <span className="rounded-full bg-secondary px-3 py-1.5 text-sm font-bold text-secondary-foreground">
              Open-Meteo archive
            </span>
          </div>
          {history.error ? (
            <p role="alert" className="pt-4 text-sm text-destructive">
              Could not load historical readings: {history.error.message}
            </p>
          ) : history.isPending ? (
            <p className="pt-4 text-sm text-muted-foreground">
              Loading archived observations…
            </p>
          ) : points.length > 0 ? (
            <div className="pt-4">
              <MetricChart metric={metric} data={points} />
            </div>
          ) : (
            <p className="pt-4 text-sm text-muted-foreground">
              No readings were returned for this location and date range.
            </p>
          )}
          <p className="flex items-center gap-1.5 pt-3 text-xs text-muted-foreground">
            <SatelliteIcon className="size-3.5" />
            Weather reanalysis/model data · not a field sensor or satellite
            vegetation product
          </p>
        </section>

        <section className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">
                NASA POWER · recent daily estimates
              </p>
              <h2 className="font-serif text-2xl font-semibold">
                Solar and climate context
              </h2>
            </div>
            {nasaPower.data && (
              <span className="rounded-full bg-secondary px-3 py-1.5 text-sm font-bold text-secondary-foreground">
                {format(
                  new Date(`${nasaPower.data.startDate}T00:00:00`),
                  "MMM d",
                )}
                –
                {format(
                  new Date(`${nasaPower.data.endDate}T00:00:00`),
                  "MMM d",
                )}
              </span>
            )}
          </div>
          {nasaPower.error ? (
            <p role="alert" className="pt-4 text-sm text-destructive">
              Could not load NASA POWER data: {nasaPower.error.message}
            </p>
          ) : nasaPower.isPending ? (
            <p className="pt-4 text-sm text-muted-foreground">
              Loading recent NASA POWER estimates…
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-3">
              <PowerMetric
                label="Mean air temperature"
                value={`${nasaPower.data.averageTemperatureC.toFixed(1)}°C`}
              />
              <PowerMetric
                label="Corrected precipitation"
                value={`${nasaPower.data.totalPrecipitationMm.toFixed(1)} mm`}
              />
              <PowerMetric
                label="Mean solar radiation"
                value={`${nasaPower.data.averageSolarRadiationMjM2Day.toFixed(1)} MJ/m²/day`}
              />
            </div>
          )}
          <p className="pt-3 text-xs text-muted-foreground">
            NASA POWER gridded satellite/model estimates for the latest complete
            days available—not farm sensors, a forecast, or vegetation health
            measurements. Used as additional context for Siesta.
          </p>
        </section>

        <section className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">
                NASA GEOS-CF · 5-day forecast
              </p>
              <h2 className="font-serif text-2xl font-semibold">
                Temperature and rainfall outlook
              </h2>
            </div>
            {nasaForecast.data && (
              <span className="rounded-full bg-secondary px-3 py-1.5 text-sm font-bold text-secondary-foreground">
                Run{" "}
                {nasaForecast.data.generatedAt.replace("T", " ").slice(0, 16)}{" "}
                UTC
              </span>
            )}
          </div>
          {nasaForecast.error ? (
            <p role="alert" className="pt-4 text-sm text-destructive">
              Could not load the NASA forecast: {nasaForecast.error.message}
            </p>
          ) : nasaForecast.isPending ? (
            <p className="pt-4 text-sm text-muted-foreground">
              Loading NASA&apos;s five-day forecast…
            </p>
          ) : (
            <div className="overflow-x-auto pt-4">
              <table className="w-full min-w-80 text-left text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr>
                    <th scope="col" className="pb-2 font-semibold">
                      UTC forecast day
                    </th>
                    <th scope="col" className="pb-2 font-semibold">
                      Low / high
                    </th>
                    <th scope="col" className="pb-2 text-right font-semibold">
                      Rain
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {nasaForecast.data.days.map((day) => (
                    <tr key={day.date}>
                      <th scope="row" className="py-2.5 font-semibold">
                        {format(new Date(`${day.date}T00:00:00`), "EEE, MMM d")}
                      </th>
                      <td className="py-2.5">
                        {day.minimumTemperatureC.toFixed(1)}° /{" "}
                        {day.maximumTemperatureC.toFixed(1)}°C
                      </td>
                      <td className="py-2.5 text-right">
                        {day.precipitationMm.toFixed(1)} mm
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="pt-3 text-xs text-muted-foreground">
            NASA GEOS-CF global model forecast sampled at the nearest 0.25° grid
            cell. Values summarize 24-hour periods from the run time (UTC);
            expired periods are omitted. These are research estimates—not
            official warnings or field-level forecasts. Rain totals are
            calculated from hourly model precipitation flux.{" "}
            <a
              href="https://gmao.gsfc.nasa.gov/gmao-products/geos-cf/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold underline underline-offset-2"
            >
              About NASA GEOS-CF
            </a>
          </p>
        </section>

        {average !== null && (
          <>
            <section className="mt-4 rounded-3xl border border-accent/50 bg-accent/12 p-5">
              <h2 className="flex items-center gap-2 font-bold">
                <InfoIcon className="size-5" /> What does this mean?
              </h2>
              <p className="pt-2 leading-relaxed">
                {metric.description(average, total)}
              </p>
            </section>
            <section className="mt-4 rounded-3xl border border-border bg-card p-5">
              <h2 className="font-bold">How to use this data</h2>
              <ul className="flex flex-col gap-3 pt-3">
                {metric.actions.map((tip) => (
                  <li key={tip} className="flex gap-3">
                    <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </>
  );
}

function PowerMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary/60 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="pt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
