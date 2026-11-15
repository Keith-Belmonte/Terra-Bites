import { createServerFn } from "@tanstack/react-start";
import { auth } from "@clerk/tanstack-react-start/server";
import { env } from "cloudflare:workers";
import { z } from "zod";
import { summarizeNasaGeosForecast } from "@/lib/nasa-geos-forecast.ts";
import { summarizeNasaPowerResponse } from "@/lib/nasa-power.ts";

const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const weatherSchema = z.object({
  current: z.object({
    time: z.string(),
    temperature_2m: z.number(),
    relative_humidity_2m: z.number(),
    apparent_temperature: z.number(),
    precipitation: z.number(),
    weather_code: z.number(),
    wind_speed_10m: z.number(),
  }),
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: z.array(z.number()),
    relative_humidity_2m: z.array(z.number()),
    precipitation: z.array(z.number()),
    soil_moisture_0_to_7cm: z.array(z.number().nullable()).optional(),
    shortwave_radiation: z.array(z.number()),
  }),
  daily: z.object({
    time: z.array(z.string()),
    precipitation_sum: z.array(z.number()),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
  }),
});

export type FarmWeather = z.infer<typeof weatherSchema>;
export type WeatherPoint = { label: string; value: number; compare?: number };
export type WeatherMetric = "temperature" | "rainfall" | "soil-moisture";

async function fetchWeather(url: URL): Promise<FarmWeather> {
  const response = await fetch(url, { signal: AbortSignal.timeout(12_000) });
  if (!response.ok) {
    throw new Error(`Weather service returned HTTP ${response.status}.`);
  }
  const result = weatherSchema.safeParse(await response.json());
  if (!result.success) {
    throw new Error("Weather service returned data in an unexpected format.");
  }
  return result.data;
}

export const getFarmWeather = createServerFn({ method: "GET" })
  .validator(coordinatesSchema)
  .handler(async ({ data }) => {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.search = new URLSearchParams({
      latitude: String(data.latitude),
      longitude: String(data.longitude),
      current:
        "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",
      hourly:
        "temperature_2m,relative_humidity_2m,precipitation,soil_moisture_0_to_7cm,shortwave_radiation",
      daily: "precipitation_sum,temperature_2m_max,temperature_2m_min",
      forecast_days: "7",
      timezone: "auto",
    }).toString();
    return fetchWeather(url);
  });

export const getNasaPowerSummary = createServerFn({ method: "GET" })
  .validator(coordinatesSchema)
  .handler(async ({ data }) => {
    const end = new Date(Date.now() - 3 * 86_400_000);
    const start = new Date(end.getTime() - 6 * 86_400_000);
    const formatDate = (date: Date) =>
      date.toISOString().slice(0, 10).replaceAll("-", "");
    const url = new URL("https://power.larc.nasa.gov/api/temporal/daily/point");
    url.search = new URLSearchParams({
      parameters: "ALLSKY_SFC_SW_DWN,PRECTOTCORR,T2M",
      community: "AG",
      longitude: String(data.longitude),
      latitude: String(data.latitude),
      start: formatDate(start),
      end: formatDate(end),
      "time-standard": "UTC",
      format: "JSON",
    }).toString();

    const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!response.ok) {
      throw new Error(`NASA POWER returned HTTP ${response.status}.`);
    }
    return summarizeNasaPowerResponse(await response.json());
  });

