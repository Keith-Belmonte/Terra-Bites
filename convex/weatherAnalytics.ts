export interface WeatherAnalysisResult {
  totalRainfall: number;
  maxTemperature: number;
  minTemperature: number;
  droughtRisk: "low" | "moderate" | "high";
  recommendation: string;
}

/**
 * Agronomic weather module that runs calculations over historical arrays
 * to discover climate pattern anomalies.
 */
export function aggregateWeatherData(
  temperatures: number[],
  rainfall: number[]
): WeatherAnalysisResult {
  if (temperatures.length === 0 || rainfall.length === 0) {
    return {
      totalRainfall: 0,
      maxTemperature: 0,
      minTemperature: 0,
      droughtRisk: "low",
      recommendation: "Awaiting sufficient climate data streams.",
    };
  }

  // Calculate sum of rainfall and peak temperatures
  const totalRainfall = Math.round(rainfall.reduce((sum, val) => sum + val, 0));
  const maxTemperature = Math.max(...temperatures);
  const minTemperature = Math.min(...temperatures);

  // Analyze drought risks based on consecutive low rainfall and sustained heat
  let droughtRisk: "low" | "moderate" | "high" = "low";
  let recommendation = "Climate parameters remain ideal for routine crop cultivation.";

  if (maxTemperature > 35 && totalRainfall < 50) {
    droughtRisk = "high";
    recommendation = "High evaporation risk! Minimize midday exposure and increase supplemental crop irrigation.";
  } else if (maxTemperature > 30 && totalRainfall < 100) {
    droughtRisk = "moderate";
    recommendation = "Slight soil drying trend observed. Monitor shallow root zones closely.";
  } else if (totalRainfall > 250) {
    recommendation = "Excessive moisture volumes detected. Verify active field drainage gates.";
  }

  return {
    totalRainfall,
    maxTemperature,
    minTemperature,
    droughtRisk,
    recommendation,
  };
}
