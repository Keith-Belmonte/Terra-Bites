import { test, expect } from "vitest";
import { assessSoilHealth } from "./soilHealth";

test("assessSoilHealth flags depleted states and accurately recommends nitrogen fixing rotation", () => {
  // Mocking a heavily depleted field profile
  const mockMetrics = JSON.parse('{"nitrogen":25,"phosphorus":30,"potassium":35,"soilMoisture":45}');
  
  const assessment = assessSoilHealth(mockMetrics);

  expect(assessment.condition).toBe("depleted");
  expect(assessment.rotationAdvisory).toContain("rotating field with Legumes");
  expect(assessment.remediationSteps[0]).toContain("leguminous green manure");
});

test("assessSoilHealth reports excellent condition for high premium nutrient profiles", () => {
  const excellentMetrics = JSON.parse('{"nitrogen":85,"phosphorus":65,"potassium":75,"soilMoisture":60}');
  
  const assessment = assessSoilHealth(excellentMetrics);

  expect(assessment.healthIndex).toBe(100);
  expect(assessment.condition).toBe("excellent");
});
