import { useQuery } from "@tanstack/react-query";
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
    staleTime: 6 * 60 * 60 * 1000,
    retry: 1,
  });
}
