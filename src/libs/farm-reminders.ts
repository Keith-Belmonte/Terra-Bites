export type FarmReminderCategory =
  | "planting"
  | "irrigation"
  | "fertilizing"
  | "pest-scouting"
  | "harvest"
  | "other";

export type FarmReminder = {
  id: string;
  title: string;
  category: FarmReminderCategory;
  dueAt: string;
  completed: boolean;
  notifiedAt: string | null;
};

const STORAGE_KEY = "terrabites-farm-reminders";
const CHANGE_EVENT = "terrabites-farm-reminders";
const EMPTY_REMINDERS: FarmReminder[] = [];
let lastSerialized: string | null = null;
let cachedReminders = EMPTY_REMINDERS;

function isReminderCategory(value: unknown): value is FarmReminderCategory {
  return (
    value === "planting" ||
    value === "irrigation" ||
    value === "fertilizing" ||
    value === "pest-scouting" ||
    value === "harvest" ||
    value === "other"
  );
}

function isFarmReminder(value: unknown): value is FarmReminder {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const reminder = value as Record<string, unknown>;
  return (
    typeof reminder.id === "string" &&
    typeof reminder.title === "string" &&
    isReminderCategory(reminder.category) &&
    typeof reminder.dueAt === "string" &&
    Number.isFinite(Date.parse(reminder.dueAt)) &&
    typeof reminder.completed === "boolean" &&
    (reminder.notifiedAt === null ||
      (typeof reminder.notifiedAt === "string" &&
        Number.isFinite(Date.parse(reminder.notifiedAt))))
  );
}

export function getFarmReminders(): FarmReminder[] {
  if (typeof window === "undefined") return EMPTY_REMINDERS;
  let serialized: string | null;
  try {
    serialized = window.localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error("Could not read saved farm reminders.", error);
    return EMPTY_REMINDERS;
  }
  if (serialized === lastSerialized) return cachedReminders;
  lastSerialized = serialized;
  if (serialized === null) {
    cachedReminders = EMPTY_REMINDERS;
    return cachedReminders;
  }

  try {
    const parsed: unknown = JSON.parse(serialized);
    if (!Array.isArray(parsed) || !parsed.every(isFarmReminder)) {
      throw new Error("Saved reminder data has an invalid format.");
    }
    cachedReminders = parsed;
  } catch (error) {
    console.error("Could not parse saved farm reminders.", error);
    cachedReminders = EMPTY_REMINDERS;
  }
  return cachedReminders;
}

export function subscribeToFarmReminders(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function saveFarmReminders(reminders: FarmReminder[]) {
  if (typeof window === "undefined") {
    throw new Error("Farm reminders can only be saved in a browser.");
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function claimDueReminders(
  reminders: FarmReminder[],
  now: Date,
): { due: FarmReminder[]; updated: FarmReminder[] } {
  const nowTime = now.getTime();
  const due = reminders.filter(
    (reminder) =>
      !reminder.completed &&
      reminder.notifiedAt === null &&
      Date.parse(reminder.dueAt) <= nowTime,
  );
  if (due.length === 0) return { due, updated: reminders };
  const dueIds = new Set(due.map((reminder) => reminder.id));
  const notifiedAt = now.toISOString();
  return {
    due,
    updated: reminders.map((reminder) =>
      dueIds.has(reminder.id) ? { ...reminder, notifiedAt } : reminder,
    ),
  };
}

export function claimDueFarmReminders(now = new Date()): FarmReminder[] {
  const reminders = getFarmReminders();
  const claimed = claimDueReminders(reminders, now);
  if (claimed.due.length > 0) saveFarmReminders(claimed.updated);
  return claimed.due;
}
