export type NasaGeosForecastDay = {
  date: string;
  startsAt: string;
  minimumTemperatureC: number;
  maximumTemperatureC: number;
  precipitationMm: number;
};

export type NasaGeosForecast = {
  generatedAt: string;
  days: NasaGeosForecastDay[];
};

function readSeries(response: string, name: "t" | "tprec"): number[] {
  const section = response.match(
    new RegExp(
      `(?:^|\\n)${name},\\s*\\[\\d+\\](?:\\[\\d+\\])*\\s*\\r?\\n([\\s\\S]*?)(?=\\r?\\n[a-zA-Z][a-zA-Z0-9_]*,\\s*\\[|$)`,
    ),
  )?.[1];
  if (!section) {
    throw new Error(`NASA GEOS-CF forecast is missing the ${name} series.`);
  }

  const values = [
    ...section.matchAll(
      /^\[\d+\](?:\[\d+\])*,\s*(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*$/gim,
    ),
  ].map((match) => Number(match[1]));
  if (values.length === 0 || values.some((value) => !Number.isFinite(value))) {
    throw new Error(`NASA GEOS-CF forecast returned invalid ${name} values.`);
  }
  return values;
}

function readTimes(response: string): number[] {
  const values = response.match(/(?:^|\n)time,\s*\[(\d+)\]\s*\r?\n([^\r\n]+)/);
  if (!values?.[2]) {
    throw new Error("NASA GEOS-CF forecast is missing its time values.");
  }

  const times = values[2].split(",").map((value) => Number(value.trim()));
  if (
    times.length !== Number(values[1]) ||
    times.some((value) => !Number.isFinite(value))
  ) {
    throw new Error("NASA GEOS-CF forecast returned invalid time values.");
  }
  return times;
}

function fromNasaTime(daysSinceYearOne: number): Date {
  return new Date((daysSinceYearOne - 719164) * 86_400_000);
}

export function summarizeNasaGeosForecast(response: string): NasaGeosForecast {
  const temperatures = readSeries(response, "t");
  const precipitationFluxes = readSeries(response, "tprec");
  const times = readTimes(response);

  if (
    temperatures.length !== precipitationFluxes.length ||
    temperatures.length !== times.length ||
    temperatures.length < 24
  ) {
    throw new Error("NASA GEOS-CF forecast returned incomplete hourly data.");
  }

  const days: NasaGeosForecastDay[] = [];
  for (let offset = 0; offset + 24 <= times.length; offset += 24) {
    const temperaturesC = temperatures
      .slice(offset, offset + 24)
      .map((temperature) => temperature - 273.15);
    const precipitationMm = precipitationFluxes
      .slice(offset, offset + 24)
      .reduce((total, flux) => total + flux * 3600, 0);
    const date = fromNasaTime(times[offset]!);

    if (
      temperaturesC.some(
        (value) => !Number.isFinite(value) || Math.abs(value) > 100,
      ) ||
      precipitationFluxes
        .slice(offset, offset + 24)
        .some(
          (value) => !Number.isFinite(value) || value < 0 || value > 1e14,
        ) ||
      !Number.isFinite(precipitationMm) ||
      Number.isNaN(date.getTime())
    ) {
      throw new Error("NASA GEOS-CF forecast returned invalid daily values.");
    }

    days.push({
      date: date.toISOString().slice(0, 10),
      startsAt: date.toISOString(),
      minimumTemperatureC: Math.min(...temperaturesC),
      maximumTemperatureC: Math.max(...temperaturesC),
      precipitationMm,
    });
  }

  if (days.length === 0) {
    throw new Error(
      "NASA GEOS-CF forecast contains no complete forecast days.",
    );
  }

  return {
    generatedAt: fromNasaTime(times[0]!).toISOString(),
    days,
  };
}
