import { afterEach, describe, expect, test, vi } from "vitest";
import {
  fetchNasaPowerMonthlyClimatology,
  fetchNasaPowerObservations,
  summarizeNasaPowerResponse,
} from "@/lib/nasa-power.ts";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("NASA POWER daily summaries", () => {
  test("summarizes complete readings and skips fill values", () => {
    const summary = summarizeNasaPowerResponse({
      properties: {
        parameter: {
          T2M: { "20261101": 20, "20261102": -999, "20261103": 24 },
          PRECTOTCORR: { "20261101": 2, "20261102": 10, "20261103": 4 },
          ALLSKY_SFC_SW_DWN: {
            "20261101": 15,
            "20261102": 16,
            "20261103": 21,
          },
        },
      },
    });

    expect(summary).toEqual({
      averageTemperatureC: 22,
      totalPrecipitationMm: 6,
      averageSolarRadiationMjM2Day: 18,
      startDate: "2026-11-01",
      endDate: "2026-11-03",
      days: 2,
    });
  });

  test("reports when there are no complete readings", () => {
    expect(() =>
      summarizeNasaPowerResponse({
        properties: {
          parameter: {
            T2M: { "20261101": -999 },
            PRECTOTCORR: { "20261101": -999 },
            ALLSKY_SFC_SW_DWN: { "20261101": -999 },
          },
        },
      }),
    ).toThrow("NASA POWER has no complete daily readings");
  });
});

describe("NASA POWER daily API", () => {
  test("requests recent NASA metrics and returns observations through the latest available day", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          properties: {
            parameter: {
              T2M: { "20261103": 28, "20261104": 30 },
              RH2M: { "20261103": 70, "20261104": 80 },
              PRECTOTCORR: { "20261103": 2, "20261104": 4 },
              GWETTOP: { "20261103": 0.6, "20261104": 0.8 },
            },
          },
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const observations = await fetchNasaPowerObservations(
      { latitude: 15.4865, longitude: 120.9667 },
      undefined,
      new Date("2026-11-07T13:00:00.000Z"),
    );

    const requestUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(requestUrl.searchParams.get("parameters")).toBe(
      "T2M,RH2M,PRECTOTCORR,GWETTOP",
    );
    expect(requestUrl.searchParams.get("start")).toBe("20261029");
    expect(requestUrl.searchParams.get("end")).toBe("20261104");
    expect(requestUrl.searchParams.get("latitude")).toBe("15.4865");
    expect(observations.map(({ metric }) => metric)).toEqual([
      "airTemperature",
      "rainfall",
      "relativeHumidity",
      "surfaceWetness",
    ]);
    expect(
      observations.every(
        ({ observedAt }) => observedAt === "2026-11-04T00:00:00.000Z",
      ),
    ).toBe(true);
  });

  describe("NASA POWER monthly climate API", () => {
    test("averages monthly daily rainfall into seasonal totals", async () => {
      const monthlyKeys = Array.from({ length: 12 }, (_, index) => {
        const month = String(index + 1).padStart(2, "0");
        return [`2024${month}`, `2025${month}`] as const;
      }).flat();
      const parameterValues = (value: number) =>
        Object.fromEntries(
          monthlyKeys.map((date, index) => [
            date,
            index % 2 === 0 ? value : value + 2,
          ]),
        );
      const rainfallValues = parameterValues(2);
      rainfallValues["202402"] = 2;
      rainfallValues["202502"] = 4;
      rainfallValues["202413"] = 999;
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            properties: {
              parameter: {
                PRECTOTCORR: rainfallValues,
                T2M: parameterValues(24),
                RH2M: parameterValues(70),
              },
            },
          }),
          { status: 200 },
        ),
      );
      vi.stubGlobal("fetch", fetchMock);

      const summary = await fetchNasaPowerMonthlyClimatology(
        { latitude: 13.1, longitude: 123.7 },
        undefined,
        new Date("2026-11-07T13:00:00.000Z"),
      );

      const requestUrl = new URL(fetchMock.mock.calls[0][0]);
      expect(requestUrl.searchParams.get("parameters")).toBe(
        "PRECTOTCORR,T2M,RH2M",
      );
      expect(requestUrl.searchParams.get("start")).toBe("2016");
      expect(requestUrl.searchParams.get("end")).toBe("2025");
      expect(summary.months).toHaveLength(12);
      expect(summary.months[1]).toEqual({
        month: 2,
        rainfallMm: 85,
        temperatureC: 25,
        relativeHumidity: 71,
      });
    });

    test("surfaces incomplete monthly data instead of returning a partial map", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          new Response(
            JSON.stringify({
              properties: {
                parameter: {
                  PRECTOTCORR: { "202501": 1 },
                  T2M: { "202501": 25 },
                  RH2M: { "202501": 80 },
                },
              },
            }),
            { status: 200 },
          ),
        ),
      );

      await expect(
        fetchNasaPowerMonthlyClimatology(
          { latitude: 13, longitude: 123 },
          undefined,
          new Date("2026-11-07T13:00:00.000Z"),
        ),
      ).rejects.toThrow("incomplete data for month 2");
    });
  });

  test("surfaces NASA POWER HTTP failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 503 })),
    );

    await expect(
      fetchNasaPowerObservations(
        { latitude: 15, longitude: 120 },
        undefined,
        new Date("2026-11-07T13:00:00.000Z"),
      ),
    ).rejects.toThrow("NASA POWER request failed with status 503");
  });
});
