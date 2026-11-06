import { test, expect } from "vitest";
import { adaptExternalWeatherData } from "./weather";

test("adaptExternalWeatherData correctly averages climate parameters and predicts Wet Season", () => {
  const mockTemps = JSON.parse("[29, 30, 31]");
  const mockRain = JSON.parse("[50, 50, 50]");

  const data = adaptExternalWeatherData(mockTemps, mockRain);

  expect(data.avgTemp).toBe(30);
  expect(data.rainOutlook30d).toBe(150);
  expect(data.season).toBe("Wet season");
});

test("adaptExternalWeatherData predicts Dry Season when rainfall totals drop below threshold", () => {
  const mockTemps = JSON.parse("[28, 29, 30]");
  const mockRain = JSON.parse("[10, 10, 10]");

  const data = adaptExternalWeatherData(mockTemps, mockRain);

  expect(data.season).toBe("Dry season");
});
