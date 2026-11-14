import { test, expect } from "vitest";
import { calculateSoilTrend } from "./analytics";

test("calculateSoilTrend correctly catches a rapid drying vector", () => {
  // Simulating a plot dropping from 70% moisture down to 35% moisture
  const dryingHistory = JSON.parse("[70, 60, 50, 35]") as number[];
  const trend = calculateSoilTrend(dryingHistory);

  expect(trend.direction).toBe("drying");
  expect(trend.severity).toBe("critical");
});

test("calculateSoilTrend reports stable on small baseline shifts", () => {
  const stableHistory = JSON.parse("[55, 56, 54, 55]") as number[];
  const trend = calculateSoilTrend(stableHistory);

  expect(trend.direction).toBe("stable");
  expect(trend.severity).toBe("none");
});
