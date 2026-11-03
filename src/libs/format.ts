import { LOCATIONS, type FarmLocation } from "@/lib/mock/conditions.ts";
import type { Units } from "@/components/providers/farm-context.tsx";

export function getLocation(id: string): FarmLocation {
  return LOCATIONS.find((l) => l.id === id) ?? LOCATIONS[0];
}

export function formatCoords(lat: number, lng: number): string {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}° ${ns}, ${Math.abs(lng).toFixed(4)}° ${ew}`;
}

export function formatTemp(celsius: number, units: Units) {
  return units === "metric"
    ? { value: `${Math.round(celsius)}`, unit: "°C" }
    : { value: `${Math.round((celsius * 9) / 5 + 32)}`, unit: "°F" };
}

export function formatRain(mm: number, units: Units) {
  return units === "metric"
    ? { value: mm.toFixed(1), unit: "mm" }
    : { value: (mm / 25.4).toFixed(2), unit: "in" };
}

export function formatArea(hectares: number, units: Units): string {
  return units === "metric"
    ? `${hectares} ha`
    : `${(hectares * 2.471).toFixed(1)} acres`;
}
