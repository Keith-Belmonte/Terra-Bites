import { Link } from "@tanstack/react-router";
import { CalendarDaysIcon, DropletIcon, TrendingUpIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import SuitabilityRing from "./suitability-ring.tsx";
import { suitabilityLabel } from "@/lib/mock/crops.ts";
import type { ScoredCrop } from "@/lib/recommend.ts";
import { cn } from "@/lib/utils.ts";

/** Compact card for horizontal scrollers on the dashboard. */
export function CropTile({ item }: { item: ScoredCrop }) {
  const { crop, score } = item;
  const reason = item.reasons.find((r) => r.kind === "good")?.text ?? crop.reason;
  return (
    <Link
      to="/crops/$cropId"
      params={{ cropId: crop.id }}
      className="group flex w-64 shrink-0 cursor-pointer snap-start flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative h-32 overflow-hidden">
        <img
          src={crop.image}
          alt={crop.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute top-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
          {score}% · {suitabilityLabel(score)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3 className="text-lg font-bold">{crop.name}</h3>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDaysIcon className="size-4" />
            {crop.plantingWindow}
          </p>
        </div>
        <p className="line-clamp-2 text-sm">{reason}</p>
      </div>
    </Link>
  );
}

/** Full-width list card used on the Crops screen. */
export function CropRow({ item }: { item: ScoredCrop }) {
  const { crop, score } = item;
  return (
    <Link
      to="/crops/$cropId"
      params={{ cropId: crop.id }}
      className="flex cursor-pointer gap-4 rounded-3xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      <img
        src={crop.image}
        alt={crop.name}
        loading="lazy"
        className="size-24 shrink-0 rounded-2xl object-cover sm:size-28"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold">{crop.name}</h3>
            <p className="truncate text-sm text-muted-foreground">
              {crop.localName} · {crop.type}
            </p>
          </div>
          <SuitabilityRing score={score} size={50} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="gap-1">
            <TrendingUpIcon /> {crop.yieldLevel} yield
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <DropletIcon /> {crop.water} water
          </Badge>
        </div>
        <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
          <CalendarDaysIcon className="size-4" />
          Plant {crop.plantingWindow}
        </p>
      </div>
    </Link>
  );
}

export function LevelBadge({
  level,
  className,
}: {
  level: "Low" | "Moderate" | "High";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-bold",
        level === "High" && "bg-destructive/12 text-destructive",
        level === "Moderate" && "bg-accent/40 text-accent-foreground dark:bg-accent/20 dark:text-accent",
        level === "Low" && "bg-secondary text-secondary-foreground",
        className,
      )}
    >
      {level} risk
    </span>
  );
}
