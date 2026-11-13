import { describe, expect, it } from "vitest";
import { summarizeNasaPowerResponse } from "@/lib/nasa-power.ts";

describe("NASA POWER daily summaries", () => {
  it("summarizes complete readings and skips fill values", () => {
    const summary = summarizeNasaPowerResponse({
      properties: {
        parameter: {
          T2M: { "20261101": 20, "20261102": -999, "20261103": 24 },
          PRECTOTCORR: { "20261101": 2, "20261102": 10, "20261103": 4 },
          ALLSKY_SFC_SW_DWN: { "20261101": 15, "20261102": 16, "20261103": 21 },
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

  it("reports when there are no complete readings", () => {
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
