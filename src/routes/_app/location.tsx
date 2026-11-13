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
