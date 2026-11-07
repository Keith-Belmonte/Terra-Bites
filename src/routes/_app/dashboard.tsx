import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChartAreaIcon,
  ChevronRightIcon,
  HouseIcon,
  MapPinIcon,
  SproutIcon,
} from "lucide-react";
import { useFarm } from "@/components/providers/farm-context.tsx";
import { formatArea, getLocation } from "@/lib/format.ts";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard | TerraBites" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { locationId, deviceLocation, profile, units } = useFarm();
  const location = getLocation(locationId);
  const locationName = deviceLocation
    ? [deviceLocation.city, deviceLocation.region ?? deviceLocation.country]
        .filter(Boolean)
        .join(", ") ||
      `${deviceLocation.latitude.toFixed(4)}, ${deviceLocation.longitude.toFixed(4)}`
    : `${location.city}, ${location.province}`;
  const sections = [
    {
      title: "Field overview",
      description: "See current regional conditions and farm alerts.",
      to: "/home" as const,
      icon: HouseIcon,
    },
    {
      title: "Crops",
      description: "Browse crops recommended for your area.",
      to: "/crops" as const,
      icon: SproutIcon,
    },
    {
      title: "Agronomy insights",
      description: "Explore climate context and crop suitability.",
      to: "/insights" as const,
      icon: ChartAreaIcon,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <header>
        <p className="text-sm font-medium text-muted-foreground">
          TerraBites workspace
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Your farm dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          A quick overview of your farm and shortcuts to the tools you use.
        </p>
      </header>

      <section
        aria-labelledby="farm-summary-title"
        className="mt-8 rounded-3xl border border-border bg-card p-6 sm:p-8"
      >
        <p className="text-sm font-medium text-muted-foreground">
          Farm at a glance
        </p>
        <h2
          id="farm-summary-title"
          className="mt-1 text-2xl font-bold tracking-tight"
        >
          {profile.farmName}
        </h2>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPinIcon className="size-4 shrink-0" />
          {locationName}
        </p>
        <div className="mt-6 flex flex-wrap gap-x-10 gap-y-4 border-t border-border pt-5">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Farm size
            </p>
            <p className="mt-1 font-semibold">
              {formatArea(profile.farmSize, units)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Preferred crops
            </p>
            <p className="mt-1 font-semibold">
              {profile.preferredCrops.length}
            </p>
          </div>
        </div>
      </section>

      <section
        aria-label="Farm tools"
        className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {sections.map(({ title, description, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-secondary"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-secondary text-secondary-foreground transition-colors group-hover:bg-background">
              <Icon className="size-5" />
            </span>
            <h2 className="mt-4 flex items-center justify-between gap-2 text-lg font-bold">
              {title}
              <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
