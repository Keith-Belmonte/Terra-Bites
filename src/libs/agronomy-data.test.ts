import { describe, expect, test } from "vitest";
import {
  adaptModisObservation,
  adaptObservationsToAlerts,
  adaptObservationsToConditions,
  adaptPowerDailyResponse,
  adaptRegionalSample,
  adaptSmapObservation,
  buildAgronomyInsight,
} from "@/lib/agronomy-data.ts";
import { LOCATIONS } from "@/lib/mock/conditions.ts";

const OBSERVED_AT = "2026-11-06T00:00:00.000Z";

describe("provider observation adapters", () => {
  test("normalizes NASA POWER daily metrics and ignores missing-data sentinels", () => {
    const observations = adaptPowerDailyResponse(
      {
        properties: {
          parameter: {
            T2M: { "20261101": 28, "20261102": 30 },
            PRECTOTCORR: { "20261101": 4.2, "20261102": -999 },
            RH2M: { "20261101": 75, "20261102": 85 },
          },
        },
      },
      OBSERVED_AT,
    );

    expect(observations).toEqual([
      {
        metric: "airTemperature",
        value: 29,
        unit: "°C",
        source: "NASA POWER",
        quality: "observed",
        observedAt: OBSERVED_AT,
      },
      {
        metric: "rainfall",
        value: 4.2,
        unit: "mm",
        source: "NASA POWER",
        quality: "observed",
        observedAt: OBSERVED_AT,
      },
      {
        metric: "relativeHumidity",
        value: 80,
        unit: "%",
        source: "NASA POWER",
        quality: "observed",
        observedAt: OBSERVED_AT,
      },
    ]);
  });

  test("normalizes NASA POWER modeled surface soil wetness as an index", () => {
    const observations = adaptPowerDailyResponse(
      { properties: { parameter: { GWETTOP: { "20261104": 0.73 } } } },
      OBSERVED_AT,
    );

    expect(observations).toMatchObject([
      {
        metric: "surfaceWetness",
        value: 0.73,
        unit: "index",
        source: "NASA POWER",
        quality: "observed",
        observedAt: OBSERVED_AT,
      },
    ]);
    expect(adaptObservationsToConditions(observations)).toMatchObject([
      {
        label: "Topsoil wetness index",
        value: "0.73",
        unit: "index",
        status: "info",
      },
    ]);
  });

  test("rejects malformed or empty NASA POWER payloads instead of inventing defaults", () => {
    expect(() => adaptPowerDailyResponse({}, OBSERVED_AT)).toThrow(
      "NASA POWER response is missing properties.parameter",
    );
    expect(() =>
      adaptPowerDailyResponse(
        { properties: { parameter: { T2M: { "20261101": -999 } } } },
        OBSERVED_AT,
      ),
    ).toThrow("contains no usable daily measurements");
  });

  test("normalizes SMAP volumetric water content to percent", () => {
    expect(
      adaptSmapObservation(
        { soil_moisture: 0.347, unit: "m3/m3" },
        OBSERVED_AT,
      ),
    ).toMatchObject({
      metric: "soilMoisture",
      value: 34.7,
      unit: "%",
      source: "NASA SMAP",
      quality: "observed",
    });
  });

  test("normalizes MODIS scaled NDVI and rejects out-of-range values", () => {
    expect(adaptModisObservation({ ndvi: 6800 }, OBSERVED_AT)).toMatchObject({
      metric: "ndvi",
      value: 0.68,
      unit: "index",
      source: "NASA MODIS",
    });
    expect(() => adaptModisObservation({ ndvi: 15000 }, OBSERVED_AT)).toThrow(
      "NASA MODIS raw NDVI",
    );
    expect(() => adaptModisObservation({ ndvi: -3000 }, OBSERVED_AT)).toThrow(
      "NASA MODIS raw NDVI",
    );
  });
});

describe("dashboard data adapters", () => {
  test("labels regional values as samples and adapts available metrics for UI", () => {
    const observations = adaptRegionalSample(LOCATIONS[0]);
    const conditions = adaptObservationsToConditions(observations);

    expect(
      observations.every((observation) => observation.quality === "sample"),
    ).toBe(true);
    expect(conditions.map((condition) => condition.key)).toEqual([
      "temperature",
      "rainfall",
      "soil",
      "humidity",
    ]);
    expect(conditions[1].detail).toContain("Regional sample");
    expect(conditions[1].value).toBe("42");
  });

  test("creates alerts and insight from measured values only", () => {
    const observations = [
      adaptSmapObservation({ soil_moisture: 0.18, unit: "m3/m3" }, OBSERVED_AT),
      ...adaptRegionalSample(LOCATIONS[0]).filter(
        (observation) => observation.metric === "rainfallOutlook30d",
      ),
    ];

    const alerts = adaptObservationsToAlerts(observations);
    expect(alerts.map((alert) => alert.id)).toEqual([
      "soil-moisture-low",
      "rainfall-low",
    ]);
    expect(buildAgronomyInsight(observations).title).toBe(
      "Soil moisture is low",
    );
  });

  test("does not interpret historical provider rainfall as a rainfall forecast", () => {
    const observations = adaptPowerDailyResponse(
      {
        properties: {
          parameter: { PRECTOTCORR: { "20261101": 10 } },
        },
      },
      OBSERVED_AT,
    );

    expect(adaptObservationsToAlerts(observations)).toEqual([]);
  });

  test("provides an explicit empty-data insight instead of a success-shaped fallback", () => {
    expect(buildAgronomyInsight([])).toEqual({
      title: "More field data needed",
      detail:
        "Add soil and climate observations to see crop-specific guidance.",
    });
  });
});
