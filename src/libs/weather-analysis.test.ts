import { describe, expect, it } from "vitest";
import type { FarmWeather } from "@/lib/farm-api.ts";
import { analyzeWeatherAlerts } from "@/lib/weather-analysis.ts";

const weather: FarmWeather = {
  current: {
    time: "2026-11-12T10:00",
    temperature_2m: 29,
    relative_humidity_2m: 70,
    apparent_temperature: 32,
    precipitation: 0,
    weather_code: 1,
    wind_speed_10m: 12,
  },
  hourly: {
    time: [],
    temperature_2m: [],
    relative_humidity_2m: [],
    precipitation: [],
    soil_moisture_0_to_7cm: [],
    shortwave_radiation: [],
  },
  daily: {
    time: ["2026-11-12"],
    precipitation_sum: [0],
    temperature_2m_max: [30],
    temperature_2m_min: [22],
  },
};

describe("forecast signal analysis", () => {
  it("does not create warnings when forecast thresholds are not met", () => {
    expect(analyzeWeatherAlerts(weather)).toEqual([]);
  });

  it("reports only signals supported by current forecast values", () => {
    const alerts = analyzeWeatherAlerts({
      ...weather,
      current: { ...weather.current, weather_code: 95, wind_speed_10m: 52 },
      daily: {
        ...weather.daily,
        precipitation_sum: [55],
        temperature_2m_max: [39],
      },
    });

    expect(alerts.map(({ id }) => id)).toEqual([
      "thunderstorm",
      "wind",
      "rain-2026-11-12",
      "heat-2026-11-12",
    ]);
    expect(alerts.every((alert) => alert.severity === "high")).toBe(true);
  });
});
