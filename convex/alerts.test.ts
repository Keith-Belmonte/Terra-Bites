import { test, expect } from "vitest";
import { generateAlertsForField } from "./alerts";

test("generateAlertsForField flags critical drought and low nitrogen parameters", () => {
  // Constructing a depleted, dry field profile
  const mockField = JSON.parse('{"name":"Backyard Plot","soilMoisture":15,"nitrogen":20,"phosphorus":50,"potassium":60}');

  const activeAlerts = generateAlertsForField(mockField);

  // It should find 2 problems: low moisture (danger) and low nitrogen (warning)
  expect(activeAlerts.length).toBe(2);
  expect(activeAlerts[0].type).toBe("danger");
  expect(activeAlerts[1].title).toBe("Nitrogen Deficiency");
});

test("generateAlertsForField stays completely empty for ideal, balanced farm states", () => {
  // Constructing a perfect field profile
  const perfectField = JSON.parse('{"name":"Main Rice Paddy","soilMoisture":65,"nitrogen":70,"phosphorus":60,"potassium":80}');

  const activeAlerts = generateAlertsForField(perfectField);

  // Balanced conditions should trigger zero alerts
  expect(activeAlerts.length).toBe(0);
});
