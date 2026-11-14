export type ForecastCoordinates = {
  latitude: number;
  longitude: number;
};

export type ForecastDay = {
  date: string;
  minTempC: number | null;
  maxTempC: number | null;
  rainfallMm: number | null;
  rainProbability: number | null;
  maxWindKmh: number | null;
};

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function nullableNumberAt(
  values: unknown[],
  index: number,
  name: string,
): number | null {
  const value = values[index];
  if (value === null || value === undefined) return null;
  if (!isFiniteNumber(value)) {
    throw new Error(`Open-Meteo forecast has an invalid ${name} value.`);
  }
  return value;
}

function arrayAt(values: Record<string, unknown>, key: string): unknown[] {
  const value = values[key];
  if (!Array.isArray(value)) {
    throw new Error(`Open-Meteo forecast is missing daily.${key}.`);
  }
  return value;
}

export async function fetchWeatherForecast(
  { latitude, longitude }: ForecastCoordinates,
  forecastDays: 1 | 3 | 7,
  signal?: AbortSignal,
): Promise<ForecastDay[]> {
  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error(
      "Forecast coordinates are outside valid latitude/longitude ranges.",
    );
  }

  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily:
      "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max",
    forecast_days: String(forecastDays),
    timezone: "auto",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
  });
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    { headers: { Accept: "application/json" }, signal },
  );
  if (!response.ok) {
    throw new Error(
      `Open-Meteo forecast request failed with status ${response.status}.`,
    );
  }

  const daily = record(record(await response.json())?.daily);
  if (!daily) {
    throw new Error("Open-Meteo response is missing daily forecast data.");
  }
  const dates = arrayAt(daily, "time");
  const minTemperatures = arrayAt(daily, "temperature_2m_min");
  const maxTemperatures = arrayAt(daily, "temperature_2m_max");
  const rainfall = arrayAt(daily, "precipitation_sum");
  const rainProbability = arrayAt(daily, "precipitation_probability_max");
  const wind = arrayAt(daily, "wind_speed_10m_max");
  if (dates.length < forecastDays) {
    throw new Error("Open-Meteo returned fewer days than requested.");
  }

  return dates.slice(0, forecastDays).map((date, index) => {
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error("Open-Meteo returned an invalid forecast date.");
    }
    return {
      date,
      minTempC: nullableNumberAt(minTemperatures, index, "minimum temperature"),
      maxTempC: nullableNumberAt(maxTemperatures, index, "maximum temperature"),
      rainfallMm: nullableNumberAt(rainfall, index, "rainfall"),
      rainProbability: nullableNumberAt(
        rainProbability,
        index,
        "rain probability",
      ),
      maxWindKmh: nullableNumberAt(wind, index, "wind speed"),
    };
  });
}
