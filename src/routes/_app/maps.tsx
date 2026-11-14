import { lazy, Suspense, useMemo, useState, useSyncExternalStore } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  CloudRainIcon,
  DropletsIcon,
  LoaderCircleIcon,
  MapPinIcon,
  MountainIcon,
  NavigationIcon,
  SproutIcon,
  ThermometerIcon,
  WheatIcon,
} from "lucide-react";
import ScreenHeader from "@/components/ui/screen-header.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useFarm } from "@/components/providers/farm-context.tsx";
import { LOCATIONS } from "@/lib/mock/conditions.ts";
import {
  fetchNasaPowerMonthlyClimatology,
  type MonthlyClimateSummary,
} from "@/lib/nasa-power.ts";
import {
  distanceInKilometers,
  searchFertilizerPlaces,
} from "@/lib/openstreetmap.ts";
import {
  getForecastLeadDays,
  subscribeToForecastLeadDays,
} from "@/lib/forecast-preferences.ts";
import { fetchWeatherForecast } from "@/lib/weather-forecast.ts";
import {
  getMapStationValue,
  type ClimateLayer,
  type MapStation,
} from "@/lib/map-layer.ts";
import type { MapCenter, MapMode } from "@/lib/map-types.ts";
import "leaflet/dist/leaflet.css";

const InteractiveMap = lazy(() => import("./-component/interactive-map.tsx"));
const subscribeMapReady = () => () => {};
const getMapReady = () => true;
const getServerMapReady = () => false;

export const Route = createFileRoute("/_app/maps")({
  head: () => ({ meta: [{ title: "Farm Maps | TerraBites" }] }),
  component: FarmMaps,
});

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const LAYERS: Array<{
  value: ClimateLayer;
  label: string;
  icon: typeof CloudRainIcon;
}> = [
  { value: "rainfall", label: "Rainfall", icon: CloudRainIcon },
  { value: "humidity", label: "Humidity", icon: DropletsIcon },
  { value: "temperature", label: "Temperature", icon: ThermometerIcon },
  { value: "soil-ph", label: "Soil pH", icon: MountainIcon },
  { value: "fertility", label: "Soil fertility", icon: WheatIcon },
  { value: "crops", label: "Regional crops", icon: SproutIcon },
];

const LAYER_LEGENDS: Record<
  ClimateLayer,
  Array<{ color: string; label: string }>
> = {
  rainfall: [
    { color: "#d97706", label: "Under 100 mm" },
    { color: "#0891b2", label: "100–199 mm" },
    { color: "#2563eb", label: "200 mm or more" },
  ],
  humidity: [
    { color: "#d97706", label: "Under 70%" },
    { color: "#0891b2", label: "70–84%" },
    { color: "#2563eb", label: "85% or more" },
  ],
  temperature: [
    { color: "#2563eb", label: "Under 25 °C" },
    { color: "#d97706", label: "25–29 °C" },
    { color: "#dc2626", label: "30 °C or more" },
  ],
  "soil-ph": [
    { color: "#d97706", label: "Acidic · under 5.5" },
    { color: "#15803d", label: "Common crop range · 5.5–7.5" },
    { color: "#dc2626", label: "Alkaline · over 7.5" },
  ],
  fertility: [
    { color: "#dc2626", label: "Low" },
    { color: "#d97706", label: "Moderate" },
    { color: "#15803d", label: "High" },
  ],
  crops: [{ color: "#15803d", label: "Reference crops for this area" }],
};