export const getNasaGeosForecast = createServerFn({ method: "GET" })
  .validator(coordinatesSchema)
  .handler(async ({ data }) => {
    const latitudeIndex = Math.round((data.latitude + 90) * 4);
    const normalizedLongitude =
      ((((data.longitude + 180) % 360) + 360) % 360) - 180;
    const longitudeIndex = Math.round((normalizedLongitude + 180) * 4) % 1440;
    const baseUrl =
      "https://opendap.nccs.nasa.gov/dods/gmao/geos-cf/v2/fcst/met_tavg_1hr_glo_L1440x721_slv.latest.ascii";
    const url = new URL(baseUrl);
    url.search = [
      `t[0:1:119][0][${latitudeIndex}][${longitudeIndex}]`,
      `tprec[0:1:119][${latitudeIndex}][${longitudeIndex}]`,
      "time[0:1:119]",
    ].join(",");

    const response = await fetch(url, {
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      throw new Error(`NASA GEOS-CF returned HTTP ${response.status}.`);
    }
    const forecast = summarizeNasaGeosForecast(await response.text());
    const days = forecast.days.filter(
      (day) => Date.parse(day.startsAt) + 86_400_000 > Date.now(),
    );
    if (days.length === 0) {
      throw new Error("NASA GEOS-CF has no future forecast periods available.");
    }
    return { ...forecast, days };
  });

export const getWeatherHistory = createServerFn({ method: "GET" })
  .validator(
    coordinatesSchema.extend({
      startDate: z.iso.date(),
      endDate: z.iso.date(),
      metric: z.enum(["temperature", "rainfall", "soil-moisture"]),
    }),
  )
  .handler(async ({ data }) => {
    if (data.startDate > data.endDate) {
      throw new Error("The start date must be on or before the end date.");
    }
    const rangeDays =
      (Date.parse(`${data.endDate}T00:00:00Z`) -
        Date.parse(`${data.startDate}T00:00:00Z`)) /
      86_400_000;
    const latestAvailableDate = new Date(Date.now() - 5 * 86_400_000)
      .toISOString()
      .slice(0, 10);
    const earliestAvailableDate = new Date(Date.now() - 97 * 86_400_000)
      .toISOString()
      .slice(0, 10);
    if (
      rangeDays > 91 ||
      data.startDate < earliestAvailableDate ||
      data.endDate > latestAvailableDate
    ) {
      throw new Error(
        `Choose a date range within the last 92 days ending on or before ${latestAvailableDate}.`,
      );
    }

    const url = new URL("https://archive-api.open-meteo.com/v1/archive");
    const hourlyByMetric: Record<WeatherMetric, string> = {
      temperature: "temperature_2m",
      rainfall: "precipitation",
      "soil-moisture": "soil_moisture_0_to_7cm",
    };
    url.search = new URLSearchParams({
      latitude: String(data.latitude),
      longitude: String(data.longitude),
      start_date: data.startDate,
      end_date: data.endDate,
      hourly: hourlyByMetric[data.metric],
      timezone: "auto",
    }).toString();
    const response = await fetch(url, { signal: AbortSignal.timeout(12_000) });
    if (!response.ok) {
      throw new Error(
        `Historical weather service returned HTTP ${response.status}.`,
      );
    }

    const result = z
      .object({
        hourly: z.object({
          time: z.array(z.string()),
          temperature_2m: z.array(z.number().nullable()).optional(),
          precipitation: z.array(z.number().nullable()).optional(),
          soil_moisture_0_to_7cm: z.array(z.number().nullable()).optional(),
        }),
      })
      .safeParse(await response.json());
    if (!result.success) {
      throw new Error(
        "Historical weather service returned data in an unexpected format.",
      );
    }

    const values =
      data.metric === "temperature"
        ? result.data.hourly.temperature_2m
        : data.metric === "rainfall"
          ? result.data.hourly.precipitation
          : result.data.hourly.soil_moisture_0_to_7cm;
    if (!values) {
      throw new Error("The requested historical measurement is unavailable.");
    }

    const grouped = new Map<string, number[]>();
    for (const [index, time] of result.data.hourly.time.entries()) {
      const value = values[index];
      if (value === undefined || value === null) continue;
      const date = time.slice(0, 10);
      const valuesForDate = grouped.get(date) ?? [];
      valuesForDate.push(value);
      grouped.set(date, valuesForDate);
    }

    return [...grouped].map(([date, dailyValues]) => ({
      label: date,
      value:
        data.metric === "rainfall"
          ? dailyValues.reduce((sum, value) => sum + value, 0)
          : dailyValues.reduce((sum, value) => sum + value, 0) /
            dailyValues.length,
    }));
  });

const assistantInput = z.object({
  prompt: z.string().trim().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        text: z.string().max(4000),
      }),
    )
    .max(12),
  location: coordinatesSchema.nullable(),
  weather: z
    .object({
      temperature: z.number(),
      humidity: z.number(),
      rainfall: z.number(),
      forecastRainfall: z.number(),
    })
    .nullable(),
  nasaPower: z
    .object({
      averageTemperatureC: z.number(),
      totalPrecipitationMm: z.number(),
      averageSolarRadiationMjM2Day: z.number(),
      startDate: z.iso.date(),
      endDate: z.iso.date(),
      days: z.number().int().positive(),
    })
    .nullable(),
});

