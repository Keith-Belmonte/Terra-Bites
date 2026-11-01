import { useMemo } from "react";
import { useFarm } from "@/components/providers/farm-context.ts";
import { getLocation } from "@/lib/format.ts";
import { CROPS } from "@/lib/mock/crops.ts";
import { rankCrops, type RecommendInputs, type ScoredCrop } from "@/lib/recommend.ts";

/** Crops ranked for the current location, soil, climate and farmer priorities. */
export function useRecommendations(): {
  ranked: ScoredCrop[];
  byId: Map<string, ScoredCrop>;
  inputs: RecommendInputs;
  soilSource: "test" | "survey";
} {
  const { locationId, soilTest, priorities, irrigation } = useFarm();
  return useMemo(() => {
    const loc = getLocation(locationId);
    const inputs: RecommendInputs = {
      soil: soilTest ?? loc.soil,
      climate: loc.climate,
      priorities,
      irrigation,
    };
    const ranked = rankCrops(CROPS, inputs);
    return {
      ranked,
      byId: new Map(ranked.map((r) => [r.crop.id, r])),
      inputs,
      soilSource: soilTest ? "test" : "survey",
    };
  }, [locationId, soilTest, priorities, irrigation]);
}
