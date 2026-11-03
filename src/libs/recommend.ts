import type { Crop, Level } from "@/lib/mock/crops.ts";
import type { SoilType } from "@/lib/mock/crops.ts";

export type ClimateNow = {
  season: "Wet season" | "Dry season";
  avgTemp: number;
  rainOutlook30d: number;
  soilMoisture: number;
  humidity: number;
};

export type Drainage = "Poor" | "Moderate" | "Good";

export type SoilInfo = {
  type: SoilType;
  ph: number;
  drainage: Drainage;
  fertility: Level;
};

export type PriorityWeight = 0 | 1 | 2;

export type Priorities = {
  profit: PriorityWeight;
  lowCost: PriorityWeight;
  waterSaving: PriorityWeight;
  quickHarvest: PriorityWeight;
  lowRisk: PriorityWeight;
};

export const PRIORITY_KEYS = [
  "profit",
  "lowCost",
  "waterSaving",
  "quickHarvest",
  "lowRisk",
] as const satisfies readonly (keyof Priorities)[];

export const PRIORITY_META: Record<
  keyof Priorities,
  { label: string; hint: string }
> = {
  profit: { label: "Higher market value", hint: "Prioritize crops with stronger market value" },
  lowCost: { label: "Lower input cost", hint: "Prefer crops that need less investment" },
  waterSaving: { label: "Save water", hint: "Prefer drought-tolerant, low-water crops" },
  quickHarvest: { label: "Quick harvest", hint: "Prefer crops that mature sooner" },
  lowRisk: { label: "Lower risk", hint: "Prefer crops with fewer weather and pest risks" },
};

export type RecommendInputs = {
  soil: SoilInfo;
  climate: ClimateNow;
  priorities: Priorities;
  irrigation: boolean;
};

export type ScoreBreakdown = {
  soil: number;
  climate: number;
  priorities: number;
};

export type RecommendationReason = {
  kind: "good" | "warn" | "info";
  text: string;
};

export type ScoredCrop = {
  crop: Crop;
  score: number;
  breakdown: ScoreBreakdown;
  reasons: RecommendationReason[];
};

const LEVEL_SCORE: Record<Level, number> = {
  Low: 30,
  Moderate: 65,
  High: 95,
};

