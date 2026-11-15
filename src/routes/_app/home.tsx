import { Link, createFileRoute } from "@tanstack/react-router";
import { useUser } from "@clerk/tanstack-react-start";
import { ChevronRightIcon, MapPinIcon, RadarIcon } from "lucide-react";
import { useFarm } from "@/components/providers/farm-context.tsx";
import { Button } from "@/components/ui/button.tsx";
import ThemeToggle from "@/components/ui/theme-toggle.tsx";
import AlertCard from "@/components/farm/alert-card.tsx";
import AssistantFab from "@/components/farm/assistant-fab.tsx";
import { CropTile } from "@/components/farm/crop-card.tsx";
import Logo from "@/components/ui/logo.tsx";
import {
  adaptObservationsToAlerts,
  adaptObservationsToConditions,
  adaptRegionalSample,
  buildAgronomyInsight,
} from "@/lib/agronomy-data.ts";
import { useRecommendations } from "@/hooks/use-recommendation.ts";
import { useNasaPowerObservations } from "@/hooks/use-nasa-power.ts";
import {
  formatCoords,
  formatRain,
  formatTemp,
  getLocation,
} from "@/lib/format.ts";
import { cn } from "@/lib/utils.ts";
import type { Units } from "@/components/providers/farm-context.tsx";
import type { Condition } from "@/lib/mock/conditions.ts";

export const Route = createFileRoute("/_app/home")({
  head: () => ({ meta: [{ title: "Home | TerraBites" }] }),
  component: Home,
});

const STATUS_DOT: Record<Condition["status"], string> = {
  good: "bg-primary",
  watch: "bg-chart-4",
  alert: "bg-destructive",
  info: "bg-muted-foreground",
};

function displayValue(c: Condition, units: Units) {
  if (c.key === "temperature") return formatTemp(Number(c.value), units);
  if (c.key === "rainfall") return formatRain(Number(c.value), units);
  return { value: c.value, unit: c.unit };
}

