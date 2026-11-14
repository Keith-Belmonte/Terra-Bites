import { useEffect } from "react";
import { toast } from "sonner";
import { claimDueFarmReminders } from "@/lib/farm-reminders.ts";

export default function FarmReminderScheduler() {
  useEffect(() => {
    function checkReminders() {
      let dueReminders;
      try {
        dueReminders = claimDueFarmReminders();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown browser error";
        toast.error(`Could not check farm reminders: ${message}`);
        return;
      }
      for (const reminder of dueReminders) {
        toast.info(`Farm reminder: ${reminder.title}`, {
          description: `${reminder.category.replaceAll("-", " ")} is due now.`,
        });
        if ("Notification" in window && Notification.permission === "granted") {
          try {
            new Notification(reminder.title, {
              body: "Your farm reminder is due.",
              tag: `terrabites-${reminder.id}`,
            });
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Unknown browser error";
            toast.error(`Could not show browser notification: ${message}`);
          }
        }
      }
    }

    checkReminders();
    const intervalId = window.setInterval(checkReminders, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  return null;
}
