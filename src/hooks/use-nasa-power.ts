import { useQuery } from "@tanstack/react-query";
import { fetchNasaPowerObservations } from "@/lib/nasa-power.ts";
import { getNasaPowerSummary } from "@/lib/farm-api.ts";
import { useFarm } from "@/components/providers/farm-context.tsx";

export function useNasaPowerObservations(
  latitude: number,
  longitude: number,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["nasa-power-daily", latitude, longitude],
    queryFn: ({ signal }) =>
      fetchNasaPowerObservations({ latitude, longitude }, signal),
    enabled,
    staleTime: 6 * 60 * 60 * 1000,
    retry: 1,
  });
}

export function useNasaPower() {
  const { location } = useFarm();
  return useQuery({
    queryKey: ["nasa-power", location?.lat, location?.lng],
    queryFn: () =>
      getNasaPowerSummary({
        data: {
          latitude: location!.lat,
          longitude: location!.lng,
        },
      }),
    enabled: location !== null,
    staleTime: 6 * 60 * 60 * 1000,
    retry: 1,
  });
}
