import { describe, expect, test } from "vitest";
import { LOCATIONS } from "@/lib/mock/conditions.ts";
import { getMapStationValue } from "@/lib/map-layer.ts";

describe("map layer values", () => {
  test("uses current selected month for climate layers", () => {
    const station = {
      location: LOCATIONS[0],
      climate: {
        startYear: 2016,
        endYear: 2025,
        months: [
          {
            month: 1,
            rainfallMm: 230,
            temperatureC: 28,
            relativeHumidity: 82,
          },
        ],
      },
    };

    expect(getMapStationValue(station, "rainfall", 0)).toEqual({
      value: "230 mm typical monthly rainfall",
      color: "#2563eb",
    });
    expect(getMapStationValue(station, "rainfall", 1).value).toBe(
      "Monthly data unavailable",
    );
  });

  test("identifies soil survey values as regional estimates", () => {
    const station = { location: LOCATIONS[0] };

    expect(getMapStationValue(station, "soil-ph", 0).value).toBe(
      "6.2 pH · regional soil survey",
    );
    expect(getMapStationValue(station, "fertility", 0).value).toBe(
      "Moderate · regional soil survey",
    );
    expect(getMapStationValue(station, "crops", 0).value).toContain(
      "local crop reference",
    );
  });
});
