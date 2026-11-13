import { z } from "zod";

const nasaPowerSchema = z.object({
  properties: z.object({
    parameter: z.object({
      ALLSKY_SFC_SW_DWN: z.record(z.string(), z.number()),
      PRECTOTCORR: z.record(z.string(), z.number()),
      T2M: z.record(z.string(), z.number()),
    }),
  }),
});

export type NasaPowerSummary = {
  averageTemperatureC: number;
  totalPrecipitationMm: number;
  averageSolarRadiationMjM2Day: number;
  startDate: string;
  endDate: string;
  days: number;
};

function toIsoDate(date: string): string {
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
}

export function summarizeNasaPowerResponse(input: unknown): NasaPowerSummary {
  const result = nasaPowerSchema.safeParse(input);
  if (!result.success) {
    throw new Error("NASA POWER returned data in an unexpected format.");
  }

  const { ALLSKY_SFC_SW_DWN, PRECTOTCORR, T2M } =
    result.data.properties.parameter;
  const readings = Object.keys(T2M)
    .sort()
    .flatMap((date) => {
      const temperature = T2M[date];
      const precipitation = PRECTOTCORR[date];
      const solarRadiation = ALLSKY_SFC_SW_DWN[date];
      if (
        temperature === undefined ||
        precipitation === undefined ||
        solarRadiation === undefined ||
        temperature === -999 ||
        precipitation === -999 ||
        solarRadiation === -999
      ) {
        return [];
      }
      return [{ date, temperature, precipitation, solarRadiation }];
    });

  if (readings.length === 0) {
    throw new Error(
      "NASA POWER has no complete daily readings for this location yet.",
    );
  }

  return {
    averageTemperatureC:
      readings.reduce((sum, reading) => sum + reading.temperature, 0) /
      readings.length,
    totalPrecipitationMm: readings.reduce(
      (sum, reading) => sum + reading.precipitation,
      0,
    ),
    averageSolarRadiationMjM2Day:
      readings.reduce((sum, reading) => sum + reading.solarRadiation, 0) /
      readings.length,
    startDate: toIsoDate(readings[0]!.date),
    endDate: toIsoDate(readings.at(-1)!.date),
    days: readings.length,
  };
}
