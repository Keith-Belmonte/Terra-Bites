<<<<<<< HEAD
import {
  adaptPowerDailyResponse,
  type NormalizedObservation,
} from "@/lib/agronomy-data.ts";

type NasaPowerCoordinates = {
  latitude: number;
  longitude: number;
};

export type MonthlyClimate = {
  month: number;
  rainfallMm: number;
  temperatureC: number;
  relativeHumidity: number;
};

export type MonthlyClimateSummary = {
  startYear: number;
  endYear: number;
  months: MonthlyClimate[];
};

function formatApiDate(date: Date): string {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("");
}

function getLatestAvailableDate(payload: unknown): string | null {
  if (
    typeof payload !== "object" ||
    payload === null ||
    Array.isArray(payload)
  ) {
    return null;
  }
  const properties = (payload as Record<string, unknown>).properties;
  if (typeof properties !== "object" || properties === null) return null;
  const parameters = (properties as Record<string, unknown>).parameter;
  if (typeof parameters !== "object" || parameters === null) return null;

  const dates = Object.values(parameters as Record<string, unknown>)
    .flatMap((parameter) => {
      if (typeof parameter !== "object" || parameter === null) return [];
      return Object.entries(parameter as Record<string, unknown>)
        .filter(
          ([date, value]) =>
            /^\d{8}$/.test(date) &&
            typeof value === "number" &&
            Number.isFinite(value) &&
            value !== -999,
        )
        .map(([date]) => date);
    })
    .sort();
  return dates.at(-1) ?? null;
}

function getMonthlyParameter(
  payload: unknown,
  parameterName: string,
): Record<string, unknown> {
  if (
    typeof payload !== "object" ||
    payload === null ||
    Array.isArray(payload)
  ) {
    throw new Error("NASA POWER monthly response is not an object.");
  }
  const properties = (payload as Record<string, unknown>).properties;
  if (typeof properties !== "object" || properties === null) {
    throw new Error("NASA POWER monthly response is missing properties.");
  }
  const parameters = (properties as Record<string, unknown>).parameter;
  if (typeof parameters !== "object" || parameters === null) {
    throw new Error(
      "NASA POWER monthly response is missing properties.parameter.",
    );
  }
  const parameter = (parameters as Record<string, unknown>)[parameterName];
  if (typeof parameter !== "object" || parameter === null) {
    throw new Error(`NASA POWER monthly response is missing ${parameterName}.`);
  }
  return parameter as Record<string, unknown>;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function monthlyValues(
  parameter: Record<string, unknown>,
  month: number,
  startYear: number,
  endYear: number,
): Array<{ year: number; value: number }> {
  const suffix = String(month).padStart(2, "0");
  return Object.entries(parameter)
    .filter(([date, value]) => {
      if (!/^\d{6}$/.test(date) || typeof value !== "number") return false;
      const year = Number(date.slice(0, 4));
      return (
        date.slice(4) === suffix &&
        year >= startYear &&
        year <= endYear &&
        Number.isFinite(value) &&
        value !== -999
      );
    })
    .map(([date, value]) => ({
      year: Number(date.slice(0, 4)),
      value: value as number,
    }));
}

/**
 * Fetch a 10-year monthly climate baseline from NASA POWER.
 * NASA reports monthly precipitation as a daily average (mm/day); this
 * converts each month's yearly value to a monthly total before averaging.
 */
export async function fetchNasaPowerMonthlyClimatology(
  { latitude, longitude }: NasaPowerCoordinates,
  signal?: AbortSignal,
  now = new Date(),
): Promise<MonthlyClimateSummary> {
  const endYear = now.getUTCFullYear() - 1;
  const startYear = endYear - 9;
  const params = new URLSearchParams({
    parameters: "PRECTOTCORR,T2M,RH2M",
    community: "AG",
    longitude: String(longitude),
    latitude: String(latitude),
    start: String(startYear),
    end: String(endYear),
    format: "JSON",
  });
  const response = await fetch(
    `https://power.larc.nasa.gov/api/temporal/monthly/point?${params}`,
    { headers: { Accept: "application/json" }, signal },
  );
  if (!response.ok) {
    throw new Error(
      `NASA POWER monthly request failed with status ${response.status}.`,
    );
  }

  const payload: unknown = await response.json();
  const rainfall = getMonthlyParameter(payload, "PRECTOTCORR");
  const temperature = getMonthlyParameter(payload, "T2M");
  const humidity = getMonthlyParameter(payload, "RH2M");
  const months: MonthlyClimate[] = [];

  for (let month = 1; month <= 12; month += 1) {
    const rainfallByYear = monthlyValues(
      rainfall,
      month,
      startYear,
      endYear,
    ).map(({ year, value }) => ({
      year,
      total: value * new Date(Date.UTC(year, month, 0)).getUTCDate(),
    }));
    const rainfallTotal = average(rainfallByYear.map(({ total }) => total));
    const temperatureAverage = average(
      monthlyValues(temperature, month, startYear, endYear).map(
        ({ value }) => value,
      ),
    );
    const humidityAverage = average(
      monthlyValues(humidity, month, startYear, endYear).map(
        ({ value }) => value,
      ),
    );

    if (
      rainfallTotal === null ||
      temperatureAverage === null ||
      humidityAverage === null
    ) {
      throw new Error(
        `NASA POWER monthly response has incomplete data for month ${month}.`,
      );
    }
    months.push({
      month,
      rainfallMm: Number(rainfallTotal.toFixed(1)),
      temperatureC: Number(temperatureAverage.toFixed(1)),
      relativeHumidity: Number(humidityAverage.toFixed(1)),
    });
  }

  return { startYear, endYear, months };
}

/** Fetch the latest NASA POWER daily point data for a coordinate. */
export async function fetchNasaPowerObservations(
  { latitude, longitude }: NasaPowerCoordinates,
  signal?: AbortSignal,
  now = new Date(),
): Promise<NormalizedObservation[]> {
  const endDate = new Date(now);
  endDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCDate(endDate.getUTCDate() - 3);
  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - 6);

  const params = new URLSearchParams({
    parameters: "T2M,RH2M,PRECTOTCORR,GWETTOP",
    community: "AG",
    longitude: String(longitude),
    latitude: String(latitude),
    start: formatApiDate(startDate),
    end: formatApiDate(endDate),
    format: "JSON",
  });
  const response = await fetch(
    `https://power.larc.nasa.gov/api/temporal/daily/point?${params}`,
    { headers: { Accept: "application/json" }, signal },
  );
  if (!response.ok) {
    throw new Error(
      `NASA POWER request failed with status ${response.status}.`,
    );
  }

  const payload: unknown = await response.json();
  const latestDate = getLatestAvailableDate(payload);
  const observedAt = latestDate
    ? new Date(
        Date.UTC(
          Number(latestDate.slice(0, 4)),
          Number(latestDate.slice(4, 6)) - 1,
          Number(latestDate.slice(6, 8)),
        ),
      ).toISOString()
    : endDate.toISOString();

  return adaptPowerDailyResponse(payload, observedAt);
=======
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
>>>>>>> main
}
