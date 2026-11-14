import {
  CloudSunIcon,
  DnaIcon,
  LayersIcon,
  SlidersVerticalIcon,
  TargetIcon,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useFarm } from "@/components/providers/farm-context.tsx";
import { useRecommendations } from "@/hooks/use-recommendation.ts";
import { CROPS } from "@/lib/crops.ts";
import { DEFAULT_SOIL, PRIORITY_KEYS, PRIORITY_META } from "@/lib/recommend.ts";
import AdjustSheet from "./adjust-sheet.tsx";

/** Summary of the four inputs behind every crop score. */
export default function BasisPanel() {
  const { inputs, soilSource } = useRecommendations();
  const { soilTest, location, priorities: farmerPriorities, irrigation } = useFarm();
  const soil = inputs?.soil ?? soilTest ?? DEFAULT_SOIL;
  const climate = inputs?.climate;
  const priorities = inputs?.priorities ?? farmerPriorities;
  const top = PRIORITY_KEYS.filter((k) => priorities[k] > 0)
    .sort((a, b) => priorities[b] - priorities[a])
    .map((k) => PRIORITY_META[k].label);

  const tiles: Array<{ icon: LucideIcon; title: string; value: string; note: string }> = [
    {
      icon: LayersIcon,
      title: "Local soil",
      value: `${soil.type} · pH ${soil.ph.toFixed(1)}`,
<<<<<<< HEAD
      note: `${soil.drainage} drainage · ${soil.fertility.toLowerCase()} fertility · ${
        soilSource === "entered"
          ? "entered texture; other values may be regional"
          : "regional survey"
      }`,
=======
      note: `${soil.drainage} drainage · ${soil.fertility.toLowerCase()} fertility · ${soilSource === "test" ? "your soil test" : "general estimate; add a soil test"}`,
>>>>>>> main
    },
    {
      icon: CloudSunIcon,
      title: "Weather & climate",
      value: climate ? `${climate.avgTemp.toFixed(1)} °C average` : location ? "Loading live forecast" : "Set a farm location",
      note: climate
        ? `${climate.rainOutlook7d.toFixed(1)} mm forecast over 7 days · ${irrigation ? "irrigated" : "rain-fed"}`
        : "From Open-Meteo forecast data",
    },
    {
      icon: TargetIcon,
      title: "Your priorities",
      value: top[0] ?? "No preference",
      note: top.length > 1 ? `Also: ${top.slice(1).join(", ")}` : "Set what matters most to you",
    },
    {
      icon: DnaIcon,
      title: "Crop characteristics",
      value: `${CROPS.length} crops compared`,
      note: "Crop traits are compared with your entered soil and local weather data",
    },
  ];

  return (
    <section className="rounded-3xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 pb-3">
        <div className="min-w-0">
          <h2 className="font-serif text-lg font-semibold">What your scores are based on</h2>
          <p className="text-sm text-muted-foreground">
            Scores are heuristic comparisons, not yield probabilities. Change any input and the list updates.
          </p>
        </div>
        <AdjustSheet
          trigger={
            <Button size="lg" className="h-11 shrink-0 rounded-full px-4 font-bold" />
          }
        >
          <SlidersVerticalIcon />
          Adjust
        </AdjustSheet>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {tiles.map(({ icon: Icon, title, value, note }) => (
          <div key={title} className="min-w-0 rounded-2xl bg-muted p-3">
            <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
              <Icon className="size-4 shrink-0 text-primary" />
              {title}
            </p>
            <p className="pt-1 text-sm leading-snug font-extrabold break-words">{value}</p>
            <p className="line-clamp-2 text-xs text-muted-foreground">{note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
