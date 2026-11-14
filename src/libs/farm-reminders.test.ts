import { describe, expect, test } from "vitest";
import { claimDueReminders, type FarmReminder } from "@/lib/farm-reminders.ts";

const makeReminder = (patch: Partial<FarmReminder> = {}): FarmReminder => ({
  id: "field-1",
  title: "Check irrigation",
  category: "irrigation",
  dueAt: "2026-11-14T08:00:00.000Z",
  completed: false,
  notifiedAt: null,
  ...patch,
});

describe("farm reminders", () => {
  test("claims only overdue incomplete reminders once", () => {
    const reminders = [
      makeReminder(),
      makeReminder({
        id: "later",
        dueAt: "2026-11-16T08:00:00.000Z",
      }),
      makeReminder({
        id: "done",
        completed: true,
      }),
      makeReminder({
        id: "already-notified",
        notifiedAt: "2026-11-14T07:00:00.000Z",
      }),
    ];

    const claimed = claimDueReminders(
      reminders,
      new Date("2026-11-15T08:00:00.000Z"),
    );

    expect(claimed.due.map(({ id }) => id)).toEqual(["field-1"]);
    expect(claimed.updated[0].notifiedAt).toBe("2026-11-15T08:00:00.000Z");
    expect(
      claimDueReminders(claimed.updated, new Date("2026-11-15T09:00:00.000Z"))
        .due,
    ).toEqual([]);
  });
});
