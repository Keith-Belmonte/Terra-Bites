import { describe, expect, it } from "vitest";
import { summarizeNasaGeosForecast } from "@/lib/nasa-geos-forecast.ts";

function makeForecastResponse(): string {
  const start = 739933.3958333334;
  const temperatures = Array.from({ length: 48 }, (_, index) =>
    index < 24 ? 300 + (index % 4) : 290 + (index % 5),
  );
  const precipitation = Array.from({ length: 48 }, (_, index) =>
    index < 24 ? 0.001 : 0.002,
  );
  const times = Array.from({ length: 48 }, (_, index) => start + index / 24);
  const rows = (values: number[]) =>
    values.map((value, index) => `[${index}][0][0], ${value}`).join("\n");

  return [
    `t, [48][1][1][1]\n${rows(temperatures)}`,
    `tprec, [48][1][1]\n${rows(precipitation)}`,
    `time, [48]\n${times.join(", ")}`,
  ].join("\n");
}

describe("NASA GEOS-CF forecast summaries", () => {
  it("summarizes hourly temperatures and precipitation in 24-hour forecast blocks", () => {
    const forecast = summarizeNasaGeosForecast(makeForecastResponse());

    expect(forecast.generatedAt).toBe("2026-11-12T09:30:00.000Z");
    expect(forecast.days).toHaveLength(2);
    expect(forecast.days[0]?.date).toBe("2026-11-12");
    expect(forecast.days[0]?.startsAt).toBe("2026-11-12T09:30:00.000Z");
    expect(forecast.days[0]?.minimumTemperatureC).toBeCloseTo(26.85);
    expect(forecast.days[0]?.maximumTemperatureC).toBeCloseTo(29.85);
    expect(forecast.days[0]?.precipitationMm).toBeCloseTo(86.4);
    expect(forecast.days[1]?.precipitationMm).toBeCloseTo(172.8);
  });

  it("rejects incomplete or malformed forecast data", () => {
    expect(() => summarizeNasaGeosForecast("")).toThrow("missing the t series");
    expect(() =>
      summarizeNasaGeosForecast(
        "t, [1][1][1][1]\n[0][0][0], 300\ntime, [1]\n739933.4\ntprec, [1][1][1]\n[0][0], 0",
      ),
    ).toThrow("incomplete hourly data");
  });
});
