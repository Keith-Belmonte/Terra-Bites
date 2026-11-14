import { useQuery } from "@tanstack/react-query";
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
    staleTime: 6 * 60 * 60 * 1000,
    retry: 1,
  });
}
