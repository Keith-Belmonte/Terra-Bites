import { useMemo } from "react";
import { useFarm } from "@/components/providers/farm-context.tsx";
import { useFarmWeather } from "@/hooks/use-farm-weather.ts";
import { useNasaGeosForecast } from "@/hooks/use-nasa-geos-forecast.ts";
import { CROPS } from "@/lib/crops.ts";
import {
  DEFAULT_SOIL,
  rankCrops,
  selectRegionalCropOptions,
  type RecommendInputs,
  type ScoredCrop,
} from "@/lib/recommend.ts";

/** Ranks the catalog against the selected field, its soil details, and live forecast. */
export function useRecommendations(): {
  ranked: ScoredCrop[];
  regionalOptions: ScoredCrop[];
  byId: Map<string, ScoredCrop>;
  inputs: RecommendInputs | null;
  soilSource: "test" | "estimate";
  forecastSource: "NASA GEOS-CF" | "Open-Meteo" | null;
} {
  const { location, soilTest, priorities, irrigation } = useFarm();
  const weather = useFarmWeather();
  const nasaForecast = useNasaGeosForecast();

  return useMemo(() => {
    const nasaDays = nasaForecast.data?.days ?? [];
    const nasaClimate =
      nasaDays.length > 0
        ? {
            avgTemp:
              nasaDays.reduce(
                (sum, day) =>
                  sum + (day.minimumTemperatureC + day.maximumTemperatureC) / 2,
                0,
              ) / nasaDays.length,
            rainOutlook7d:
              (nasaDays.reduce((sum, day) => sum + day.precipitationMm, 0) /
                nasaDays.length) *
              7,
            source: "NASA GEOS-CF" as const,
          }
        : null;
    const meteoDays = weather.data?.daily;
    const meteoClimate =
      meteoDays && meteoDays.temperature_2m_max.length > 0
        ? {
            avgTemp:
              meteoDays.temperature_2m_max.reduce(
                (sum, value, index) =>
                  sum + (value + meteoDays.temperature_2m_min[index]!) / 2,
                0,
              ) / meteoDays.temperature_2m_max.length,
            rainOutlook7d: meteoDays.precipitation_sum.reduce(
              (sum, value) => sum + value,
              0,
            ),
            source: "Open-Meteo" as const,
          }
        : null;
    const forecastClimate = nasaClimate ?? meteoClimate;
    if (!location || !forecastClimate) {
      return {
        ranked: [],
        regionalOptions: [],
        byId: new Map<string, ScoredCrop>(),
        inputs: null,
        soilSource: soilTest ? "test" : "estimate",
        forecastSource: null,
      };
    }

    const soilReadings = weather.data?.hourly.soil_moisture_0_to_7cm ?? [];
    const recentSoilReadings = soilReadings
      .slice(0, 24)
      .filter((value): value is number => value !== null);
    const climate = {
      avgTemp: forecastClimate.avgTemp,
      rainOutlook7d: forecastClimate.rainOutlook7d,
      soilMoisture:
        recentSoilReadings.length > 0
          ? (recentSoilReadings.reduce((sum, value) => sum + value, 0) /
              recentSoilReadings.length) *
            100
          : null,
    };
    const inputs: RecommendInputs = {
      soil: soilTest ?? DEFAULT_SOIL,
      climate,
      priorities,
      irrigation,
    };
    const ranked = rankCrops(CROPS, inputs);
    return {
      ranked,
      regionalOptions: selectRegionalCropOptions(ranked),
      byId: new Map(ranked.map((result) => [result.crop.id, result])),
      inputs,
      soilSource: soilTest ? "test" : "estimate",
      forecastSource: forecastClimate.source,
    };
  }, [
    location,
    weather.data,
    nasaForecast.data,
    soilTest,
    priorities,
    irrigation,
  ]);
}
