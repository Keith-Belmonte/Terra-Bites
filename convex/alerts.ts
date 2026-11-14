import { v } from "convex/values";
import { query } from "./_generated/server";

export interface FieldAlert {
  id: string;
  type: "danger" | "warning" | "info";
  title: string;
  message: string;
  metricKey: "soil" | "rain" | "temp";
}

/**
 * Pure agronomy logic function that scans field chemical parameters
 * and outputs an array of actionable dashboard notifications.
 */
export function generateAlertsForField(field: {
  name: string;
  soilMoisture: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}): FieldAlert[] {
  const alerts: FieldAlert[] = [];

  // 1. Critical Water Stress Monitoring
  if (field.soilMoisture < 30) {
    alerts.push({
      id: `${field.name}-moisture-low`,
      type: "danger",
      title: "Critical Water Stress",
      message: `${field.name} soil moisture is severely low (${field.soilMoisture}%). Immediate irrigation recommended.`,
      metricKey: "soil"
    });
  } else if (field.soilMoisture > 85) {
    alerts.push({
      id: `${field.name}-moisture-high`,
      type: "warning",
      title: "Water Logging Risk",
      message: `${field.name} moisture is highly saturated (${field.soilMoisture}%). Check drainage outlets.`,
      metricKey: "soil"
    });
  }

  // 2. NPK Nutrient Deficiency Safeguards
  if (field.nitrogen < 40) {
    alerts.push({
      id: `${field.name}-low-n`,
      type: "warning",
      title: "Nitrogen Deficiency",
      message: `Nitrogen levels are low (${field.nitrogen} ppm). Consider Urea or organic compost top-dressing.`,
      metricKey: "soil"
    });
  }
  
  if (field.phosphorus < 30) {
    alerts.push({
      id: `${field.name}-low-p`,
      type: "warning",
      title: "Phosphorus Deficiency",
      message: `Phosphorus levels are dipping (${field.phosphorus} ppm). Root development might be hindered.`,
      metricKey: "soil"
    });
  }

  return alerts;
}
