import { useQuery } from "@tanstack/react-query";
import { getFarmWeather } from "@/lib/farm-api.ts";
import { useFarm } from "@/components/providers/farm-context.tsx";

export function useFarmWeather() {
  const { location } = useFarm();
  return useQuery({
    queryKey: ["farm-weather", location?.lat, location?.lng],
    queryFn: () =>
      getFarmWeather({
        data: {
          latitude: location!.lat,
          longitude: location!.lng,
        },
      }),
    enabled: location !== null,
    staleTime: 15 * 60 * 1000,
    retry: 1,
  });
}

export function weatherDescription(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code === 45 || code === 48) return "Fog";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  return "Thunderstorms";
}

export function dailyRainfall(weather: {
  daily: { precipitation_sum: number[] };
}): number {
  return weather.daily.precipitation_sum.reduce((sum, amount) => sum + amount, 0);
}