export const askFarmAssistant = createServerFn({ method: "POST" })
  .validator(assistantInput)
  .handler(async ({ data }) => {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Sign in to use the AI farming assistant.");
    }

    const context = [
      data.location
        ? `Farm coordinates: ${data.location.latitude}, ${data.location.longitude}.`
        : "The farmer has not set a farm location.",
      data.weather
        ? `Current conditions from Open-Meteo: ${data.weather.temperature}°C, ${data.weather.humidity}% relative humidity, ${data.weather.rainfall} mm current precipitation, ${data.weather.forecastRainfall} mm forecast precipitation over the next 7 days.`
        : "No live weather data is available for this conversation.",
      data.nasaPower
        ? `NASA POWER daily gridded agroclimatology data for ${data.nasaPower.startDate} through ${data.nasaPower.endDate} (${data.nasaPower.days} complete days): mean 2 m air temperature ${data.nasaPower.averageTemperatureC.toFixed(1)}°C, total corrected precipitation ${data.nasaPower.totalPrecipitationMm.toFixed(1)} mm, and mean all-sky surface solar radiation ${data.nasaPower.averageSolarRadiationMjM2Day.toFixed(1)} MJ/m²/day. These are gridded satellite/model estimates, not farm sensor measurements or vegetation-index readings.`
        : "NASA POWER readings are unavailable for this conversation.",
    ].join(" ");
    const messages = data.history.slice(-10).map(({ role, text }) => ({
      role,
      content: text,
    }));
    messages.push({ role: "user", content: data.prompt });

    const response = await env.AI.run(
      "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      {
        messages: [
          {
            role: "system",
            content: `You are TerraBites' agricultural assistant. Give practical, cautious advice. Distinguish measured weather from estimates; never claim to have satellite, soil-test, pest-report, or market data that was not provided. Ask for the crop and field details when needed. Do not invent forecasts, local warnings, or precise yield outcomes. Encourage local agricultural extension advice for pesticide, disease, or safety-critical decisions. Context: ${context}`,
          },
          ...messages,
        ],
        max_tokens: 700,
        temperature: 0.4,
      },
    );
    const result = z.object({ response: z.string() }).safeParse(response);
    if (!result.success) {
      throw new Error("The AI service returned an unexpected response.");
    }
    const answer = result.data.response.trim();
    if (!answer) {
      throw new Error(
        "The AI service returned an empty answer. Please try again.",
      );
    }
    return { answer };
  });

export const searchFarmLocations = createServerFn({ method: "GET" })
  .validator(z.object({ query: z.string().trim().min(2).max(100) }))
  .handler(async ({ data }) => {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.search = new URLSearchParams({
      name: data.query,
      count: "8",
      language: "en",
      format: "json",
    }).toString();
    const response = await fetch(url, { signal: AbortSignal.timeout(12_000) });
    if (!response.ok) {
      throw new Error(`Location search returned HTTP ${response.status}.`);
    }
    const result = z
      .object({
        results: z
          .array(
            z.object({
              id: z.number(),
              name: z.string(),
              admin1: z.string().optional(),
              country: z.string(),
              latitude: z.number(),
              longitude: z.number(),
            }),
          )
          .optional(),
      })
      .safeParse(await response.json());
    if (!result.success) {
      throw new Error(
        "Location service returned data in an unexpected format.",
      );
    }
    return result.data.results ?? [];
  });
