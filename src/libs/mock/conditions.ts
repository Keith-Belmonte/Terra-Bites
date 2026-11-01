import {
  BugIcon,
  CloudRainIcon,
  DropletsIcon,
  SproutIcon,
  SunIcon,
  ThermometerIcon,
  WavesIcon,
  type LucideIcon,
} from "lucide-react";
import type { ClimateNow, SoilInfo } from "@/lib/recommend.ts";

export type FarmLocation = {
  id: string;
  city: string;
  province: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  elevation: string;
  // Local soil survey defaults; the farmer can override with a soil test.
  soil: SoilInfo;
  climate: ClimateNow;
  profile: {
    climate: string;
    soil: string;
    mainCrops: string[];
    wetSeason: string;
    drySeason: string;
    summary: string;
  };
};

// Sample locations used until real GPS is connected.
export const LOCATIONS: FarmLocation[] = [
  {
    id: "cabanatuan",
    city: "Cabanatuan City",
    province: "Nueva Ecija",
    region: "Central Luzon",
    country: "Philippines",
    lat: 15.4865,
    lng: 120.9667,
    elevation: "32 m",
    soil: { type: "Clay loam", ph: 6.2, drainage: "Poor", fertility: "Moderate" },
    climate: { season: "Dry season", avgTemp: 29, rainOutlook30d: 42, soilMoisture: 34, humidity: 78 },
    profile: {
      climate: "Tropical, distinct wet and dry seasons",
      soil: "Clay loam (Maligaya series)",
      mainCrops: ["Rice", "Onion", "Corn", "Mung bean"],
      wetSeason: "June – November",
      drySeason: "December – May",
      summary:
        "Known as the rice granary of the Philippines. Flat, irrigated lowlands with heavy clay soils that hold water well. Typhoons are the main wet-season risk; water supply is the main dry-season concern.",
    },
  },
  {
    id: "malaybalay",
    city: "Malaybalay City",
    province: "Bukidnon",
    region: "Northern Mindanao",
    country: "Philippines",
    lat: 8.1575,
    lng: 125.1278,
    elevation: "622 m",
    soil: { type: "Loam", ph: 5.4, drainage: "Good", fertility: "High" },
    climate: { season: "Wet season", avgTemp: 23, rainOutlook30d: 165, soilMoisture: 41, humidity: 84 },
    profile: {
      climate: "Cool highland, rain spread through the year",
      soil: "Loam (Adtuyon series)",
      mainCrops: ["Corn", "Sugarcane", "Pineapple", "Vegetables"],
      wetSeason: "May – December",
      drySeason: "January – April",
      summary:
        "A high plateau with cooler temperatures and few typhoons. Good for upland corn and highland vegetables. Erosion on slopes is the main soil concern.",
    },
  },
  {
    id: "iloilo",
    city: "Pototan",
    province: "Iloilo",
    region: "Western Visayas",
    country: "Philippines",
    lat: 10.9436,
    lng: 122.6347,
    elevation: "18 m",
    soil: { type: "Silt loam", ph: 6.6, drainage: "Moderate", fertility: "Moderate" },
    climate: { season: "Dry season", avgTemp: 30, rainOutlook30d: 68, soilMoisture: 29, humidity: 76 },
    profile: {
      climate: "Tropical, short dry season",
      soil: "Silt loam",
      mainCrops: ["Rice", "Sugarcane", "Mango", "Vegetables"],
      wetSeason: "June – November",
      drySeason: "December – April",
      summary:
        "Fertile river plains with mostly rain-fed rice. Planting depends heavily on the start of the rains, so seasonal rainfall forecasts matter most here.",
    },
  },
];

export type ConditionStatus = "good" | "watch" | "alert";

export type Condition = {
  key: string;
  label: string;
  value: string;
  unit: string;
  detail: string;
  status: ConditionStatus;
  icon: LucideIcon;
};

export const CONDITIONS: Condition[] = [
  {
    key: "temperature",
    label: "Temperature",
    value: "30",
    unit: "°C",
    detail: "Feels like 34 °C · Low 23 °C",
    status: "good",
    icon: ThermometerIcon,
  },
  {
    key: "rainfall",
    label: "Rainfall",
    value: "4.2",
    unit: "mm",
    detail: "Expected next 24 h",
    status: "good",
    icon: CloudRainIcon,
  },
  {
    key: "soil",
    label: "Soil moisture",
    value: "34",
    unit: "%",
    detail: "Top 5 cm · Adequate",
    status: "good",
    icon: WavesIcon,
  },
  {
    key: "humidity",
    label: "Humidity",
    value: "78",
    unit: "%",
    detail: "High · watch for leaf disease",
    status: "watch",
    icon: DropletsIcon,
  },
  {
    key: "sun",
    label: "Sunlight",
    value: "5.6",
    unit: "kWh/m²",
    detail: "About 7 hours of strong sun",
    status: "good",
    icon: SunIcon,
  },
];

export type FarmAlert = {
  id: string;
  title: string;
  detail: string;
  severity: "high" | "medium" | "low";
  icon: LucideIcon;
  when: string;
};

export const ALERTS: FarmAlert[] = [
  {
    id: "armyworm",
    title: "Fall armyworm risk is high",
    detail:
      "Warm nights and nearby reports. Check corn and onion leaf whorls every 3 days.",
    severity: "high",
    icon: BugIcon,
    when: "Next 14 days",
  },
  {
    id: "rain",
    title: "Heavy rain possible on Tuesday",
    detail:
      "Up to 45 mm from a passing low-pressure area. Hold off on fertilizer until it clears.",
    severity: "medium",
    icon: CloudRainIcon,
    when: "Tue, Nov 3",
  },
  {
    id: "dry",
    title: "Dry spell building from January",
    detail:
      "Rainfall is forecast 30% below normal. Prioritise low-water crops on rain-fed plots.",
    severity: "low",
    icon: SproutIcon,
    when: "Jan – Mar",
  },
];