function Home() {
  const { locationId, units, deviceLocation, dataSources } = useFarm();
  const { user } = useUser();
  const loc = getLocation(locationId);
  const latitude = deviceLocation?.latitude ?? loc.lat;
  const longitude = deviceLocation?.longitude ?? loc.lng;
  const nasaPower = useNasaPowerObservations(
    latitude,
    longitude,
    dataSources.power,
  );
  const firstName =
    user?.firstName || user?.fullName?.split(" ")[0] || "farmer";
  const locationName = deviceLocation
    ? [deviceLocation.city, deviceLocation.region ?? deviceLocation.country]
        .filter(Boolean)
        .join(", ") ||
      `${deviceLocation.latitude.toFixed(4)}, ${deviceLocation.longitude.toFixed(4)}`
    : `${loc.city}, ${loc.province}`;
  const regionName = deviceLocation
    ? [deviceLocation.region, deviceLocation.country]
        .filter(Boolean)
        .join(" · ") || "GPS location"
    : loc.region;
  const top = useRecommendations().ranked.slice(0, 4);
  const sampleObservations = adaptRegionalSample(loc);
  const observations = nasaPower.data ?? sampleObservations;
  const conditions = adaptObservationsToConditions(observations);
  const alerts = adaptObservationsToAlerts(observations);
  const insight = buildAgronomyInsight(
    observations,
    top[0] && {
      cropName: top[0].crop.name,
      score: top[0].score,
    },
  );
  const [hero, ...rest] = conditions;
  const heroValue = displayValue(hero, units);
  const nasaDataThrough =
    nasaPower.data?.find((observation) => observation.observedAt)?.observedAt ??
    null;
  const nasaError =
    nasaPower.error instanceof Error
      ? nasaPower.error.message
      : "Unknown NASA POWER error";

  return (
    <div className="mx-auto max-w-3xl">
      <section className="relative overflow-hidden bg-primary px-4 pt-4 pb-20 text-primary-foreground md:mx-8 md:mt-6 md:rounded-[2rem] md:px-8 md:pt-6">
        <div
          aria-hidden
          className="absolute -top-24 -right-16 size-72 rounded-full bg-[radial-gradient(circle,oklch(0.84_0.13_85/0.45),transparent_70%)]"
        />
        <div className="relative flex items-center justify-between md:hidden">
          <Logo inverse />
          <span className="[&_button:hover]:bg-primary-foreground/15 [&_button]:text-primary-foreground">
            <ThemeToggle />
          </span>
        </div>
        <div className="relative pt-6 md:pt-2">
          <p className="text-primary-foreground/80">
            Magandang umaga, {firstName}
          </p>
          <Link
            to="/location"
            className="group mt-1 inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary-foreground/12 py-1.5 pr-3 pl-2 text-sm font-semibold"
          >
            <MapPinIcon className="size-4" />
            {locationName}
            <ChevronRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          {deviceLocation?.city && (
            <p className="pt-1 pl-1 text-[10px] text-primary-foreground/70">
              Place name ©{" "}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                OpenStreetMap contributors
              </a>
            </p>
          )}
          <p className="pt-1.5 pl-1 font-mono text-xs text-primary-foreground/70">
            {regionName} · {formatCoords(latitude, longitude)}
          </p>
          <div className="flex items-end gap-3 pt-5">
            <span className="font-serif text-7xl leading-none font-semibold">
              {heroValue.value}
              <span className="text-4xl">{heroValue.unit}</span>
            </span>
            <div className="pb-1.5 text-sm">
              <p className="font-bold">Regional conditions</p>
              <p className="text-primary-foreground/75">{hero.detail}</p>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-label="Field conditions"
        className="relative -mt-14 px-4 md:px-12"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {rest.map((c) => {
            const Icon = c.icon;
            const value = displayValue(c, units);
            return (
              <div
                key={c.key}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-9 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <span
                    className={cn("size-2.5 rounded-full", STATUS_DOT[c.status])}
                    aria-label={c.status}
                  />
                </div>
                <p className="pt-3 text-sm font-semibold text-muted-foreground">
                  {c.label}
                </p>
                <p className="text-2xl font-extrabold tracking-tight">
                  {value.value}
                  <span className="pl-0.5 text-sm font-bold text-muted-foreground">
                    {value.unit}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">{c.detail}</p>
              </div>
            );
          })}
        </div>
        {nasaPower.data ? (
          <p className="flex items-center gap-1.5 pt-3 text-xs text-muted-foreground">
            <RadarIcon className="size-3.5" />
            NASA POWER daily gridded data through{" "}
            {nasaDataThrough?.slice(0, 10)}
            {" · "}
            topsoil wetness is a modeled index, not a field measurement.{" "}
            <a
              href="https://power.larc.nasa.gov/"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Source
            </a>
          </p>
        ) : (
          <p
            role={nasaPower.isError ? "alert" : "status"}
            className="flex items-center gap-1.5 pt-3 text-xs text-muted-foreground"
          >
            <RadarIcon className="size-3.5 shrink-0" />
            {!dataSources.power
              ? "NASA POWER is disabled in Profile settings; showing a regional sample."
              : nasaPower.isError
                ? `NASA POWER unavailable (${nasaError}); showing a regional sample.`
                : nasaPower.isPending
                  ? "Loading NASA POWER data; showing a regional sample temporarily."
                  : "Regional sample observations · illustrative, not live satellite data."}
          </p>
        )}
      </section>

      <section className="px-4 pt-8 md:px-12">
        <SectionTitle title="Alerts for your farm" />
        <div className="flex flex-col gap-3">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      </section>

      <section className="pt-8">
        <div className="px-4 md:px-12">
          <SectionTitle title="Recommended Crops for Your Area" to="/crops" />
        </div>
        <div className="flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:px-12">
          {top.map((item) => (
            <CropTile key={item.crop.id} item={item} />
          ))}
        </div>
      </section>

      <section className="px-4 pt-8 md:px-12">
        <Link
          to="/insights"
          className="flex cursor-pointer items-center gap-4 rounded-3xl border border-border bg-secondary/60 p-5 transition-colors hover:bg-secondary"
        >
          <div className="min-w-0 flex-1">
            <p className="font-bold">{insight.title}</p>
            <p className="text-sm text-muted-foreground">
              {insight.detail} Explore data insights.
            </p>
          </div>
          <ChevronRightIcon className="size-5 shrink-0" />
        </Link>
      </section>

      <AssistantFab />
    </div>
  );
}

function SectionTitle({ title, to }: { title: string; to?: "/crops" }) {
  return (
    <div className="flex items-center justify-between pb-3">
      <h2 className="font-serif text-xl font-semibold tracking-tight">
        {title}
      </h2>
      {to && (
        <Button
          variant="link"
          className="px-0 font-bold"
          render={<Link to={to} />}
          nativeButton={false}
        >
          See all
        </Button>
      )}
    </div>
  );
}
