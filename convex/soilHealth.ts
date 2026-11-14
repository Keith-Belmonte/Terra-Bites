export interface SoilHealthAssessment {
  healthIndex: number;
  condition: "excellent" | "good" | "depleted" | "critical";
  rotationAdvisory: string;
  remediationSteps: string[];
}

/**
 * Pure agronomic engine that calculates an aggregate Soil Health Index (SHI)
 * and generates restorative crop rotation roadmaps.
 */
export function assessSoilHealth(metrics: {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  soilMoisture: number;
}): SoilHealthAssessment {
  // Normalize parameters into a basic weighted 100-point scalar index
  const nScore = Math.min(100, (metrics.nitrogen / 80) * 100);
  const pScore = Math.min(100, (metrics.phosphorus / 60) * 100);
  const kScore = Math.min(100, (metrics.potassium / 70) * 100);
  
  const healthIndex = Math.round((nScore + pScore + kScore) / 3);

  let condition: "excellent" | "good" | "depleted" | "critical" = "good";
  let rotationAdvisory = "Current soil conditions support consecutive grain crop cultivation cycles.";
  const remediationSteps: string[] = [];

  if (healthIndex > 85) {
    condition = "excellent";
  } else if (healthIndex < 40) {
    condition = "critical";
  } else if (healthIndex < 60) {
    condition = "depleted";
  }

  // Trigger algorithmic crop rotation logic based on specific nutrient deficiencies
  if (metrics.nitrogen < 45) {
    rotationAdvisory = "CRITICAL NITROGEN DEPLETION: Highly recommend rotating field with Legumes (Munggo bean or peanut) to naturally fix atmospheric nitrogen.";
    remediationSteps.push("Incorporate leguminous green manure crops into the soil layout.");
  } else if (metrics.phosphorus < 35) {
    rotationAdvisory = "PHOSPHORUS DEFICIENCY VECOR: Consider planting deep-rooting cover crops to extract subsoil minerals before next grain sequence.";
    remediationSteps.push("Apply localized rock phosphate or organic bone meal dressings.");
  }

  if (metrics.soilMoisture < 35) {
    remediationSteps.push("Implement mulch sheeting layers to minimize ambient surface evaporation.");
  }

  return {
    healthIndex,
    condition,
    rotationAdvisory,
    remediationSteps: remediationSteps.length > 0 ? remediationSteps : ["Maintain current nominal fertilization protocols."],
  };
}
