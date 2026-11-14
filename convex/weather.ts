import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Define the structural type for our processed weather history response
export interface ProcessedWeather {
  avgTemp: number;
  rainOutlook30d: number;
  humidity: number;
  season: "Wet season" | "Dry season";
}

/**
 * Mock external API adapter mimicking an ingestion feed from NASA POWER / Open-Meteo.
 * This translates raw satellite data arrays into our strict frontend contract formats.
 */
export function adaptExternalWeatherData(rawDailyTemps: number[], rawDailyRain: number[]): ProcessedWeather {
  if (rawDailyTemps.length === 0 || rawDailyRain.length === 0) {
    return { avgTemp: 27, rainOutlook30d: 150, humidity: 80, season: "Wet season" };
  }

  // Calculate average temperature
  const totalTemp = rawDailyTemps.reduce((sum, temp) => sum + temp, 0);
  const avgTemp = Number((totalTemp / rawDailyTemps.length).toFixed(1));

  // Sum up total forecasted rainfall over the period
  const rainOutlook30d = Number(rawDailyRain.reduce((sum, rain) => sum + rain, 0).toFixed(1));

  // Determine Philippine cropping season baseline (Wet season is typically > 100mm rain monthly)
  const season = rainOutlook30d > 120 ? "Wet season" : "Dry season";

  return {
    avgTemp,
    rainOutlook30d,
    humidity: 78, // Global environmental standard baseline fallback
    season,
  };
}

/**
 * Convex Query: Fetches simulated live location-aware weather variables 
 * without mutating database properties.
 */
export const getLiveWeatherAlerts = query({
  args: { latitude: v.number(), longitude: v.number() },
  handler: async (ctx, args) => {
    // Simulated external API payload array responses (e.g., last 7 days of readings)
    const simulatedTemps = [28.5, 29.0, 27.4, 26.8, 28.1, 29.3, 27.9];
    const simulatedRain = [15.2, 22.1, 5.0, 0, 12.4, 34.8, 18.2];

    // Process using our data adapter logic contract
    return adaptExternalWeatherData(simulatedTemps, simulatedRain);
  },
});
