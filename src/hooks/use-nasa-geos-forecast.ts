import { useQuery } from "@tanstack/react-query";
import { useFarm } from "@/components/providers/farm-context.tsx";
import { getNasaGeosForecast } from "@/lib/farm-api.ts";

export function useNasaGeosForecast() {
  const { location } = useFarm();
  return useQuery({
    queryKey: ["nasa-geos-forecast", location?.lat, location?.lng],
    queryFn: () =>
      getNasaGeosForecast({
        data: {
          latitude: location!.lat,
          longitude: location!.lng,
        },
      }),
    enabled: location !== null,
    staleTime: 6 * 60 * 60 * 1000,
    retry: false,
  });
}
