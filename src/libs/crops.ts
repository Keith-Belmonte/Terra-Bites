// Reference crop traits used in the suitability comparison.

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
  care: string[];
  risks: Array<{ title: string; level: Level; detail: string }>;
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
    traits: {
      phMin: 5.5,
      phMax: 7.0,
      tempMin: 20,
      tempMax: 35,
      droughtTolerance: "Low",
      inputCost: "Moderate",
      marketValue: "High",
    },
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
          "Check irrigation availability and local water schedules when planning dry-season crops.",
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
    traits: {
      phMin: 6.0,
      phMax: 7.5,
      tempMin: 25,
      tempMax: 35,
      droughtTolerance: "High",
      inputCost: "Low",
      marketValue: "Moderate",
    },
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
    traits: {
      phMin: 6.0,
      phMax: 7.0,
      tempMin: 18,
      tempMax: 30,
      droughtTolerance: "Low",
      inputCost: "High",
      marketValue: "High",
    },
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
        detail:
          "Rotate away from fields that grew eggplant or pepper last season.",
      },
      {
        title: "Fruit worm",
        level: "Moderate",
        detail: "Check young fruit twice a week during fruit set.",
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
    traits: {
      phMin: 5.8,
      phMax: 7.0,
      tempMin: 18,
      tempMax: 33,
      droughtTolerance: "Moderate",
      inputCost: "Moderate",
      marketValue: "Moderate",
    },
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
          "Scout for early damage in the leaf whorl and follow local integrated pest-management guidance.",
      },
      {
        title: "Moisture stress at silking",
        level: "Moderate",
        detail:
          "Watch for moisture stress near flowering and manage water using field observations.",
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
    traits: {
      phMin: 6.0,
      phMax: 7.0,
      tempMin: 15,
      tempMax: 30,
      droughtTolerance: "Low",
      inputCost: "High",
      marketValue: "High",
    },
    care: [
      "Transplant 40–45 day old seedlings at 10 × 15 cm.",
      "Irrigate lightly and often; stop 2 weeks before harvest.",
      "Cure harvested bulbs in shade for 7–10 days before storage.",
    ],
    risks: [
      {
        title: "Armyworm outbreaks",
        level: "High",
        detail:
          "Monitor the field for feeding damage and follow local integrated pest-management guidance.",
      },
      {
        title: "Purple blotch",
        level: "Moderate",
        detail:
          "High humidity and prolonged leaf wetness can increase disease pressure.",
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
    traits: {
      phMin: 5.5,
      phMax: 6.8,
      tempMin: 22,
      tempMax: 32,
      droughtTolerance: "Moderate",
      inputCost: "Moderate",
      marketValue: "Moderate",
    },
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
    traits: {
      phMin: 5.0,
      phMax: 6.5,
      tempMin: 20,
      tempMax: 32,
      droughtTolerance: "High",
      inputCost: "Low",
      marketValue: "Low",
    },
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
  },
  {
    id: "sorghum",
    name: "Sorghum",
    localName: "Regional name varies",
    image: img("photo-1649251037465-72c9d378acb6"),
    type: "Grain",
    seasons: ["Wet season", "Dry season"],
    water: "Low",
    soils: ["Sandy loam", "Loam", "Clay loam"],
    duration: "Medium",
    daysToHarvest: "90–120 days",
    traits: {
      phMin: 5.5,
      phMax: 7.5,
      tempMin: 25,
      tempMax: 32,
      droughtTolerance: "High",
      inputCost: "Low",
      marketValue: "Moderate",
    },
    care: [
      "Sow into warm, well-drained soil after the risk of frost has passed.",
      "Keep the seedbed moist until seedlings establish, then avoid waterlogging.",
      "Harvest when grain heads mature and dry according to local post-harvest guidance.",
    ],
    risks: [
      {
        title: "Bird damage",
        level: "Moderate",
        detail:
          "Monitor ripening heads and use locally approved crop-protection methods.",
      },
    ],
  },
  {
    id: "wheat",
    name: "Wheat",
    localName: "Regional name varies",
    image: img("photo-1649251037465-72c9d378acb6"),
    type: "Grain",
    seasons: ["Dry season"],
    water: "Medium",
    soils: ["Loam", "Clay loam", "Silt loam"],
    duration: "Long",
    daysToHarvest: "100–150 days",
    traits: {
      phMin: 6.0,
      phMax: 7.5,
      tempMin: 10,
      tempMax: 24,
      droughtTolerance: "Moderate",
      inputCost: "Moderate",
      marketValue: "High",
    },
    care: [
      "Choose a locally adapted variety and sow during the recommended cool season.",
      "Avoid waterlogged soil and manage weeds early in the crop cycle.",
      "Harvest when grain is mature and dry enough for safe storage.",
    ],
    risks: [
      {
        title: "Rust diseases",
        level: "Moderate",
        detail:
          "Check leaves regularly and consult local extension guidance if symptoms appear.",
      },
    ],
  },
  {
    id: "barley",
    name: "Barley",
    localName: "Regional name varies",
    image: img("photo-1649251037465-72c9d378acb6"),
    type: "Grain",
    seasons: ["Dry season"],
    water: "Low",
    soils: ["Loam", "Sandy loam", "Silt loam"],
    duration: "Medium",
    daysToHarvest: "90–120 days",
    traits: {
      phMin: 6.0,
      phMax: 8.0,
      tempMin: 10,
      tempMax: 24,
      droughtTolerance: "Moderate",
      inputCost: "Moderate",
      marketValue: "Moderate",
    },
    care: [
      "Use a locally adapted variety and plant in the recommended cool season.",
      "Maintain even moisture during establishment and avoid waterlogged fields.",
      "Harvest mature, dry grain and follow local storage guidance.",
    ],
    risks: [
      {
        title: "Leaf diseases",
        level: "Moderate",
        detail:
          "Inspect the crop regularly and seek local advice before applying treatments.",
      },
    ],
  },
  {
    id: "chickpea",
    name: "Chickpea",
    localName: "Regional name varies",
    image: img("photo-1719846923269-6fdf75444cb8"),
    type: "Legume",
    seasons: ["Dry season"],
    water: "Low",
    soils: ["Sandy loam", "Loam"],
    duration: "Medium",
    daysToHarvest: "90–120 days",
    traits: {
      phMin: 6.0,
      phMax: 8.0,
      tempMin: 15,
      tempMax: 30,
      droughtTolerance: "High",
      inputCost: "Low",
      marketValue: "High",
    },
    care: [
      "Sow in well-drained soil during a cool, relatively dry growing period.",
      "Avoid excessive irrigation, especially during flowering and pod formation.",
      "Harvest when most pods are mature and dry.",
    ],
    risks: [
      {
        title: "Ascochyta blight",
        level: "Moderate",
        detail:
          "Use clean seed and avoid prolonged leaf wetness where possible.",
      },
    ],
  },
  {
    id: "cowpea",
    name: "Cowpea",
    localName: "Regional name varies",
    image: img("photo-1719846923269-6fdf75444cb8"),
    type: "Legume",
    seasons: ["Wet season", "Dry season"],
    water: "Low",
    soils: ["Sandy loam", "Loam"],
    duration: "Short",
    daysToHarvest: "60–90 days",
    traits: {
      phMin: 5.5,
      phMax: 7.5,
      tempMin: 20,
      tempMax: 35,
      droughtTolerance: "High",
      inputCost: "Low",
      marketValue: "Moderate",
    },
    care: [
      "Sow after the soil has warmed and provide well-drained growing conditions.",
      "Control weeds while plants are young and avoid excessive nitrogen fertilizer.",
      "Pick green pods as needed or dry mature pods for grain.",
    ],
    risks: [
      {
        title: "Pod-feeding insects",
        level: "Moderate",
        detail:
          "Scout during flowering and pod set and follow local integrated pest-management advice.",
      },
    ],
  },
  {
    id: "cassava",
    name: "Cassava",
    localName: "Regional name varies",
    image: img("photo-1730815048561-45df6f7f331d"),
    type: "Root crop",
    seasons: ["Wet season", "Dry season"],
    water: "Low",
    soils: ["Sandy loam", "Loam"],
    duration: "Long",
    daysToHarvest: "8–18 months",
    traits: {
      phMin: 5.0,
      phMax: 7.0,
      tempMin: 20,
      tempMax: 30,
      droughtTolerance: "High",
      inputCost: "Low",
      marketValue: "Moderate",
    },
    care: [
      "Plant healthy stem cuttings in warm, well-drained soil.",
      "Keep the field weed-free during establishment and avoid prolonged waterlogging.",
      "Harvest roots at the locally recommended age and process safely before eating.",
    ],
    risks: [
      {
        title: "Cassava mosaic disease",
        level: "High",
        detail:
          "Use clean planting material and seek local guidance for disease management.",
      },
    ],
  },
  {
    id: "potato",
    name: "Potato",
    localName: "Regional name varies",
    image: img("photo-1730815048561-45df6f7f331d"),
    type: "Root crop",
    seasons: ["Dry season"],
    water: "Medium",
    soils: ["Sandy loam", "Loam"],
    duration: "Medium",
    daysToHarvest: "80–120 days",
    traits: {
      phMin: 5.0,
      phMax: 6.5,
      tempMin: 15,
      tempMax: 22,
      droughtTolerance: "Low",
      inputCost: "Moderate",
      marketValue: "High",
    },
    care: [
      "Plant certified, locally adapted seed tubers in cool, well-drained soil.",
      "Hill soil around plants as stems grow and keep moisture even during tuber formation.",
      "Harvest after the crop matures and cure tubers before storage.",
    ],
    risks: [
      {
        title: "Late blight",
        level: "High",
        detail:
          "Check foliage during cool, wet weather and follow local disease advisories.",
      },
    ],
  },
  {
    id: "cabbage",
    name: "Cabbage",
    localName: "Regional name varies",
    image: img("photo-1789373232964-9c5d7eeb4aa5"),
    type: "Vegetable",
    seasons: ["Dry season"],
    water: "Medium",
    soils: ["Loam", "Clay loam"],
    duration: "Medium",
    daysToHarvest: "70–100 days",
    traits: {
      phMin: 6.0,
      phMax: 7.5,
      tempMin: 15,
      tempMax: 24,
      droughtTolerance: "Low",
      inputCost: "Moderate",
      marketValue: "Moderate",
    },
    care: [
      "Transplant healthy seedlings into fertile soil during cool weather.",
      "Keep soil evenly moist and mulch to reduce moisture loss.",
      "Harvest firm heads before they split.",
    ],
    risks: [
      {
        title: "Caterpillars",
        level: "Moderate",
        detail:
          "Inspect leaf undersides and use locally approved integrated pest-management methods.",
      },
    ],
  },
  {
    id: "cucumber",
    name: "Cucumber",
    localName: "Regional name varies",
    image: img("photo-1597338684959-a73136a8be13"),
    type: "Vegetable",
    seasons: ["Wet season", "Dry season"],
    water: "Medium",
    soils: ["Sandy loam", "Loam"],
    duration: "Short",
    daysToHarvest: "50–70 days",
    traits: {
      phMin: 5.5,
      phMax: 7.0,
      tempMin: 20,
      tempMax: 30,
      droughtTolerance: "Low",
      inputCost: "Moderate",
      marketValue: "Moderate",
    },
    care: [
      "Sow in warm soil and provide room for vines or a trellis.",
      "Water consistently at the base and avoid wetting foliage.",
      "Harvest regularly while fruits are still tender.",
    ],
    risks: [
      {
        title: "Powdery mildew",
        level: "Moderate",
        detail: "Allow airflow around plants and remove badly affected leaves.",
      },
    ],
  },
  {
    id: "soybean",
    name: "Soybean",
    localName: "Regional name varies",
    image: img("photo-1719846923269-6fdf75444cb8"),
    type: "Legume",
    seasons: ["Wet season", "Dry season"],
    water: "Medium",
    soils: ["Loam", "Sandy loam", "Clay loam"],
    duration: "Medium",
    daysToHarvest: "90–150 days",
    traits: {
      phMin: 6.0,
      phMax: 7.0,
      tempMin: 20,
      tempMax: 30,
      droughtTolerance: "Moderate",
      inputCost: "Moderate",
      marketValue: "High",
    },
    care: [
      "Choose a locally adapted variety and plant into warm, well-drained soil.",
      "Maintain moisture through flowering and pod development.",
      "Harvest when most pods are mature and dry.",
    ],
    risks: [
      {
        title: "Pod-feeding pests",
        level: "Moderate",
        detail:
          "Scout during flowering and pod fill and follow local integrated pest-management guidance.",
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
