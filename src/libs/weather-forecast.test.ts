import { afterEach, describe, expect, test, vi } from "vitest";
import { fetchWeatherForecast } from "@/lib/weather-forecast.ts";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Open-Meteo forecast", () => {
  test("requests and normalizes the selected forecast window", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          daily: {
            time: ["2026-11-14", "2026-11-15", "2026-11-16"],
            temperature_2m_min: [23, 24, 22],
            temperature_2m_max: [31, 32, 30],
            precipitation_sum: [0, 5.2, 1],
            precipitation_probability_max: [0, 60, 25],
            wind_speed_10m_max: [12, 18, 8],
          },
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const days = await fetchWeatherForecast(
      { latitude: 13.1, longitude: 123.7 },
      3,
    );

    const requestUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(requestUrl.searchParams.get("forecast_days")).toBe("3");
    expect(requestUrl.searchParams.get("timezone")).toBe("auto");
    expect(requestUrl.searchParams.get("temperature_unit")).toBe("celsius");
    expect(requestUrl.searchParams.get("wind_speed_unit")).toBe("kmh");
    expect(requestUrl.searchParams.get("precipitation_unit")).toBe("mm");
    expect(days).toHaveLength(3);
    expect(days[1]).toEqual({
      date: "2026-11-15",
      minTempC: 24,
      maxTempC: 32,
      rainfallMm: 5.2,
      rainProbability: 60,
      maxWindKmh: 18,
    });
  });

  test("rejects invalid coordinates and incomplete provider responses", async () => {
    await expect(
      fetchWeatherForecast({ latitude: 91, longitude: 123 }, 3),
    ).rejects.toThrow("outside valid latitude/longitude ranges");

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ daily: {} }), { status: 200 }),
        ),
    );
    await expect(
      fetchWeatherForecast({ latitude: 13, longitude: 123 }, 1),
    ).rejects.toThrow("missing daily.time");
  });
});
