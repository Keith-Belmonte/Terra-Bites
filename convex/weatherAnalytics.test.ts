import { test, expect } from "vitest";
import { aggregateWeatherData } from "./weatherAnalytics";

test("aggregateWeatherData correctly catches high drought risk parameters", () => {
  const mockTemps = JSON.parse("[36, 37, 35, 38, 36]") as number[];
  const mockRain = JSON.parse("[5, 10, 0, 2, 8]") as number[];

  const analysis = aggregateWeatherData(mockTemps, mockRain);

  expect(analysis.totalRainfall).toBe(25);
  expect(analysis.maxTemperature).toBe(38);
  expect(analysis.droughtRisk).toBe("high");
  expect(analysis.recommendation).toContain("High evaporation risk");
});

test("aggregateWeatherData remains nominal under standard balanced parameters", () => {
  const mockTemps = JSON.parse("[28, 29, 30, 29, 28]") as number[];
  const mockRain = JSON.parse("[30, 40, 35, 25, 30]") as number[];

  const analysis = aggregateWeatherData(mockTemps, mockRain);

  expect(analysis.totalRainfall).toBe(160);
  expect(analysis.droughtRisk).toBe("low");
});
