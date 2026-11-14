import type { FarmLocation } from "@/lib/mock/conditions.ts";
import type { MonthlyClimateSummary } from "@/lib/nasa-power.ts";
import type { SoilInfo } from "@/lib/recommend.ts";

export type ClimateLayer =
  "rainfall" | "humidity" | "temperature" | "soil-ph" | "fertility" | "crops";

export type MapStation = {
  location: FarmLocation;
  climate?: MonthlyClimateSummary;
  soil?: SoilInfo;
};

export function getMapStationValue(
  station: MapStation,
  layer: ClimateLayer,
  monthIndex: number,
): { value: string; color: string } {
  const month = station.climate?.months[monthIndex];
  if (layer === "soil-ph") {
    const soil = station.soil ?? station.location.soil;
    const ph = soil.ph;
    return {
      value: `${ph.toFixed(1)} pH · ${station.soil ? "your field record" : "regional soil survey"}`,
      color: ph < 5.5 ? "#d97706" : ph > 7.5 ? "#dc2626" : "#15803d",
    };
  }
  if (layer === "fertility") {
    const fertility = (station.soil ?? station.location.soil).fertility;
    return {
      value: `${fertility} · ${station.soil ? "your field record" : "regional soil survey"}`,
      color:
        fertility === "High"
          ? "#15803d"
          : fertility === "Moderate"
            ? "#d97706"
            : "#dc2626",
    };
  }
  if (layer === "crops") {
    return {
      value: `${station.location.profile.mainCrops.join(", ")} · local crop reference`,
      color: "#15803d",
    };
  }
  if (!month) return { value: "Monthly data unavailable", color: "#64748b" };
  if (layer === "rainfall") {
    return {
      value: `${month.rainfallMm} mm typical monthly rainfall`,
      color:
        month.rainfallMm >= 200
          ? "#2563eb"
          : month.rainfallMm >= 100
            ? "#0891b2"
            : "#d97706",
    };
  }
  if (layer === "humidity") {
    return {
      value: `${month.relativeHumidity}% relative humidity`,
      color:
        month.relativeHumidity >= 85
          ? "#2563eb"
          : month.relativeHumidity >= 70
            ? "#0891b2"
            : "#d97706",
    };
  }
  return {
    value: `${month.temperatureC} °C average temperature`,
    color:
      month.temperatureC >= 30
        ? "#dc2626"
        : month.temperatureC >= 25
          ? "#d97706"
          : "#2563eb",
  };
}
