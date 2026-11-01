import { describe, expect, it } from "vitest";
import { CROPS, getCrop } from "@/lib/mock/crops.ts";
import { rankCrops, scoreCrop, type RecommendInputs } from "@/lib/recommend.ts";

const BASE: RecommendInputs = {
  soil: { type: "Clay loam", ph: 6.2, drainage: "Poor", fertility: "Moderate" },
  climate: { season: "Dry season", avgTemp: 29, rainOutlook30d: 42, soilMoisture: 34, humidity: 78 },
  priorities: { profit: 1, lowCost: 1, waterSaving: 1, quickHarvest: 1, lowRisk: 1 },
  irrigation: true,
};

const crop = (id: string) => {
  const c = getCrop(id);
  if (!c) throw new Error(`missing crop ${id}`);
  return c;
};

describe("recommendation engine", () => {
  it("keeps every score between 0 and 99", () => {
    for (const r of rankCrops(CROPS, BASE)) {
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(99);
    }
  });

  it("ranks crops from highest to lowest score", () => {
    const scores = rankCrops(CROPS, BASE).map((r) => r.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it("penalises soil pH outside the crop's range", () => {
    const ok = scoreCrop(crop("rice"), BASE);
    const acid = scoreCrop(crop("rice"), { ...BASE, soil: { ...BASE.soil, ph: 4.5 } });
    expect(acid.breakdown.soil).toBeLessThan(ok.breakdown.soil);
    expect(acid.reasons.some((r) => r.kind === "warn" && r.text.includes("acidic"))).toBe(true);
  });

  it("lowers water-hungry crops when rain-fed in a dry spell", () => {
    const irrigated = scoreCrop(crop("rice"), BASE);
    const rainFed = scoreCrop(crop("rice"), { ...BASE, irrigation: false });
    expect(rainFed.breakdown.climate).toBeLessThan(irrigated.breakdown.climate);
  });

  it("follows the farmer's priorities", () => {
    const quick: RecommendInputs = {
      ...BASE,
      priorities: { profit: 0, lowCost: 0, waterSaving: 0, quickHarvest: 2, lowRisk: 0 },
    };
    // Mung bean is a short crop, onion a long one
    expect(scoreCrop(crop("mung-bean"), quick).breakdown.priorities).toBeGreaterThan(
      scoreCrop(crop("onion"), quick).breakdown.priorities,
    );
  });

  it("uses a neutral priority score when nothing is selected", () => {
    const none: RecommendInputs = {
      ...BASE,
      priorities: { profit: 0, lowCost: 0, waterSaving: 0, quickHarvest: 0, lowRisk: 0 },
    };
    expect(scoreCrop(crop("corn"), none).breakdown.priorities).toBe(70);
  });
});
