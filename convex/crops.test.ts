import { test, expect } from "vitest";
import { calculateMetricScore } from "./crops";

test("Perfect score within ideal crop conditions", () => {
  const score = calculateMetricScore(75, 60, 90);
  expect(score).toBe(100);
});

test("Graceful penalty adjustment for dry environments", () => {
  const score = calculateMetricScore(30, 60, 90);
  expect(score).toBe(50);
});

test("Zero values safe-guard confirmation", () => {
  const score = calculateMetricScore(0, 0, 50);
  expect(score).toBe(100);
});