function average(values: number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function scoreSoil(crop: Crop, soil: SoilInfo): number {
  const phScore =
    soil.ph < crop.traits.phMin
      ? Math.max(15, 100 - (crop.traits.phMin - soil.ph) * 18)
      : soil.ph > crop.traits.phMax
        ? Math.max(15, 100 - (soil.ph - crop.traits.phMax) * 18)
        : 100;
  const soilTypeScore = crop.soils.includes(soil.type) ? 100 : 55;
  const drainageScore =
    soil.drainage === "Poor"
      ? crop.water === "High"
        ? 95
        : 50
      : soil.drainage === "Good"
        ? crop.water === "High"
          ? 65
          : 90
        : 80;
  const fertilityScore =
    soil.fertility === "High" ? 95 : soil.fertility === "Moderate" ? 75 : 55;
  return Math.round(average([phScore, soilTypeScore, drainageScore, fertilityScore]));
}

function scoreClimate(crop: Crop, climate: ClimateNow, irrigation: boolean): number {
  const tempScore =
    climate.avgTemp < crop.traits.tempMin
      ? Math.max(20, 100 - (crop.traits.tempMin - climate.avgTemp) * 5)
      : climate.avgTemp > crop.traits.tempMax
        ? Math.max(20, 100 - (climate.avgTemp - crop.traits.tempMax) * 5)
        : 100;
  const seasonalScore = crop.seasons.includes(climate.season) ? 100 : 55;
  const rainNeed = crop.water === "High" ? 100 : crop.water === "Medium" ? 65 : 35;
  const waterScore = irrigation
    ? 90
    : Math.max(20, 100 - Math.max(0, rainNeed - climate.rainOutlook30d) * 0.6);
  const moistureScore =
    climate.soilMoisture >= 30 && climate.soilMoisture <= 45
      ? 90
      : climate.soilMoisture < 30
        ? Math.max(25, 90 - (30 - climate.soilMoisture) * (irrigation ? 1 : 2))
        : Math.max(35, 90 - (climate.soilMoisture - 45) * 2);
  return Math.round(average([tempScore, seasonalScore, waterScore, moistureScore]));
}

function scorePriorities(crop: Crop, priorities: Priorities): number {
  const values: Record<keyof Priorities, number> = {
    profit: LEVEL_SCORE[crop.traits.marketValue],
    lowCost: 100 - LEVEL_SCORE[crop.traits.inputCost],
    waterSaving:
      crop.water === "Low"
        ? 95
        : crop.water === "Medium"
          ? 65
          : 30,
    quickHarvest:
      crop.duration === "Short" ? 95 : crop.duration === "Medium" ? 65 : 30,
    lowRisk:
      crop.risks.length === 0
        ? 90
        : Math.max(30, 90 - crop.risks.filter((risk) => risk.level === "High").length * 30),
  };
  const selected = PRIORITY_KEYS.filter((key) => priorities[key] > 0);
  if (selected.length === 0) return 70;
  const totalWeight = selected.reduce((total, key) => total + priorities[key], 0);
  return Math.round(
    selected.reduce(
      (total, key) => total + values[key] * priorities[key],
      0,
    ) / totalWeight,
  );
}

function makeReasons(
  crop: Crop,
  inputs: RecommendInputs,
  breakdown: ScoreBreakdown,
): RecommendationReason[] {
  const reasons: RecommendationReason[] = [];
  const { soil, climate, irrigation } = inputs;

  if (soil.ph < crop.traits.phMin) {
    reasons.push({
      kind: "warn",
      text: `Your soil is acidic (pH ${soil.ph.toFixed(1)}); this crop prefers pH ${crop.traits.phMin}–${crop.traits.phMax}.`,
    });
  } else if (soil.ph > crop.traits.phMax) {
    reasons.push({
      kind: "warn",
      text: `Your soil is alkaline (pH ${soil.ph.toFixed(1)}); this crop prefers pH ${crop.traits.phMin}–${crop.traits.phMax}.`,
    });
  } else {
    reasons.push({ kind: "good", text: "Your soil pH is in this crop's preferred range." });
  }

  if (!irrigation && crop.water === "High" && climate.rainOutlook30d < 80) {
    reasons.push({
      kind: "warn",
      text: "Rainfall may not meet this crop's water needs without irrigation.",
    });
  } else if (crop.seasons.includes(climate.season)) {
    reasons.push({ kind: "good", text: `This crop suits the ${climate.season.toLowerCase()}.` });
  } else {
    reasons.push({ kind: "warn", text: `This crop is less suited to the ${climate.season.toLowerCase()}.` });
  }

  if (breakdown.soil < 60) {
    reasons.push({ kind: "info", text: `The local ${soil.type.toLowerCase()} soil is not an ideal match.` });
  }
  return reasons;
}

export function scoreCrop(crop: Crop, inputs: RecommendInputs): ScoredCrop {
  const breakdown: ScoreBreakdown = {
    soil: scoreSoil(crop, inputs.soil),
    climate: scoreClimate(crop, inputs.climate, inputs.irrigation),
    priorities: scorePriorities(crop, inputs.priorities),
  };
  const score = Math.max(
    0,
    Math.min(
      99,
      Math.round(
        breakdown.soil * 0.4 +
          breakdown.climate * 0.35 +
          breakdown.priorities * 0.25,
      ),
    ),
  );

  return {
    crop,
    score,
    breakdown,
    reasons: makeReasons(crop, inputs, breakdown),
  };
}

export function rankCrops(crops: Crop[], inputs: RecommendInputs): ScoredCrop[] {
  return crops
    .map((crop) => scoreCrop(crop, inputs))
    .sort((a, b) => b.score - a.score || a.crop.name.localeCompare(b.crop.name));
}
