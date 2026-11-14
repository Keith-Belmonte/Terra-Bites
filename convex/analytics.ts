/**
 * Analytical model translating past moisture tracking arrays into velocity trends.
 */
export function calculateSoilTrend(moistureSnapshots: number[]): {
  average: number;
  direction: "stable" | "drying" | "enriching";
  severity: "none" | "moderate" | "critical";
  message: string;
} {
  if (moistureSnapshots.length < 2) {
    return { average: 50, direction: "stable", severity: "none", message: "Awaiting baseline tracking records." };
  }

  // Calculate moving average
  const total = moistureSnapshots.reduce((sum, val) => sum + val, 0);
  const average = Math.round(total / moistureSnapshots.length);

  // Measure delta velocity (last index vs first index)
  const delta = moistureSnapshots[moistureSnapshots.length - 1] - moistureSnapshots[0];

  let direction: "stable" | "drying" | "enriching" = "stable";
  let severity: "none" | "moderate" | "critical" = "none";
  let message = "Soil composition stability index is nominal.";

  if (delta < -15) {
    direction = "drying";
    severity = Math.abs(delta) > 30 ? "critical" : "moderate";
    message = severity === "critical" 
      ? "Flash drought vector detected! Moisture levels are falling rapidly." 
      : "Soil is losing saturation. Monitor irrigation patterns.";
  } else if (delta > 15) {
    direction = "enriching";
    message = "Soil water absorption velocity is increasing.";
  }

  return { average, direction, severity, message };
}
