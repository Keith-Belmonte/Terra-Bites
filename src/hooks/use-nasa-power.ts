import { useQuery } from "@tanstack/react-query";
<<<<<<< HEAD
import { fetchNasaPowerObservations } from "@/lib/nasa-power.ts";

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
=======
import { getNasaPowerSummary } from "@/lib/farm-api.ts";
import { useFarm } from "@/components/providers/farm-context.tsx";

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
>>>>>>> main
    staleTime: 6 * 60 * 60 * 1000,
    retry: 1,
  });
}