function FarmMaps() {
  const farm = useFarm();
  const [mapMode, setMapMode] = useState<MapMode>("climate");
  const [layer, setLayer] = useState<ClimateLayer>("rainfall");
  const [monthIndex, setMonthIndex] = useState(() => new Date().getUTCMonth());
  const forecastLeadDays = useSyncExternalStore(
    subscribeToForecastLeadDays,
    getForecastLeadDays,
    () => "3",
  );
  const forecastDays =
    forecastLeadDays === "1" ? 1 : forecastLeadDays === "3" ? 3 : 7;
  const selectedLocation =
    LOCATIONS.find((location) => location.id === farm.locationId) ??
    LOCATIONS[0];
  const searchCenter = useMemo<MapCenter>(
    () =>
      farm.deviceLocation
        ? {
            latitude: farm.deviceLocation.latitude,
            longitude: farm.deviceLocation.longitude,
            label:
              farm.deviceLocation.city ??
              `${farm.deviceLocation.latitude.toFixed(3)}, ${farm.deviceLocation.longitude.toFixed(3)}`,
          }
        : {
            latitude: selectedLocation.lat,
            longitude: selectedLocation.lng,
            label: `${selectedLocation.city}, ${selectedLocation.province}`,
          },
    [farm.deviceLocation, selectedLocation],
  );
  const mapReady = useSyncExternalStore(
    subscribeMapReady,
    getMapReady,
    getServerMapReady,
  );

  const monthlyQueries = useQueries({
    queries: LOCATIONS.map((location) => ({
      queryKey: ["nasa-power-monthly", location.lat, location.lng] as const,
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        fetchNasaPowerMonthlyClimatology(
          { latitude: location.lat, longitude: location.lng },
          signal,
        ),
      enabled: mapMode === "climate",
      staleTime: 7 * 24 * 60 * 60 * 1000,
      retry: 1,
    })),
  });

  const supplierQuery = useQuery({
    queryKey: [
      "osm-fertilizer-places",
      searchCenter.latitude,
      searchCenter.longitude,
    ],
    queryFn: ({ signal }) => searchFertilizerPlaces(searchCenter, signal),
    enabled: mapMode === "suppliers",
    staleTime: 24 * 60 * 60 * 1000,
    retry: 0,
  });
  const forecastQuery = useQuery({
    queryKey: [
      "open-meteo-forecast",
      searchCenter.latitude,
      searchCenter.longitude,
      forecastDays,
    ],
    queryFn: ({ signal }) =>
      fetchWeatherForecast(searchCenter, forecastDays, signal),
    enabled: mapMode === "climate",
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });

  const stations: MapStation[] = LOCATIONS.map((location, index) => ({
    location,
    climate: monthlyQueries[index]?.data,
    soil:
      location.id === farm.locationId
        ? (farm.soilTest ?? undefined)
        : undefined,
  }));
  const queryError = monthlyQueries.find((query) => query.error)?.error;
  const baseline = monthlyQueries.find((query) => query.data)?.data;
  const supplierPlaces = useMemo(
    () =>
      (supplierQuery.data ?? [])
        .map((place) => ({
          place,
          distance: distanceInKilometers(searchCenter, place),
        }))
        .sort((left, right) => left.distance - right.distance)
        .map(({ place }) => place),
    [searchCenter, supplierQuery.data],
  );
  const monthLabel = MONTHS[monthIndex];
  const isReferenceLayer =
    layer === "soil-ph" || layer === "fertility" || layer === "crops";

  return (
    <>
      <ScreenHeader
        title="Farm maps"
        subtitle="Explore typical climate, soil information, and nearby suppliers"
      />
      <div className="mx-auto max-w-6xl px-4 pt-4 md:px-8">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Map type"
        >
          <button
            type="button"
            aria-pressed={mapMode === "climate"}
            onClick={() => setMapMode("climate")}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-bold transition-colors ${
              mapMode === "climate"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-muted"
            }`}
          >
            <MountainIcon className="size-4" />
            Climate & soil
          </button>
          <button
            type="button"
            aria-pressed={mapMode === "suppliers"}
            onClick={() => setMapMode("suppliers")}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-bold transition-colors ${
              mapMode === "suppliers"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-muted"
            }`}
          >
            <MapPinIcon className="size-4" />
            Fertilizer suppliers
          </button>
        </div>

        <section className="mt-4 rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
          {mapMode === "climate" ? (
            <>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <h2 className="text-xl font-bold">
                      Philippines reference map
                    </h2>
                    <Link
                      to="/location"
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      Change farm location
                    </Link>
                  </div>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                    Select a layer and month. Climate markers use a 10-year NASA
                    POWER baseline; soil values are regional survey estimates,
                    not measurements from every field.
                  </p>
                  <p className="mt-2 max-w-2xl text-xs text-muted-foreground">
                    Coverage is currently three sample locations in the Bicol
                    Region. Nationwide soil data and official crop-production
                    rankings are not connected yet.
                  </p>
                </div>
                <label className="w-full max-w-sm">
                  <span className="flex items-center justify-between gap-3 text-sm font-semibold">
                    <span>Typical conditions in</span>
                    <span aria-live="polite">{monthLabel}</span>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={11}
                    step={1}
                    value={monthIndex}
                    onChange={(event) =>
                      setMonthIndex(Number(event.currentTarget.value))
                    }
                    aria-label="Select month for typical climate conditions"
                    className="mt-2 w-full accent-primary"
                  />
                  <span className="flex justify-between text-xs text-muted-foreground">
                    <span>Jan</span>
                    <span>Jun</span>
                    <span>Dec</span>
                  </span>
                </label>
              </div>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {LAYERS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={layer === value}
                    onClick={() => setLayer(value)}
                    className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-sm font-semibold ${
                      layer === value
                        ? "border-primary bg-secondary text-foreground"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="size-4" />
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-2 overflow-hidden rounded-2xl border border-border">
                {mapReady ? (
                  <Suspense
                    fallback={
                      <MapPlaceholder message="Loading the interactive map…" />
                    }
                  >
                    <InteractiveMap
                      mode="climate"
                      layer={layer}
                      monthIndex={monthIndex}
                      stations={stations}
                      selectedLocationId={farm.locationId}
                      center={searchCenter}
                      suppliers={[]}
                    />
                  </Suspense>
                ) : (
                  <MapPlaceholder message="Preparing the interactive map…" />
                )}
              </div>
              <ul
                aria-label={`${LAYERS.find((item) => item.value === layer)?.label ?? "Data"} map legend`}
                className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground"
              >
                {LAYER_LEGENDS[layer].map((item) => (
                  <li
                    key={item.label}
                    className="inline-flex items-center gap-1.5"
                  >
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                      aria-hidden="true"
                    />
                    {item.label}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {isReferenceLayer
                    ? layer === "crops"
                      ? "Local sample crop reference"
                      : "Regional sample soil survey"
                    : baseline
                      ? `NASA POWER historical baseline · ${baseline.startYear}–${baseline.endYear}`
                      : "Loading NASA POWER historical baseline…"}
                </span>
                <span>
                  {isReferenceLayer
                    ? layer === "crops"
                      ? "Crop lists are reference examples, not official ranked production data."
                      : farm.soilTest
                        ? "Your entered soil information is shown for the selected farm; pH and fertility may still be regional estimates. Confirm with a local soil test."
                        : "Soil pH and fertility are sample estimates. Confirm with a local soil test."
                    : "Monthly precipitation is an estimated total; this is climate history, not a forecast."}
                </span>
              </div>
              {!isReferenceLayer && queryError && (
                <p role="alert" className="mt-3 text-sm text-destructive">
                  Could not load NASA POWER map data: {queryError.message}
                </p>
              )}
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {stations.map((station) => {
                  const metric = getMapStationValue(station, layer, monthIndex);
                  return (
                    <article
                      key={station.location.id}
                      className="rounded-2xl bg-muted p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold">{station.location.city}</h3>
                          <p className="text-sm text-muted-foreground">
                            {station.location.province} ·{" "}
                            {station.location.region}
                          </p>
                        </div>
                        <span
                          className="mt-1 size-3 shrink-0 rounded-full"
                          style={{ backgroundColor: metric.color }}
                          aria-hidden="true"
                        />
                      </div>
                      <p className="mt-3 text-sm font-semibold">
                        {metric.value}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Main crops:{" "}
                        {station.location.profile.mainCrops.join(", ")}
                      </p>
                    </article>
                  );
                })}
              </div>
              <section
                aria-labelledby="farm-forecast-title"
                className="mt-6 rounded-2xl border border-border bg-background p-4 sm:p-5"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 id="farm-forecast-title" className="text-lg font-bold">
                      {forecastDays}-day forecast for {searchCenter.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Daily rain chance, rainfall, temperature, and wind for
                      planning field work.
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From Open-Meteo · not a local alert service
                  </p>
                </div>
                {forecastQuery.isFetching && (
                  <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <LoaderCircleIcon className="size-4 animate-spin" />
                    Loading forecast…
                  </p>
                )}
                {forecastQuery.isError && (
                  <p role="alert" className="mt-4 text-sm text-destructive">
                    Could not load the forecast: {forecastQuery.error.message}
                  </p>
                )}
                {forecastQuery.data && (
                  <>
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {forecastQuery.data.map((day) => (
                        <li key={day.date} className="rounded-xl bg-muted p-3">
                          <p className="font-bold">
                            {new Intl.DateTimeFormat(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            }).format(new Date(`${day.date}T12:00:00`))}
                          </p>
                          <p className="mt-1 text-sm">
                            {day.minTempC === null || day.maxTempC === null
                              ? "Temperature unavailable"
                              : `${Math.round(day.minTempC)}–${Math.round(day.maxTempC)} °C`}
                          </p>
                          <p className="text-sm">
                            Rain:{" "}
                            {day.rainfallMm === null
                              ? "—"
                              : `${day.rainfallMm} mm`}
                            {day.rainProbability === null
                              ? ""
                              : ` · ${day.rainProbability}% chance`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Max wind:{" "}
                            {day.maxWindKmh === null
                              ? "—"
                              : `${Math.round(day.maxWindKmh)} km/h`}
                          </p>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Use this as a planning aid, not a guarantee. Check local
                      advisories and product labels before field work.
                    </p>
                  </>
                )}
              </section>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    Supplier listings near {searchCenter.label}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                    OpenStreetMap agricultural shop and fertilizer listings
                    within 25 km. Listing coverage varies; call ahead to confirm
                    stock and location.
                  </p>
                </div>
                {!farm.deviceLocation && (
                  <div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={farm.requestLocation}
                      disabled={farm.gps === "locating"}
                    >
                      {farm.gps === "locating" ? (
                        <LoaderCircleIcon className="animate-spin" />
                      ) : (
                        <NavigationIcon />
                      )}
                      Use my GPS
                    </Button>
                    {farm.gps === "denied" && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        GPS unavailable; using your selected farm location.
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-4 overflow-hidden rounded-2xl border border-border">
                {mapReady ? (
                  <Suspense
                    fallback={
                      <MapPlaceholder message="Loading the interactive map…" />
                    }
                  >
                    <InteractiveMap
                      mode="suppliers"
                      layer={layer}
                      monthIndex={monthIndex}
                      stations={stations}
                      selectedLocationId={farm.locationId}
                      center={searchCenter}
                      suppliers={supplierPlaces}
                    />
                  </Suspense>
                ) : (
                  <MapPlaceholder message="Preparing the interactive map…" />
                )}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p aria-live="polite" className="text-sm text-muted-foreground">
                  {supplierQuery.isFetching
                    ? "Searching OpenStreetMap listings…"
                    : supplierQuery.isError
                      ? `Supplier search failed: ${supplierQuery.error.message}`
                      : supplierQuery.data
                        ? `${supplierPlaces.length} possible listing${supplierPlaces.length === 1 ? "" : "s"} found · sorted by distance`
                        : "Search results will appear on the map."}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `fertilizer supplier near ${searchCenter.latitude},${searchCenter.longitude}`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center font-semibold text-primary hover:underline"
                >
                  Search Google Maps instead
                </a>
              </div>
              {!supplierQuery.isFetching &&
                !supplierQuery.isError &&
                supplierQuery.data?.length === 0 && (
                  <p className="mt-3 rounded-xl bg-muted p-4 text-sm">
                    No matching places are tagged nearby in OpenStreetMap. Try
                    the Google Maps search or zoom out in the map.
                  </p>
                )}
              {supplierQuery.isError && (
                <p role="alert" className="mt-3 text-sm text-destructive">
                  The OpenStreetMap search service is unavailable. Use the
                  Google Maps search above or try again later.
                </p>
              )}
              {(supplierQuery.isError || supplierQuery.data?.length === 0) && (
                <iframe
                  title={`Google Maps fertilizer supplier search near ${searchCenter.label}`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    `fertilizer supplier near ${searchCenter.latitude},${searchCenter.longitude}`,
                  )}&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="mt-4 h-[360px] w-full rounded-2xl border border-border"
                />
              )}
              {supplierPlaces.length > 0 && (
                <ol className="mt-4 grid gap-3 sm:grid-cols-2">
                  {supplierPlaces.slice(0, 8).map((place) => (
                    <li key={place.id} className="rounded-2xl bg-muted p-4">
                      <p className="font-bold">{place.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {place.category} ·{" "}
                        {distanceInKilometers(searchCenter, place).toFixed(1)}{" "}
                        km away
                      </p>
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${place.latitude}&mlon=${place.longitude}#map=16/${place.latitude}/${place.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex min-h-9 items-center text-sm font-semibold text-primary hover:underline"
                      >
                        View listing
                      </a>
                    </li>
                  ))}
                </ol>
              )}
            </>
          )}
        </section>
        <p className="pb-6 pt-3 text-center text-xs text-muted-foreground">
          Map tiles © OpenStreetMap contributors. NASA POWER and OpenStreetMap
          data are provided by third parties. Your selected coordinates are
          shared with these services to request local weather and supplier data;
          verify important field and supplier information locally.
        </p>
      </div>
    </>
  );
}

function MapPlaceholder({ message }: { message: string }) {
  return (
    <div className="grid h-[min(68vh,680px)] min-h-[360px] place-items-center bg-muted text-sm text-muted-foreground">
      {message}
    </div>
  );
}
