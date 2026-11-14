import { test, expect } from "vitest";
import { createAuditLog } from "./logs";

test("createAuditLog correctly formats structured entries and flags critical levels", () => {
  const log = createAuditLog("Isabela Plot", "alert_triggered", "Critical water stress detected", true);

  expect(log.level).toBe("critical");
  expect(log.action).toBe("ALERT_TRIGGERED");
  expect(log.details).toContain("Isabela Plot");
});

test("createAuditLog falls back to info level for nominal system synchronizations", () => {
  const log = createAuditLog("Bicol Rice Plot Alpha", "system_sync", "Nominal background sync completed");

  expect(log.level).toBe("info");
  expect(log.action).toBe("SYSTEM_SYNC");
});
