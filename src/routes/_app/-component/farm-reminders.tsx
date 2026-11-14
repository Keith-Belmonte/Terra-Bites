import { useState, useSyncExternalStore } from "react";
import { format } from "date-fns";
import { BellIcon, CheckIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import {
  getFarmReminders,
  saveFarmReminders,
  subscribeToFarmReminders,
  type FarmReminderCategory,
} from "@/lib/farm-reminders.ts";
import type { FarmReminder } from "@/lib/farm-reminders.ts";

const EMPTY_REMINDERS: FarmReminder[] = [];

const CATEGORIES: Array<{ value: FarmReminderCategory; label: string }> = [
  { value: "planting", label: "Planting" },
  { value: "irrigation", label: "Irrigation" },
  { value: "fertilizing", label: "Fertilizing" },
  { value: "pest-scouting", label: "Pest scouting" },
  { value: "harvest", label: "Harvest" },
  { value: "other", label: "Other" },
];

export default function FarmReminders() {
  const reminders = useSyncExternalStore(
    subscribeToFarmReminders,
    getFarmReminders,
    () => EMPTY_REMINDERS,
  );
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<FarmReminderCategory>("irrigation");
  const [dueAt, setDueAt] = useState("");
  const sortedReminders = [...reminders].sort((left, right) =>
    left.dueAt.localeCompare(right.dueAt),
  );

  function save(updates: FarmReminder[]): boolean {
    try {
      saveFarmReminders(updates);
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown browser error";
      toast.error(`Could not save your reminder: ${message}`);
      return false;
    }
  }

  function addReminder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedDate = new Date(dueAt);
    if (!title.trim() || !Number.isFinite(parsedDate.getTime())) {
      toast.error("Add a task name and a valid date and time.");
      return;
    }
    const id = globalThis.crypto?.randomUUID?.();
    if (!id) {
      toast.error("This browser cannot create a secure reminder ID.");
      return;
    }
    const reminder: FarmReminder = {
      id,
      title: title.trim(),
      category,
      dueAt: parsedDate.toISOString(),
      completed: false,
      notifiedAt: null,
    };
    if (!save([...getFarmReminders(), reminder])) return;
    setTitle("");
    setDueAt("");
    toast.success("Farm reminder saved on this device.");
  }

  function updateReminder(id: string, patch: Partial<FarmReminder>) {
    save(
      getFarmReminders().map((reminder) =>
        reminder.id === id ? { ...reminder, ...patch } : reminder,
      ),
    );
  }

  function removeReminder(id: string) {
    save(getFarmReminders().filter((reminder) => reminder.id !== id));
  }

  return (
    <section className="px-4 py-4">
      <div className="flex items-start gap-3">
        <BellIcon className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <h3 className="font-semibold">Farm task reminders</h3>
          <p className="text-sm text-muted-foreground">
            Add planting, irrigation, fertilizer, pest-check, or harvest tasks.
          </p>
        </div>
      </div>
      <form onSubmit={addReminder} className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Task
          <input
            required
            maxLength={100}
            value={title}
            onChange={(event) => setTitle(event.currentTarget.value)}
            placeholder="e.g. Check rice field water level"
            className="h-11 rounded-xl border border-input bg-background px-3 font-normal"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Task type
          <select
            value={category}
            onChange={(event) => {
              const selected = CATEGORIES.find(
                (item) => item.value === event.currentTarget.value,
              );
              if (selected) setCategory(selected.value);
            }}
            className="h-11 rounded-xl border border-input bg-background px-3 font-normal"
          >
            {CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold sm:col-span-2">
          Due date and time
          <input
            required
            type="datetime-local"
            value={dueAt}
            onChange={(event) => setDueAt(event.currentTarget.value)}
            className="h-11 rounded-xl border border-input bg-background px-3 font-normal"
          />
        </label>
        <Button
          type="submit"
          className="min-h-11 sm:col-span-2 sm:justify-self-start"
        >
          Add reminder
        </Button>
      </form>

      {sortedReminders.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {sortedReminders.map((reminder) => (
            <li
              key={reminder.id}
              className="flex flex-wrap items-center gap-3 rounded-xl bg-muted p-3"
            >
              <div className="min-w-0 flex-1">
                <p
                  className={`font-semibold ${reminder.completed ? "text-muted-foreground line-through" : ""}`}
                >
                  {reminder.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {CATEGORIES.find((item) => item.value === reminder.category)
                    ?.label ?? "Farm task"}{" "}
                  · {format(new Date(reminder.dueAt), "MMM d, yyyy · h:mm a")}
                  {reminder.notifiedAt ? " · Reminder shown" : ""}
                </p>
              </div>
              {!reminder.completed && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    updateReminder(reminder.id, { completed: true })
                  }
                  aria-label={`Mark ${reminder.title} complete`}
                >
                  <CheckIcon /> Done
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeReminder(reminder.id)}
                aria-label={`Delete ${reminder.title}`}
              >
                <Trash2Icon />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
          No farm tasks scheduled yet.
        </p>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        Reminders are saved only on this device. When TerraBites is open, a due
        task appears in the app and as a browser notification if permission is
        granted. Closed-browser push needs a separate push service.
      </p>
    </section>
  );
}
