import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ChevronRightIcon,
  CloudRainIcon,
  DropletsIcon,
  MapPinIcon,
  RadarIcon,
  ThermometerIcon,
  WindIcon,
} from "lucide-react";
import { useFarm } from "@/components/providers/farm-context.tsx";
import { useFarmWeather, dailyRainfall, weatherDescription } from "@/hooks/use-farm-weather.ts";
import { useRecommendations } from "@/hooks/use-recommendation.ts";
import { Button } from "@/components/ui/button.tsx";
import ThemeToggle from "@/components/ui/theme-toggle.tsx";
import AlertCard from "@/components/farm/alert-card.tsx";
import AssistantFab from "@/components/farm/assistant-fab.tsx";
import { CropTile } from "@/components/farm/crop-card.tsx";
import Logo from "@/components/ui/logo.tsx";
import { formatCoords, formatRain, formatTemp } from "@/lib/format.ts";
import { analyzeWeatherAlerts } from "@/lib/weather-analysis.ts";

export const Route = createFileRoute("/_app/home")({
  head: () => ({ meta: [{ title: "Home | TerraBites" }] }),
  component: Home,
});

function Home() {
  const { location, profile, units } = useFarm();
  const weather = useFarmWeather();
  const top = useRecommendations().ranked.slice(0, 4);
  const firstName = profile.name.trim().split(" ")[0] || "there";

  if (!location) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-8 md:px-12">
        <section className="rounded-3xl bg-primary p-6 text-primary-foreground md:mt-6 md:p-8">
          <div className="flex items-center justify-between md:hidden">
            <Logo inverse />
            <ThemeToggle />
          </div>
          <h1 className="pt-6 font-serif text-3xl font-semibold">Welcome to TerraBites</h1>
          <p className="pt-2 text-primary-foreground/80">
            Set your farm location to load real weather and field-specific crop analysis.
          </p>
          <Button
            render={<Link to="/location" />}
            nativeButton={false}
            className="mt-5 h-12 rounded-xl bg-primary-foreground font-bold text-primary hover:bg-primary-foreground/90"
          >
            <MapPinIcon /> Set farm location
          </Button>
        </section>
        <AssistantFab />
      </div>
    );
  }

  const data = weather.data;
  const alerts = data ? analyzeWeatherAlerts(data) : [];
  const rainfall24h = data
    ? data.hourly.precipitation.slice(0, 24).reduce((sum, amount) => sum + amount, 0)
    : null;
  const soilReadings = data?.hourly.soil_moisture_0_to_7cm ?? [];
  const soilMoisture = soilReadings.find((reading) => reading !== null) ?? null;
  const conditions = data
    ? [
        {
          label: "Feels like",
          value: formatTemp(data.current.apparent_temperature, units),
          detail: weatherDescription(data.current.weather_code),
          icon: ThermometerIcon,
        },
        {
          label: "Rain next 24 h",
          value: formatRain(rainfall24h ?? 0, units),
          detail: "Forecast precipitation",
          icon: CloudRainIcon,
        },
        {
          label: "Humidity",
          value: { value: `${data.current.relative_humidity_2m}`, unit: "%" },
          detail: "Current relative humidity",
          icon: DropletsIcon,
        },
        {
          label: "Wind",
          value: { value: `${Math.round(data.current.wind_speed_10m)}`, unit: "km/h" },
          detail: "Current wind speed",
          icon: WindIcon,
        },
        ...(soilMoisture !== null
          ? [
              {
                label: "Modelled soil moisture",
                value: { value: `${Math.round(soilMoisture * 100)}`, unit: "%" },
                detail: "Top 7 cm · weather model estimate",
                icon: DropletsIcon,
              },
            ]
          : []),
      ]
    : [];
  const currentTemp = data ? formatTemp(data.current.temperature_2m, units) : null;

  return (
    <div className="mx-auto max-w-3xl">
      <section className="relative overflow-hidden bg-primary px-4 pt-4 pb-20 text-primary-foreground md:mx-8 md:mt-6 md:rounded-[2rem] md:px-8 md:pt-6">
        <div className="absolute -top-24 -right-16 size-72 rounded-full bg-[radial-gradient(circle,oklch(0.84_0.13_85/0.45),transparent_70%)]" />
        <div className="relative flex items-center justify-between md:hidden">
          <Logo inverse />
          <span className="[&_button:hover]:bg-primary-foreground/15 [&_button]:text-primary-foreground">
            <ThemeToggle />
          </span>
        </div>
        <div className="relative pt-6 md:pt-2">
          <p className="text-primary-foreground/80">Good day, {firstName}</p>
          <Link
            to="/location"
            className="group mt-1 inline-flex items-center gap-2 rounded-full bg-primary-foreground/12 py-1.5 pr-3 pl-2 text-sm font-semibold"
          >
            <MapPinIcon className="size-4" />
            {location.city}{location.province ? `, ${location.province}` : ""}
            <ChevronRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <p className="pt-1.5 pl-1 font-mono text-xs text-primary-foreground/70">
            {formatCoords(location.lat, location.lng)}
          </p>
          {weather.isPending ? (
            <p className="pt-8 text-sm">Loading local weather…</p>
          ) : weather.error ? (
            <p role="alert" className="pt-8 text-sm">
              Weather could not be loaded. {weather.error.message}
            </p>
          ) : data && currentTemp ? (
            <div className="flex items-end gap-3 pt-5">
              <span className="font-serif text-7xl leading-none font-semibold">
                {currentTemp.value}<span className="text-4xl">{currentTemp.unit}</span>
              </span>
              <div className="pb-1.5 text-sm">
                <p className="font-bold">{weatherDescription(data.current.weather_code)}</p>
                <p className="text-primary-foreground/75">Updated {data.current.time}</p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section aria-label="Field conditions" className="relative -mt-14 px-4 md:px-12">
        {conditions.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {conditions.map(({ label, value, detail, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <span className="grid size-9 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                  <Icon className="size-5" />
                </span>
                <p className="pt-3 text-sm font-semibold text-muted-foreground">{label}</p>
                <p className="text-2xl font-extrabold tracking-tight">
                  {value.value}<span className="pl-0.5 text-sm font-bold text-muted-foreground">{value.unit}</span>
                </p>
                <p className="text-xs text-muted-foreground">{detail}</p>
              </div>
            ))}
          </div>
        ) : !weather.error ? (
          <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
            Weather readings will appear here when the forecast loads.
          </p>
        ) : null}
        {data && (
          <p className="flex items-center gap-1.5 pt-3 text-xs text-muted-foreground">
            <RadarIcon className="size-3.5" />
            Open-Meteo forecast · {data.daily.time.length}-day outlook ·{" "}
            {formatRain(dailyRainfall(data), units).value} {formatRain(dailyRainfall(data), units).unit} forecast rain
          </p>
        )}
      </section>

      <section className="px-4 pt-8 md:px-12">
        <div className="flex items-center justify-between pb-3">
          <div>
            <h2 className="font-serif text-xl font-semibold tracking-tight">Forecast signals</h2>
            <p className="text-xs text-muted-foreground">Threshold-based signals, not official warnings</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void weather.refetch()}
            disabled={weather.isFetching}
          >
            Refresh
          </Button>
        </div>
        {alerts.length > 0 ? (
          <div className="flex flex-col gap-3">
            {alerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)}
          </div>
        ) : data ? (
          <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
            No high-rain, high-heat, or thunderstorm signals in the current forecast.
          </p>
        ) : null}
      </section>

      <section className="pt-8">
        <div className="flex items-center justify-between px-4 pb-3 md:px-12">
          <h2 className="font-serif text-xl font-semibold tracking-tight">Crop suitability</h2>
          <Button variant="link" className="px-0 font-bold" render={<Link to="/crops" />} nativeButton={false}>
            See all
          </Button>
        </div>
        {top.length > 0 ? (
          <div className="flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:px-12">
            {top.map((item) => <CropTile key={item.crop.id} item={item} />)}
          </div>
        ) : (
          <p className="mx-4 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground md:mx-12">
            Crop analysis will be available when live weather is loaded.
          </p>
        )}
      </section>

      <section className="px-4 pt-8 md:px-12">
        <Link
          to="/insights"
          className="flex items-center gap-4 rounded-3xl border border-border bg-secondary/60 p-5 transition-colors hover:bg-secondary"
        >
          <div className="min-w-0 flex-1">
            <p className="font-bold">Explore historical weather</p>
            <p className="text-sm text-muted-foreground">
              Compare actual archived temperature, rainfall, and modelled soil-moisture readings.
            </p>
          </div>
          <ChevronRightIcon className="size-5 shrink-0" />
        </Link>
      </section>
      <AssistantFab />
    </div>
  );
}
