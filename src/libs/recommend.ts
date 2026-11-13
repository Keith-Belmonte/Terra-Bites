import type { Crop, Level, SoilType } from "@/lib/crops.ts";

export type ClimateNow = {
  avgTemp: number;
  rainOutlook7d: number;
  soilMoisture: number | null;
};

export type Drainage = "Poor" | "Moderate" | "Good";

export type SoilInfo = {
  type: SoilType;
  ph: number;
  drainage: Drainage;
  fertility: Level;
};

export const DEFAULT_SOIL: SoilInfo = {
  type: "Loam",
  ph: 6.5,
  drainage: "Moderate",
  fertility: "Moderate",
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
  profit: { label: "Higher reference value", hint: "Prioritize crops with a higher general value rating; no live prices are used" },
  lowCost: { label: "Lower reference input cost", hint: "Prefer crops with a lower general input-cost rating" },
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
  const rainNeed = crop.water === "High" ? 35 : crop.water === "Medium" ? 20 : 10;
  const waterScore = irrigation
    ? 90
    : Math.max(20, 100 - Math.max(0, rainNeed - climate.rainOutlook7d) * 1.5);
  return Math.round(average([tempScore, waterScore]));
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
      text: `The selected soil pH is ${soil.ph.toFixed(1)}; this crop's reference range is pH ${crop.traits.phMin}–${crop.traits.phMax}.`,
    });
  } else if (soil.ph > crop.traits.phMax) {
    reasons.push({
      kind: "warn",
      text: `The selected soil pH is ${soil.ph.toFixed(1)}; this crop's reference range is pH ${crop.traits.phMin}–${crop.traits.phMax}.`,
    });
  } else {
    reasons.push({ kind: "good", text: "The selected soil pH is within this crop's reference range." });
  }

  if (!irrigation && crop.water === "High" && climate.rainOutlook7d < 35) {
    reasons.push({
      kind: "warn",
      text: "The 7-day forecast may not provide enough water for this crop without irrigation.",
    });
  } else {
    reasons.push({
      kind: "info",
      text: `${climate.rainOutlook7d.toFixed(1)} mm of rain is forecast over the next 7 days.`,
    });
  }

  if (breakdown.soil < 60) {
    reasons.push({
      kind: "info",
      text: `The selected ${soil.type.toLowerCase()} soil class is not an ideal match.`,
    });
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

export function selectRegionalCropOptions(
  ranked: ScoredCrop[],
  maxOptions = 8,
): ScoredCrop[] {
  return ranked.slice(0, maxOptions);
}
