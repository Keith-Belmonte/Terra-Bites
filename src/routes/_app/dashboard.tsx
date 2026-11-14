import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CameraIcon,
  ChartAreaIcon,
  ChevronRightIcon,
  FlaskConicalIcon,
  HouseIcon,
  MapIcon,
  MapPinIcon,
  SproutIcon as PlantIcon,
  SproutIcon,
  WavesIcon,
} from "lucide-react";
import { useFarm } from "@/components/providers/farm-context.tsx";
import { formatArea, getLocation } from "@/lib/format.ts";
import { CROPS } from "@/lib/mock/crops.ts";
import SoilPhotoGuide from "./-component/soil-photo-guide.tsx";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard | TerraBites" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { locationId, deviceLocation, profile, units, gps, requestLocation } =
    useFarm();
  const location = getLocation(locationId);
  const preferredCrops = CROPS.filter((crop) =>
    profile.preferredCrops.includes(crop.id),
  );
  const mainCrop =
    preferredCrops.find((crop) => crop.type !== "Legume") ?? preferredCrops[0];
  const rotationCrop =
    preferredCrops.find((crop) => crop.type === "Legume") ??
    CROPS.find((crop) => crop.type === "Legume");
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

      <section aria-labelledby="recommendations-title" className="mt-10">
        <p className="text-sm font-semibold text-primary">
          Grow with confidence
        </p>
        <h2
          id="recommendations-title"
          className="mt-1 text-2xl font-bold tracking-tight"
        >
          Recommendations for your farm
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
              <PlantIcon className="size-5" />
            </span>
            <h3 className="mt-4 text-lg font-bold">Crop rotation</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {mainCrop && rotationCrop
                ? `${mainCrop.name} → ${rotationCrop.name} → rotate back to ${mainCrop.name}.`
                : "Rotate grain crops with a legume such as mung bean."}
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                Legumes can help replenish soil nitrogen between grain crops.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                Alternate crop families to help break pest and disease cycles.
              </li>
            </ul>
            <Link
              to="/crops"
              className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-primary hover:underline"
            >
              Explore suitable crops <ChevronRightIcon className="size-4" />
            </Link>
          </article>

          <article className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
              <WavesIcon className="size-5" />
            </span>
            <h3 className="mt-4 text-lg font-bold">Strengthen your soil</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Small, regular additions help protect soil structure and keep
              nutrients cycling.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                Add mature compost or well-rotted organic matter.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                Keep soil covered with mulch or a suitable cover crop.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                Avoid working wet soil to reduce compaction.
              </li>
            </ul>
            <Link
              to="/insights"
              className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-primary hover:underline"
            >
              View soil insights <ChevronRightIcon className="size-4" />
            </Link>
          </article>
        </div>
      </section>

      <section aria-labelledby="soil-photo-title" className="mt-10">
        <div className="mb-4">
          <p className="text-sm font-semibold text-primary">Field tool</p>
          <h2
            id="soil-photo-title"
            className="mt-1 text-2xl font-bold tracking-tight"
          >
            Check your soil
          </h2>
        </div>
        <SoilPhotoGuide />
      </section>

      <section aria-labelledby="farm-maps-title" className="mt-10">
        <p className="text-sm font-semibold text-primary">Explore your area</p>
        <h2
          id="farm-maps-title"
          className="mt-1 text-2xl font-bold tracking-tight"
        >
          Maps and local growing
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
              <MapPinIcon className="size-5" />
            </span>
            <h3 className="mt-4 text-lg font-bold">
              Fertilizer suppliers nearby
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Open a map search near your GPS location or selected farm area.
              Check the listing before travelling.
            </p>
            {gps === "locating" ? (
              <p className="mt-4 text-sm font-medium text-muted-foreground">
                Finding your location…
              </p>
            ) : (
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                <Link
                  to="/maps"
                  className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary hover:underline"
                >
                  Open supplier map <ChevronRightIcon className="size-4" />
                </Link>
                {!deviceLocation && (
                  <button
                    type="button"
                    onClick={requestLocation}
                    className="inline-flex min-h-11 cursor-pointer items-center gap-2 font-semibold text-muted-foreground hover:text-foreground"
                  >
                    <MapPinIcon className="size-4" /> Use GPS instead
                  </button>
                )}
              </div>
            )}
          </article>

          <article className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
              <MapIcon className="size-5" />
            </span>
            <h3 className="mt-4 text-lg font-bold">
              Crops grown in {location.region}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Local reference crops for {location.city}, {location.province}.
              This is sample regional data, not a live planting survey.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {location.profile.mainCrops.map((crop) => (
                <span
                  key={crop}
                  className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground"
                >
                  {crop}
                </span>
              ))}
            </div>
            <Link
              to="/maps"
              className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-primary hover:underline"
            >
              Explore climate & soil layers{" "}
              <ChevronRightIcon className="size-4" />
            </Link>
          </article>
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

      <section className="mt-8 flex flex-col gap-3 rounded-3xl border border-border bg-secondary/60 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <FlaskConicalIcon className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <h2 className="font-bold">Forecasts and reminders</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Set your forecast window and notification preferences.
            </p>
          </div>
        </div>
        <Link
          to="/profile"
          className="inline-flex min-h-11 shrink-0 items-center gap-2 font-semibold text-primary hover:underline"
        >
          Open settings <ChevronRightIcon className="size-4" />
        </Link>
      </section>
    </div>
  );
}
