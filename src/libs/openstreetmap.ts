export type MapCoordinates = {
  latitude: number;
  longitude: number;
};

export type FertilizerPlace = MapCoordinates & {
  id: string;
  name: string;
  category: string;
};

type OverpassElement = {
  type?: unknown;
  id?: unknown;
  lat?: unknown;
  lon?: unknown;
  center?: { lat?: unknown; lon?: unknown };
  tags?: Record<string, unknown>;
};

function isCoordinate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function parseFertilizerPlaces(payload: unknown): FertilizerPlace[] {
  const elements = record(payload)?.elements;
  if (!Array.isArray(elements)) {
    throw new Error("OpenStreetMap response is missing its elements list.");
  }

  const places = new Map<string, FertilizerPlace>();
  for (const candidate of elements) {
    const element = candidate as OverpassElement;
    if (
      (element.type !== "node" &&
        element.type !== "way" &&
        element.type !== "relation") ||
      typeof element.id !== "number" ||
      !Number.isInteger(element.id)
    ) {
      continue;
    }

    const latitude = isCoordinate(element.lat)
      ? element.lat
      : element.center?.lat;
    const longitude = isCoordinate(element.lon)
      ? element.lon
      : element.center?.lon;
    if (!isCoordinate(latitude) || !isCoordinate(longitude)) continue;

    const tags = element.tags ?? {};
    const shop = typeof tags.shop === "string" ? tags.shop : "";
    const name = typeof tags.name === "string" ? tags.name.trim() : "";
    const industrial =
      typeof tags.industrial === "string" ? tags.industrial : "";
    const isAgriculturalShop = shop === "agrarian";
    const isFertilizerPlace =
      /fertiliz|fertilis/i.test(`${name} ${industrial}`) ||
      /agri|farm supply|farm supplies/i.test(name);
    if (!isAgriculturalShop && !isFertilizerPlace) continue;

    const key = `${element.type}/${element.id}`;
    places.set(key, {
      id: key,
      name: name || "Agricultural supply shop",
      category:
        industrial ||
        (isAgriculturalShop
          ? "Agricultural supply shop"
          : "Fertilizer listing"),
      latitude,
      longitude,
    });
  }

  return [...places.values()];
}

export function distanceInKilometers(
  from: MapCoordinates,
  to: MapCoordinates,
): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function searchFertilizerPlaces(
  { latitude, longitude }: MapCoordinates,
  signal?: AbortSignal,
): Promise<FertilizerPlace[]> {
  const radiusMeters = 25_000;
  const around = `around:${radiusMeters},${latitude},${longitude}`;
  const query = [
    "[out:json][timeout:25];",
    "(",
    `nwr(${around})["shop"="agrarian"];`,
    `nwr(${around})["name"~"fertiliz|fertilis|agri|farm supply|farm supplies",i];`,
    `nwr(${around})["industrial"~"fertiliz|fertilis",i];`,
    ");",
    "out center 40;",
  ].join("");
  const params = new URLSearchParams({ data: query });
  const response = await fetch(
    `https://overpass-api.de/api/interpreter?${params}`,
    { headers: { Accept: "application/json" }, signal },
  );
  if (!response.ok) {
    throw new Error(
      `OpenStreetMap supplier search failed with status ${response.status}.`,
    );
  }
  return parseFertilizerPlaces(await response.json());
}
