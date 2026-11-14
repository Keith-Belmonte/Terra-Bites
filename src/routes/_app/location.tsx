import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckIcon, CrosshairIcon, MapPinIcon, SearchIcon } from "lucide-react";
import ScreenHeader from "@/components/ui/screen-header.tsx";
import FarmLocationMap from "@/components/location/farm-location-map.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { useFarm } from "@/components/providers/farm-context.tsx";
import { searchFarmLocations } from "@/lib/farm-api.ts";
import { formatCoords } from "@/lib/format.ts";
import { useFarmWeather } from "@/hooks/use-farm-weather.ts";

export const Route = createFileRoute("/_app/location")({
  head: () => ({ meta: [{ title: "Farm Location | TerraBites" }] }),
  component: LocationScreen,
});

function formatPreciseCoordinates(latitude: number, longitude: number): string {
  const northSouth = latitude >= 0 ? "N" : "S";
  const eastWest = longitude >= 0 ? "E" : "W";
  return `${Math.abs(latitude).toFixed(6)}° ${northSouth}, ${Math.abs(longitude).toFixed(6)}° ${eastWest}`;
}

function LocationScreen() {
  const { location, setFarmLocation, gps, requestLocation } = useFarm();
  const weather = useFarmWeather();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Awaited<ReturnType<typeof searchFarmLocations>>>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coordinateError, setCoordinateError] = useState<string | null>(null);

  const selectCoordinates = (
    latitude: number,
    longitude: number,
    source: "map" | "coordinates",
  ) => {
    setFarmLocation({
      id: `${source}:${latitude.toFixed(6)},${longitude.toFixed(6)}`,
      city: source === "map" ? "Farm pin" : "Farm coordinates",
      province: "",
      country: "",
      lat: latitude,
      lng: longitude,
      source,
    });
    setCoordinateError(null);
  };

  const search = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setError("Enter at least two characters to search for a place.");
      return;
    }
    setSearching(true);
    setError(null);
    try {
      const response = await searchFarmLocations({ data: { query: trimmed } });
      setResults(response);
      if (response.length === 0) setError("No matching places found.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Location search failed.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <>
      <ScreenHeader title="Farm location" subtitle="Set the field for local weather and crop analysis" backTo="/home" />
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 pt-4 md:px-8">
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
              <CrosshairIcon className="size-6" />
            </span>
            <div className="flex-1">
              <h2 className="font-serif text-xl font-semibold">Use this device&apos;s location</h2>
              <p className="pt-1 text-sm text-muted-foreground">
                Your browser asks permission before sharing coordinates. The location is saved in this browser.
              </p>
              <Button
                size="lg"
                className="mt-4 h-12 rounded-xl font-bold"
                onClick={requestLocation}
                disabled={gps === "locating"}
              >
                {gps === "locating" ? <Spinner /> : <CrosshairIcon />}
                {gps === "locating" ? "Finding location…" : "Use current location"}
              </Button>
              {gps === "denied" && (
                <p role="status" className="pt-3 text-sm text-destructive">
                  Browser location is unavailable or permission was denied. Search for a place below instead.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <h2 className="font-serif text-xl font-semibold">Search for a town or city</h2>
          <p className="pt-1 text-sm text-muted-foreground">
            Results and coordinates are provided by Open-Meteo Geocoding.
          </p>
          <form onSubmit={search} className="flex gap-2 pt-4">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="City, town, or village"
              aria-label="Search for a location"
              className="h-12 rounded-xl"
            />
            <Button type="submit" className="h-12 rounded-xl px-4 font-bold" disabled={searching}>
              {searching ? <Spinner /> : <SearchIcon />}
              Search
            </Button>
          </form>
          {error && <p role="alert" className="pt-3 text-sm text-destructive">{error}</p>}
          {results.length > 0 && (
            <div className="flex flex-col gap-2 pt-4">
              {results.map((result) => (
                <button
                  type="button"
                  key={result.id}
                  onClick={() => {
                    setFarmLocation({
                      id: String(result.id),
                      city: result.name,
                      province: result.admin1 ?? "",
                      country: result.country,
                      lat: result.latitude,
                      lng: result.longitude,
                      source: "search",
                    });
                    setResults([]);
                  }}
                  className="flex min-h-14 items-center gap-3 rounded-2xl border border-border px-4 text-left hover:bg-muted"
                >
                  <MapPinIcon className="size-5 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{result.name}</span>
                    <span className="block text-sm text-muted-foreground">
                      {[result.admin1, result.country].filter(Boolean).join(", ")}
                    </span>
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatCoords(result.latitude, result.longitude)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="p-5">
            <h2 className="font-serif text-xl font-semibold">Pin your exact farm location</h2>
            <p className="pt-1 text-sm text-muted-foreground">
              Search for a nearby town first, then click the map to move the pin. You can also enter
              coordinates directly.
            </p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-border">
              <FarmLocationMap
                latitude={location?.lat ?? null}
                longitude={location?.lng ?? null}
                onSelect={(latitude, longitude) => selectCoordinates(latitude, longitude, "map")}
              />
            </div>
            <form
              key={location ? `${location.lat},${location.lng}` : "no-location"}
              className="grid gap-3 pt-4 sm:grid-cols-[1fr_1fr_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const latitudeText = String(formData.get("latitude") ?? "").trim();
                const longitudeText = String(formData.get("longitude") ?? "").trim();
                const latitude = Number(latitudeText);
                const longitude = Number(longitudeText);
                if (
                  !latitudeText ||
                  !longitudeText ||
                  !Number.isFinite(latitude) ||
                  !Number.isFinite(longitude) ||
                  latitude < -90 ||
                  latitude > 90 ||
                  longitude < -180 ||
                  longitude > 180
                ) {
                  setCoordinateError("Enter a valid latitude (-90 to 90) and longitude (-180 to 180).");
                  return;
                }
                selectCoordinates(latitude, longitude, "coordinates");
              }}
            >
              <label className="flex flex-col gap-1 text-sm font-medium">
                Latitude
                <Input
                  type="number"
                  name="latitude"
                  step="any"
                  min="-90"
                  max="90"
                  defaultValue={location?.lat ?? ""}
                  placeholder="e.g. 14.5995"
                  required
                  className="h-11 rounded-xl font-mono"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium">
                Longitude
                <Input
                  type="number"
                  name="longitude"
                  step="any"
                  min="-180"
                  max="180"
                  defaultValue={location?.lng ?? ""}
                  placeholder="e.g. 120.9842"
                  required
                  className="h-11 rounded-xl font-mono"
                />
              </label>
              <Button type="submit" className="h-11 self-end rounded-xl font-bold">
                Set coordinates
              </Button>
            </form>
            {coordinateError && (
              <p role="alert" className="pt-2 text-sm text-destructive">{coordinateError}</p>
            )}
          </div>
        </section>

        {location && (
          <section className="rounded-3xl border border-border bg-card shadow-sm">
            <div className="p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-primary">
                <CheckIcon className="size-4" /> Active farm location
              </p>
              <h2 className="pt-2 font-serif text-2xl font-semibold">
                {location.city}{location.province ? `, ${location.province}` : ""}
              </h2>
              <p className="pt-1 font-mono text-sm text-muted-foreground">
                {formatPreciseCoordinates(location.lat, location.lng)}
              </p>
              <p className="pt-2 text-sm text-muted-foreground">
                {location.source === "search"
                  ? "Showing the center of the selected place. Click the map or enter coordinates to refine the field location."
                  : location.source === "gps" && location.accuracy !== undefined
                    ? `GPS-reported accuracy: about ${Math.round(location.accuracy)} m.`
                    : location.source === "map"
                      ? "Map pin selected. Actual field boundaries may require more precise surveying."
                      : location.source === "coordinates"
                        ? "Coordinates entered manually."
                        : "Weather and recommendations use this selected point."}
              </p>
              <p className="pt-3 text-xs text-muted-foreground">
                Weather and recommendations use Open-Meteo data for this point.
                {weather.dataUpdatedAt
                  ? ` Updated ${new Date(weather.dataUpdatedAt).toLocaleString()}.`
                  : ""}
              </p>
              {weather.error && (
                <p role="alert" className="pt-2 text-sm text-destructive">
                  Weather could not be loaded: {weather.error.message}
                </p>
              )}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
<<<<<<< HEAD

function PermissionPrompt() {
  const { requestLocation, denyLocation } = useFarm();
  return (
    <section className="flex flex-col items-center rounded-3xl border border-border bg-card px-6 py-10 text-center shadow-sm">
      <span className="relative grid size-24 place-items-center">
        <motion.span
          className="absolute inset-0 rounded-full bg-primary/20"
          animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
        />
        <span className="grid size-20 place-items-center rounded-full bg-primary text-primary-foreground">
          <LocateFixedIcon className="size-9" />
        </span>
      </span>
      <h2 className="pt-6 font-serif text-3xl font-semibold text-balance">
        Allow location access
      </h2>
      <p className="max-w-md pt-2 text-muted-foreground">
        TerraBites uses your GPS position to pull NASA data for your exact field:
        your soil, rainfall and climate. Advice for your field, not the whole
        country.
      </p>
      <ul className="flex flex-col gap-2 pt-5 text-left text-sm">
        {[
          "Crop picks matched to your soil and climate",
          "Alerts for weather and pests near you",
          "Your location stays on your device",
        ].map((t) => (
          <li key={t} className="flex items-center gap-2">
            <CheckIcon className="size-4 text-primary" /> {t}
          </li>
        ))}
      </ul>
      <div className="flex w-full max-w-sm flex-col gap-3 pt-8">
        <Button
          size="lg"
          className="h-14 rounded-2xl text-base font-bold"
          onClick={requestLocation}
        >
          <MapPinIcon className="size-5" />
          Allow location
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="h-12 rounded-2xl font-bold"
          onClick={denyLocation}
        >
          Not now
        </Button>
      </div>
    </section>
  );
}

function DeniedFallback() {
  const { requestLocation, setLocationId, locationId } = useFarm();
  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-3xl border border-destructive/30 bg-destructive/8 p-6">
        <span className="grid size-14 place-items-center rounded-2xl bg-destructive text-white">
          <MapPinOffIcon className="size-7" />
        </span>
        <h2 className="pt-4 font-serif text-2xl font-semibold">
          Location access is off
        </h2>
        <p className="pt-1 text-foreground/80">
          Without GPS, we can't match data to your exact field. To turn it on,
          open your browser or phone settings, find this site, and set Location
          to "Allow". Then tap Check again.
        </p>
        <Button
          size="lg"
          className="mt-5 h-12 rounded-2xl font-bold"
          onClick={requestLocation}
        >
          <CrosshairIcon className="size-5" />
          Check again
        </Button>
      </section>
      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="font-bold">Or choose your area</h2>
        <p className="text-sm text-muted-foreground">
          Pick the closest town to get regional advice.
        </p>
        <div className="flex flex-col gap-2 pt-3">
          {LOCATIONS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLocationId(l.id)}
              aria-pressed={l.id === locationId}
              className={cn(
                "flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border px-4 text-left transition-colors",
                l.id === locationId
                  ? "border-primary bg-secondary"
                  : "border-border hover:bg-muted",
              )}
            >
              <MapPinIcon className="size-5 shrink-0 text-primary" />
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{l.city}</span>
                <span className="block text-sm text-muted-foreground">
                  {l.province}, {l.region}
                </span>
              </span>
              {l.id === locationId && <CheckIcon className="size-5 text-primary" />}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function LocationDetails() {
  const { gps, locatedAt, requestLocation, locationId, setLocationId, deviceLocation } = useFarm();
  const loc = getLocation(locationId);
  const locating = gps === "locating";

  const rows = [
    {
      label: "Region / province",
      value: deviceLocation
        ? deviceLocation.region ?? deviceLocation.country ?? "GPS location"
        : loc.region,
    },
    {
      label: "City / municipality",
      value: deviceLocation ? deviceLocation.city ?? "GPS location" : loc.city,
    },
    { label: "Country", value: deviceLocation?.country ?? loc.country },
    {
      label: "Coordinates",
      value: deviceLocation
        ? formatCoords(deviceLocation.latitude, deviceLocation.longitude)
        : formatCoords(loc.lat, loc.lng),
      mono: true,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Map placeholder */}
      <section className="relative h-72 overflow-hidden rounded-3xl border border-border bg-muted shadow-sm md:h-80">
        <img
          src={MAP_IMAGE}
          alt={`Satellite view around ${deviceLocation?.city ?? (deviceLocation ? "your location" : loc.city)}`}
          className={cn("size-full object-cover transition-all duration-700", locating && "scale-110 blur-[2px]")}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,oklch(0_0_0/0.35))]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
          <motion.div
            key={`${loc.id}-${locatedAt ?? ""}`}
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex flex-col items-center"
          >
            <span className="rounded-full bg-card px-3 py-1 text-xs font-bold text-card-foreground shadow-md">
              {deviceLocation?.city ?? (deviceLocation ? "Your location" : loc.city)}
            </span>
            <MapPinIcon className="size-12 fill-primary text-primary-foreground drop-shadow-lg" strokeWidth={1.5} />
          </motion.div>
        </div>
        <span className="absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 bg-white/10" />
        {locating && (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-black/55 py-3 text-sm font-semibold text-white">
            <Spinner /> Finding your location…
          </div>
        )}
        <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          <LayersIcon className="size-3.5" /> Satellite · map preview
        </span>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <dl className="grid grid-cols-2 gap-4">
          {rows.map((r) => (
            <div key={r.label} className={r.mono ? "col-span-2" : undefined}>
              <dt className="text-xs font-semibold text-muted-foreground">{r.label}</dt>
              <dd className={cn("font-bold", r.mono && "font-mono text-sm")}>{r.value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheckIcon className="size-4 text-primary" />
            {locatedAt
              ? `Updated ${formatDistanceToNow(new Date(locatedAt), { addSuffix: true })}`
              : "Accuracy ±12 m · sample location"}
          </p>
          <Button
            size="lg"
            className="h-12 rounded-2xl font-bold"
            onClick={requestLocation}
            disabled={locating}
          >
            {locating ? <Spinner /> : <CrosshairIcon className="size-5" />}
            Refresh Location
          </Button>
        </div>
      </section>

      {deviceLocation?.city && (
        <p className="text-xs text-muted-foreground">
          Place name © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">OpenStreetMap contributors</a>
        </p>
      )}

      <RegionalProfile />

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="font-bold">Try another sample area</h2>
        <div className="flex flex-wrap gap-2 pt-3">
          {LOCATIONS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLocationId(l.id)}
              aria-pressed={l.id === locationId}
              className={cn(
                "h-11 cursor-pointer rounded-full border px-4 text-sm font-bold transition-colors",
                l.id === locationId
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:bg-muted",
              )}
            >
              {l.city}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function RegionalProfile() {
  const { locationId } = useFarm();
  const { profile, elevation } = getLocation(locationId);
  const facts = [
    { icon: CloudSunIcon, label: "Climate", value: profile.climate },
    { icon: LayersIcon, label: "Soil", value: profile.soil },
    { icon: MountainIcon, label: "Elevation", value: elevation },
  ];
  return (
    <section className="rounded-3xl bg-secondary/70 p-5">
      <h2 className="font-serif text-xl font-semibold">Regional farming profile</h2>
      <p className="pt-2 leading-relaxed">{profile.summary}</p>
      <div className="grid gap-3 pt-4 sm:grid-cols-3">
        {facts.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl bg-card p-3">
            <Icon className="size-5 text-primary" />
            <p className="pt-1 text-xs font-semibold text-muted-foreground">{label}</p>
            <p className="text-sm font-bold">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 pt-3">
        <div className="rounded-2xl bg-card p-3">
          <p className="text-xs font-semibold text-muted-foreground">Wet season</p>
          <p className="text-sm font-bold">{profile.wetSeason}</p>
        </div>
        <div className="rounded-2xl bg-card p-3">
          <p className="text-xs font-semibold text-muted-foreground">Dry season</p>
          <p className="text-sm font-bold">{profile.drySeason}</p>
        </div>
      </div>
      <p className="pt-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">
        Main crops
      </p>
      <div className="flex flex-wrap gap-2 pt-2">
        {profile.mainCrops.map((c) => (
          <span
            key={c}
            className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-sm font-semibold"
          >
            <SproutIcon className="size-4 text-primary" /> {c}
          </span>
        ))}
      </div>
    </section>
  );
}
=======
>>>>>>> main
