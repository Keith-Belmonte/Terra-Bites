// Sample crop data for the first version. Replace with a real recommendation
// service (NASA POWER + soil data) later; the shape is what the UI expects.

export type Season = "Wet season" | "Dry season";
export type WaterNeed = "Low" | "Medium" | "High";
export type SoilType = "Clay loam" | "Sandy loam" | "Silt loam" | "Loam";
export type GrowthDuration = "Short" | "Medium" | "Long";
export type CropType = "Grain" | "Vegetable" | "Legume" | "Root crop";
export type Level = "Low" | "Moderate" | "High";

/** Inherent crop characteristics used by the recommendation engine. */
export type CropTraits = {
  phMin: number;
  phMax: number;
  // Comfortable day temperature range, °C
  tempMin: number;
  tempMax: number;
  droughtTolerance: Level;
  inputCost: Level;
  marketValue: Level;
};

export type Crop = {
  id: string;
  name: string;
  localName: string;
  image: string;
  type: CropType;
  seasons: Season[];
  water: WaterNeed;
  soils: SoilType[];
  duration: GrowthDuration;
  daysToHarvest: string;
  traits: CropTraits;
  yieldLevel: Level;
  expectedYield: string;
  plantingWindow: string;
  reason: string;
  care: string[];
  risks: Array<{ title: string; level: Level; detail: string }>;
  dataInsights: Array<{ label: string; value: string; note: string }>;
};

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=75`;

export const CROPS: Crop[] = [
  {
    id: "rice",
    name: "Rice",
    localName: "Palay",
    image: img("photo-1561504935-4e7d4516a2d1"),
    type: "Grain",
    seasons: ["Wet season", "Dry season"],
    water: "High",
    soils: ["Clay loam", "Silt loam"],
    duration: "Medium",
    daysToHarvest: "110–120 days",
    traits: { phMin: 5.5, phMax: 7.0, tempMin: 20, tempMax: 35, droughtTolerance: "Low", inputCost: "Moderate", marketValue: "High" },
    yieldLevel: "High",
    expectedYield: "5.2–6.0 t/ha",
    plantingWindow: "Nov 15 – Dec 31",
    reason:
      "Soil moisture is holding well after the wet season and irrigation water is available.",
    care: [
      "Prepare seedbeds 3 weeks before transplanting. Use certified inbred or hybrid seed.",
      "Transplant 18–21 day old seedlings at 20 × 20 cm spacing, 2–3 seedlings per hill.",
      "Keep 3–5 cm of standing water during tillering; drain 2 weeks before harvest.",
      "Apply nitrogen in 3 splits: at planting, at tillering, and at panicle start.",
    ],
    risks: [
      {
        title: "Stem borer",
        level: "Moderate",
        detail:
          "Warm, humid nights favour moth activity. Check for dead hearts at 30 days.",
      },
      {
        title: "Late-season dry spell",
        level: "Low",
        detail:
          "Rainfall drops from January. Secure irrigation schedules with your NIA group.",
      },
    ],
    dataInsights: [
      {
        label: "Soil moisture",
        value: "0.34 m³/m³",
        note: "Good for land preparation without extra irrigation.",
      },
      {
        label: "Day temperature",
        value: "29–31 °C",
        note: "Ideal range for tillering and grain filling.",
      },
      {
        label: "Sunlight",
        value: "5.6 kWh/m²/day",
        note: "Clear dry-season skies support high yields.",
      },
    ],
  },
  {
    id: "mung-bean",
    name: "Mung bean",
    localName: "Monggo",
    image: img("photo-1719846923269-6fdf75444cb8"),
    type: "Legume",
    seasons: ["Dry season"],
    water: "Low",
    soils: ["Sandy loam", "Loam", "Clay loam"],
    duration: "Short",
    daysToHarvest: "60–70 days",
    traits: { phMin: 6.0, phMax: 7.5, tempMin: 25, tempMax: 35, droughtTolerance: "High", inputCost: "Low", marketValue: "Moderate" },
    yieldLevel: "Moderate",
    expectedYield: "0.9–1.2 t/ha",
    plantingWindow: "Nov 1 – Dec 15",
    reason:
      "Uses leftover soil moisture after rice and adds nitrogen back to the soil.",
    care: [
      "Plant right after the rice harvest using zero tillage to save residual moisture.",
      "Sow 2–3 seeds per hill at 50 × 20 cm spacing.",
      "Weed at 2 and 4 weeks after planting.",
      "Harvest pods when 80% have turned black; pick in 2–3 rounds.",
    ],
    risks: [
      {
        title: "Pod borer",
        level: "Moderate",
        detail: "Scout during flowering. Use neem-based sprays early.",
      },
      {
        title: "Waterlogging",
        level: "Low",
        detail: "Avoid low spots that hold water after late rains.",
      },
    ],
    dataInsights: [
      {
        label: "Residual moisture",
        value: "0.31 m³/m³",
        note: "Enough to germinate seed without irrigation.",
      },
      {
        label: "Rain outlook",
        value: "42 mm / 30 days",
        note: "Low rain lowers the risk of pod rot.",
      },
    ],
  },
  {
    id: "tomato",
    name: "Tomato",
    localName: "Kamatis",
    image: img("photo-1597338684959-a73136a8be13"),
    type: "Vegetable",
    seasons: ["Dry season"],
    water: "Medium",
    soils: ["Loam", "Sandy loam"],
    duration: "Medium",
    daysToHarvest: "75–90 days",
    traits: { phMin: 6.0, phMax: 7.0, tempMin: 18, tempMax: 30, droughtTolerance: "Low", inputCost: "High", marketValue: "High" },
    yieldLevel: "High",
    expectedYield: "18–25 t/ha",
    plantingWindow: "Oct 25 – Dec 10",
    reason:
      "Cooler nights in the coming months help flowers set fruit instead of dropping.",
    care: [
      "Raise seedlings in trays for 25 days before transplanting.",
      "Stake or trellis plants 2 weeks after transplanting.",
      "Water at the base in the morning; avoid wetting the leaves.",
      "Mulch with rice straw to keep soil cool and moist.",
    ],
    risks: [
      {
        title: "Bacterial wilt",
        level: "Moderate",
        detail: "Rotate away from fields that grew eggplant or pepper last season.",
      },
      {
        title: "Fruit worm",
        level: "Moderate",
        detail: "Check young fruit twice a week during fruit set.",
      },
    ],
    dataInsights: [
      {
        label: "Night temperature",
        value: "22 °C",
        note: "Falling toward the 18–21 °C sweet spot for fruit set.",
      },
      {
        label: "Humidity",
        value: "78%",
        note: "Still high. Space plants for airflow to limit leaf disease.",
      },
    ],
  },
  {
    id: "corn",
    name: "Corn",
    localName: "Mais",
    image: img("photo-1649251037465-72c9d378acb6"),
    type: "Grain",
    seasons: ["Wet season", "Dry season"],
    water: "Medium",
    soils: ["Loam", "Sandy loam", "Silt loam"],
    duration: "Medium",
    daysToHarvest: "95–110 days",
    traits: { phMin: 5.8, phMax: 7.0, tempMin: 18, tempMax: 33, droughtTolerance: "Moderate", inputCost: "Moderate", marketValue: "Moderate" },
    yieldLevel: "Moderate",
    expectedYield: "4.5–5.5 t/ha",
    plantingWindow: "Nov 10 – Dec 20",
    reason:
      "Well-drained upland fields are drying out nicely, but plan one or two irrigations.",
    care: [
      "Plant at 75 × 25 cm spacing, one seed per hill.",
      "Side-dress nitrogen at knee height (about 30 days).",
      "Irrigate at tasseling and silking if no rain for 10 days.",
    ],
    risks: [
      {
        title: "Fall armyworm",
        level: "High",
        detail:
          "Regional reports are up this month. Check the leaf whorl every 3 days.",
      },
      {
        title: "Moisture stress at silking",
        level: "Moderate",
        detail: "Dry-season rain is low; prepare a water source.",
      },
    ],
    dataInsights: [
      {
        label: "Vegetation health",
        value: "NDVI 0.62",
        note: "Neighbouring fields are healthy, which signals good conditions.",
      },
      {
        label: "Rain outlook",
        value: "42 mm / 30 days",
        note: "Below what corn needs at silking; plan irrigation.",
      },
    ],
  },
  {
    id: "onion",
    name: "Onion",
    localName: "Sibuyas",
    image: img("photo-1760549255949-767d18981890"),
    type: "Vegetable",
    seasons: ["Dry season"],
    water: "Medium",
    soils: ["Silt loam", "Loam"],
    duration: "Long",
    daysToHarvest: "120–140 days",
    traits: { phMin: 6.0, phMax: 7.0, tempMin: 15, tempMax: 30, droughtTolerance: "Low", inputCost: "High", marketValue: "High" },
    yieldLevel: "High",
    expectedYield: "15–20 t/ha",
    plantingWindow: "Nov 20 – Jan 10",
    reason:
      "Nueva Ecija's dry season suits bulbing, but prices swing, so plan your market.",
    care: [
      "Transplant 40–45 day old seedlings at 10 × 15 cm.",
      "Irrigate lightly and often; stop 2 weeks before harvest.",
      "Cure harvested bulbs in shade for 7–10 days before storage.",
    ],
    risks: [
      {
        title: "Armyworm outbreaks",
        level: "High",
        detail: "Past seasons saw big losses. Use pheromone traps early.",
      },
      {
        title: "Purple blotch",
        level: "Moderate",
        detail: "Spreads in dew-heavy mornings in December.",
      },
    ],
    dataInsights: [
      {
        label: "Day length",
        value: "11.4 hours",
        note: "Short-day varieties will bulb well this season.",
      },
    ],
  },
  {
    id: "eggplant",
    name: "Eggplant",
    localName: "Talong",
    image: img("photo-1789373232964-9c5d7eeb4aa5"),
    type: "Vegetable",
    seasons: ["Wet season", "Dry season"],
    water: "Medium",
    soils: ["Loam", "Sandy loam", "Clay loam"],
    duration: "Long",
    daysToHarvest: "70 days to first harvest",
    traits: { phMin: 5.5, phMax: 6.8, tempMin: 22, tempMax: 32, droughtTolerance: "Moderate", inputCost: "Moderate", marketValue: "Moderate" },
    yieldLevel: "Moderate",
    expectedYield: "12–18 t/ha",
    plantingWindow: "Nov 1 – Jan 15",
    reason: "Tolerates the heat well and keeps producing for several months.",
    care: [
      "Transplant at 75 × 50 cm spacing after 30 days in the nursery.",
      "Remove infested shoots weekly to control fruit and shoot borer.",
      "Harvest every 3–4 days while fruit is glossy.",
    ],
    risks: [
      {
        title: "Fruit and shoot borer",
        level: "High",
        detail: "The main pest. Prune wilted tips and destroy them.",
      },
    ],
    dataInsights: [
      {
        label: "Day temperature",
        value: "30 °C",
        note: "Within its comfortable range of 25–32 °C.",
      },
    ],
  },
  {
    id: "sweet-potato",
    name: "Sweet potato",
    localName: "Kamote",
    image: img("photo-1730815048561-45df6f7f331d"),
    type: "Root crop",
    seasons: ["Wet season", "Dry season"],
    water: "Low",
    soils: ["Sandy loam", "Loam"],
    duration: "Medium",
    daysToHarvest: "100–120 days",
    traits: { phMin: 5.0, phMax: 6.5, tempMin: 20, tempMax: 32, droughtTolerance: "High", inputCost: "Low", marketValue: "Low" },
    yieldLevel: "Moderate",
    expectedYield: "10–15 t/ha",
    plantingWindow: "Nov 1 – Feb 28",
    reason:
      "A drought-tolerant backup crop for sandy plots that dry out quickly.",
    care: [
      "Plant 25–30 cm vine cuttings on ridges 75 cm apart.",
      "Lift vines once at 45 days to stop them rooting along the stems.",
      "Harvest when the lower leaves start yellowing.",
    ],
    risks: [
      {
        title: "Sweet potato weevil",
        level: "Moderate",
        detail: "Hill up soil around the base to cover cracks.",
      },
    ],
    dataInsights: [
      {
        label: "Soil moisture",
        value: "0.22 m³/m³ (sandy plots)",
        note: "Too dry for most crops, fine for kamote.",
      },
    ],
  },
];

export const CROP_FILTERS = {
  type: ["Grain", "Vegetable", "Legume", "Root crop"],
  season: ["Wet season", "Dry season"],
  water: ["Low", "Medium", "High"],
  soil: ["Clay loam", "Sandy loam", "Silt loam", "Loam"],
  duration: ["Short", "Medium", "Long"],
} as const;

export type CropFilterKey = keyof typeof CROP_FILTERS;

export const FILTER_LABELS: Record<CropFilterKey, string> = {
  type: "Crop type",
  season: "Season",
  water: "Water need",
  soil: "Soil type",
  duration: "Growth time",
};

export function getCrop(id: string): Crop | undefined {
  return CROPS.find((crop) => crop.id === id);
}

export function suitabilityLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 65) return "Fair";
  return "Poor";
}
