import { query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Ideal target profiles for major crops in the Philippines
const CROP_PROFILES = [
  {
    name: "Rice (Palay)",
    idealMoisture: { min: 60, max: 90 },
    idealN: { min: 40, max: 70 },
    idealP: { min: 30, max: 50 },
    idealK: { min: 40, max: 60 },
  },
  {
    name: "Corn (Mais)",
    idealMoisture: { min: 40, max: 65 },
    idealN: { min: 60, max: 90 },
    idealP: { min: 35, max: 55 },
    idealK: { min: 35, max: 55 },
  },
  {
    name: "Cassava (Kamoteng Kahoy)",
    idealMoisture: { min: 30, max: 55 },
    idealN: { min: 30, max: 50 },
    idealP: { min: 25, max: 45 },
    idealK: { min: 50, max: 80 },
  },
];

// Helper function to calculate how close a metric is to its ideal range
function calculateMetricScore(value: number, min: number, max: number): number {
  if (value >= min && value <= max) return 100; // Perfect score
  if (value < min) {
    const penalty = ((min - value) / min) * 100;
    return Math.max(0, 100 - penalty);
  } else {
    const penalty = ((value - max) / max) * 100;
    return Math.max(0, 100 - penalty);
  }
}

export const rankCrops = query({
  args: {
    fieldId: v.id("fields"),
  },
  handler: async (ctx, args) => {
    // 1. Verify user authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("User not logged in");
    }

    // 2. Fetch the specific field parameters from the database
    const field = await ctx.db.get(args.fieldId);
    if (!field) {
      throw new ConvexError("Field record not found");
    }

    // 3. Compute suitability percentages for each crop profile
    const recommendations = CROP_PROFILES.map((crop) => {
      const moistureScore = calculateMetricScore(field.soilMoisture, crop.idealMoisture.min, crop.idealMoisture.max);
      const nScore = calculateMetricScore(field.nitrogen, crop.idealN.min, crop.idealN.max);
      const pScore = calculateMetricScore(field.phosphorus, crop.idealP.min, crop.idealP.max);
      const kScore = calculateMetricScore(field.potassium, crop.idealK.min, crop.idealK.max);

      // Average the 4 soil scores together for the final crop ranking
      const finalSuitabilityScore = Math.round((moistureScore + nScore + pScore + kScore) / 4);

      return {
        cropName: crop.name,
        suitabilityScore: finalSuitabilityScore,
        breakdown: {
          moisture: Math.round(moistureScore),
          nitrogen: Math.round(nScore),
          phosphorus: Math.round(pScore),
          potassium: Math.round(kScore),
        },
      };
    });

    // Sort options from highest suitability percentage to lowest
    return recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  },
});
