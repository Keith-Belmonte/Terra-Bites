import type { FarmAlert } from "@/lib/mock/conditions.ts";
import { cn } from "@/lib/utils.ts";

const TONE: Record<FarmAlert["severity"], string> = {
  high: "border-destructive/30 bg-destructive/8 [&_[data-icon]]:bg-destructive [&_[data-icon]]:text-white",
  medium:
    "border-accent/60 bg-accent/15 [&_[data-icon]]:bg-accent [&_[data-icon]]:text-accent-foreground",
  low: "border-border bg-card [&_[data-icon]]:bg-secondary [&_[data-icon]]:text-secondary-foreground",
};

const LABEL: Record<FarmAlert["severity"], string> = {
  high: "High",
  medium: "Medium",
  low: "Heads up",
};

export default function AlertCard({ alert }: { alert: FarmAlert }) {
  const Icon = alert.icon;
  return (
    <article
      className={cn("flex gap-3 rounded-2xl border p-4", TONE[alert.severity])}
    >
      <span
        data-icon
        className="grid size-11 shrink-0 place-items-center rounded-xl"
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <h3 className="font-bold">{alert.title}</h3>
        </div>
        <p className="pt-0.5 text-sm text-foreground/80">{alert.detail}</p>
        <p className="pt-1.5 text-xs font-semibold text-muted-foreground">
          {LABEL[alert.severity]} · {alert.when}
        </p>
      </div>
    </article>
  );
}
