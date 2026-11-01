// Sample NASA-style series (POWER, SMAP, MODIS NDVI). Values are realistic
// for Central Luzon at the end of the wet season. Replace with API data later.

export type TimeRange = "today" | "7d" | "30d" | "custom";

export type MetricKey = "soil" | "rain" | "temp" | "ndvi" | "climate";

export type Point = { label: string; value: number; compare?: number };

export type Metric = {
  key: MetricKey;
  tab: string;
  title: string;
  unit: string;
  source: string;
  chart: "area" | "bar" | "line";
  current: string;
  change: string;
  trend: "up" | "down" | "flat";
  status: string;
  plain: string;
  whatToDo: string[];
  stats: Array<{ label: string; value: string }>;
  compareLabel?: string;
};

export const METRICS: Metric[] = [
  {
    key: "soil",
    tab: "Soil",
    title: "Soil moisture",
    unit: "%",
    source: "NASA SMAP · surface layer (0–5 cm)",
    chart: "area",
    current: "34%",
    change: "-3% vs last week",
    trend: "down",
    status: "Adequate",
    plain:
      "This is how much water is in the top layer of your soil. Around 30–40% is comfortable for most crops. Below 20% roots struggle; above 45% the soil is waterlogged.",
    whatToDo: [
      "Good time for land preparation. No extra irrigation needed this week.",
      "Moisture is slowly falling as rains taper off. Plant soon to use it.",
    ],
    stats: [
      { label: "Ideal range", value: "30–40%" },
      { label: "Lowest", value: "29%" },
      { label: "Highest", value: "41%" },
    ],
  },
  {
    key: "rain",
    tab: "Rainfall",
    title: "Rainfall",
    unit: "mm",
    source: "NASA GPM IMERG · daily precipitation",
    chart: "bar",
    current: "38 mm",
    change: "-52% vs last month",
    trend: "down",
    status: "Tapering off",
    plain:
      "Total rain that fell on your area. The wet season is ending, so expect fewer and smaller showers. Short heavy bursts can still happen.",
    whatToDo: [
      "Apply fertilizer on dry days so rain does not wash it away.",
      "Clear drainage canals before Tuesday's expected heavy rain.",
    ],
    stats: [
      { label: "Rainy days", value: "6" },
      { label: "Wettest day", value: "14 mm" },
      { label: "Normal for period", value: "61 mm" },
    ],
  },
  {
    key: "temp",
    tab: "Temperature",
    title: "Temperature",
    unit: "°C",
    source: "NASA POWER · 2 m air temperature",
    chart: "line",
    current: "30 °C",
    change: "+0.4 °C vs last week",
    trend: "up",
    status: "Comfortable",
    plain:
      "Daytime highs measured 2 metres above ground. Most tropical crops grow best between 25 and 33 °C. Above 35 °C, rice and tomato flowers can fail.",
    whatToDo: [
      "Temperatures are in the safe range for flowering crops.",
      "Water in the early morning to reduce heat stress at midday.",
    ],
    stats: [
      { label: "Average high", value: "30.6 °C" },
      { label: "Average low", value: "23.1 °C" },
      { label: "Hot days (>35 °C)", value: "0" },
    ],
    compareLabel: "Night low",
  },
  {
    key: "ndvi",
    tab: "Plant health",
    title: "Vegetation health (NDVI)",
    unit: "",
    source: "NASA MODIS · 250 m NDVI, 16-day",
    chart: "area",
    current: "0.68",
    change: "+0.05 vs last reading",
    trend: "up",
    status: "Healthy",
    plain:
      "NDVI measures how green and leafy plants look from space, from 0 to 1. Above 0.6 means thick, healthy growth. Below 0.3 is bare soil or stressed plants.",
    whatToDo: [
      "Crops around you are thriving: a sign of good growing conditions.",
      "A sudden drop on your own plot can be an early sign of pests or drought.",
    ],
    stats: [
      { label: "Your area", value: "0.68" },
      { label: "Province average", value: "0.61" },
      { label: "Healthy threshold", value: "0.60" },
    ],
  },
  {
    key: "climate",
    tab: "Climate trends",
    title: "Climate trends",
    unit: "°C",
    source: "NASA POWER · 1995–2025 monthly climatology",
    chart: "line",
    current: "+0.9 °C",
    change: "warmer than the 30-year average",
    trend: "up",
    status: "Warming",
    plain:
      "Compares this year's monthly temperature with the 30-year average. Your area is slowly getting warmer, which shifts the best planting dates earlier and raises heat stress risk in April and May.",
    whatToDo: [
      "Plant dry-season crops early so flowering happens before the April heat.",
      "Consider heat-tolerant varieties when buying seed.",
    ],
    stats: [
      { label: "Warmest month", value: "May · 33.8 °C" },
      { label: "30-year trend", value: "+0.18 °C / decade" },
      { label: "Rain trend", value: "-4% / decade" },
    ],
    compareLabel: "30-year average",
  },
];

const DAY_LABELS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
const HOURS = ["6a", "9a", "12p", "3p", "6p", "9p", "12a"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Deterministic wobble so SSR and client render the same numbers.
function wave(i: number, seed: number, amp: number) {
  return Math.sin(i * 0.9 + seed) * amp + Math.cos(i * 0.37 + seed * 2) * amp * 0.5;
}

function round(n: number, digits = 1) {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

function seriesFor(key: MetricKey, labels: string[], seed: number): Point[] {
  return labels.map((label, i) => {
    const t = i / Math.max(labels.length - 1, 1);
    switch (key) {
      case "soil":
        return { label, value: round(38 - t * 5 + wave(i, seed, 1.8)) };
      case "rain":
        return { label, value: Math.max(0, round(6 - t * 3 + wave(i, seed, 4.5))) };
      case "temp":
        return {
          label,
          value: round(30 + wave(i, seed, 1.1)),
          compare: round(23 + wave(i, seed + 1, 0.7)),
        };
      case "ndvi":
        return { label, value: round(0.6 + t * 0.08 + wave(i, seed, 0.015), 2) };
      case "climate":
        return { label, value: 0, compare: 0 };
    }
  });
}

const CLIMATE_NORMAL = [25.6, 26.3, 27.7, 29.4, 30.2, 29.1, 28.0, 27.6, 27.7, 27.6, 27.0, 26.0];
const CLIMATE_NOW = [26.4, 27.1, 28.9, 30.6, 31.4, 29.8, 28.7, 28.4, 28.5, 28.4, 27.8, 26.9];

export function getSeries(key: MetricKey, range: TimeRange): Point[] {
  if (key === "climate") {
    return MONTHS.map((label, i) => ({
      label,
      value: CLIMATE_NOW[i],
      compare: CLIMATE_NORMAL[i],
    }));
  }
  if (range === "today") return seriesFor(key, HOURS, 1);
  if (range === "7d") return seriesFor(key, DAY_LABELS, 2);
  const days = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
  return seriesFor(key, days, range === "custom" ? 5 : 3);
}

export const RANGE_OPTIONS: Array<{ value: TimeRange; label: string }> = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "custom", label: "Custom" },
];
