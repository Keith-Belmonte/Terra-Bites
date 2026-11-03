import type { ReactElement, ReactNode } from "react";
import { CloudSunIcon, LayersIcon, RotateCcwIcon, TargetIcon } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Slider } from "@/components/ui/slider.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet.tsx";
import { useFarm } from "@/components/providers/farm-context.tsx";
import { useRecommendations } from "@/hooks/use-recommendation.ts";
import { getLocation } from "@/lib/format.ts";
import { CROP_FILTERS, type Level, type SoilType } from "@/lib/mock/crops.ts";
import {
  PRIORITY_KEYS,
  PRIORITY_META,
  type Drainage,
  type PriorityWeight,
  type SoilInfo,
} from "@/lib/recommend.ts";
import { cn } from "@/lib/utils.ts";

const DRAINAGE: Drainage[] = ["Poor", "Moderate", "Good"];
const FERTILITY: Level[] = ["Low", "Moderate", "High"];
const WEIGHT_LABELS: Array<{ value: PriorityWeight; label: string }> = [
  { value: 0, label: "Not needed" },
  { value: 1, label: "Some" },
  { value: 2, label: "Very" },
];

/** Bottom sheet for editing soil, priorities and irrigation. */
export default function AdjustSheet({
  trigger,
  children,
}: {
  trigger: ReactElement;
  children: ReactNode;
}) {
  const farm = useFarm();
  const { inputs, soilSource, ranked } = useRecommendations();
  const loc = getLocation(farm.locationId);
  const soil = inputs.soil;
  const setSoil = (patch: Partial<SoilInfo>) => farm.setSoilTest({ ...soil, ...patch });

  return (
    <Sheet>
      <SheetTrigger render={trigger}>{children}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[88vh] overflow-y-auto rounded-t-3xl md:mx-auto md:max-w-xl"
      >
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl">Adjust recommendations</SheetTitle>
          <SheetDescription>
            Scores combine your soil, the weather, each crop's needs and your goals.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4">
          {/* Soil */}
          <Group icon={LayersIcon} title="Local soil information">
            <p className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
              <span>
                {soilSource === "test"
                  ? "Using your soil test"
                  : `From the ${loc.province} soil survey`}
              </span>
              {soilSource === "test" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-bold"
                  onClick={() => farm.setSoilTest(null)}
                >
                  <RotateCcwIcon /> Use survey
                </Button>
              )}
            </p>
            <Field label="Soil type">
              <ChipRow
                options={CROP_FILTERS.soil}
                value={soil.type}
                onChange={(v: SoilType) => setSoil({ type: v })}
              />
            </Field>
            <Field label={`Soil pH: ${soil.ph.toFixed(1)}`} hint={phHint(soil.ph)}>
              <Slider
                min={4.5}
                max={8.5}
                step={0.1}
                value={soil.ph}
                onValueChange={(v) => {
                  if (typeof v === "number") setSoil({ ph: v });
                }}
                className="py-3 [&_[data-slot=slider-thumb]]:size-6"
                aria-label="Soil pH"
              />
            </Field>
            <Field label="Drainage">
              <ChipRow options={DRAINAGE} value={soil.drainage} onChange={(v) => setSoil({ drainage: v })} />
            </Field>
            <Field label="Fertility">
              <ChipRow options={FERTILITY} value={soil.fertility} onChange={(v) => setSoil({ fertility: v })} />
            </Field>
          </Group>

          {/* Priorities */}
          <Group icon={TargetIcon} title="Your priorities">
            {PRIORITY_KEYS.map((k) => (
              <div key={k} className="flex flex-col gap-2">
                <div>
                  <p className="font-semibold">{PRIORITY_META[k].label}</p>
                  <p className="text-xs text-muted-foreground">{PRIORITY_META[k].hint}</p>
                </div>
                <ChipRow
                  options={WEIGHT_LABELS.map((w) => w.value)}
                  value={farm.priorities[k]}
                  labels={(v) => WEIGHT_LABELS[v].label}
                  onChange={(v) => farm.setPriorities({ ...farm.priorities, [k]: v })}
                />
              </div>
            ))}
          </Group>

          {/* Weather & climate */}
          <Group icon={CloudSunIcon} title="Weather & climate">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Stat label="Season" value={inputs.climate.season} />
              <Stat label="Average temperature" value={`${inputs.climate.avgTemp} °C`} />
              <Stat label="Rain, next 30 days" value={`${inputs.climate.rainOutlook30d} mm`} />
              <Stat label="Soil moisture" value={`${inputs.climate.soilMoisture}%`} />
            </div>
            <p className="text-xs text-muted-foreground">
              From NASA POWER, GPM and SMAP for {loc.city} · sample data
            </p>
            <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl bg-muted px-4">
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">I can irrigate this field</span>
                <span className="block text-xs text-muted-foreground">
                  Adds water when rain falls short
                </span>
              </span>
              <Switch
                checked={farm.irrigation}
                onCheckedChange={farm.setIrrigation}
                className="scale-125"
              />
            </label>
          </Group>
        </div>

        <SheetFooter>
          <SheetClose
            render={<Button size="lg" className="h-12 rounded-xl font-bold" />}
          >
            Show results · {ranked[0]?.crop.name} is top
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function phHint(ph: number): string {
  if (ph < 5.5) return "Acidic. Liming can help most crops.";
  if (ph > 7.5) return "Alkaline. Some nutrients get locked up.";
  return "Good range for most crops.";
}

function Group({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof LayersIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="flex items-center gap-2 pb-3 font-serif text-lg font-semibold">
        <Icon className="size-5 text-primary" />
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="text-sm font-bold">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted p-3">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}

function ChipRow<T extends string | number>({
  options,
  value,
  onChange,
  labels,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  labels?: (v: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={o === value}
          onClick={() => onChange(o)}
          className={cn(
            "h-11 cursor-pointer rounded-full border px-4 text-sm font-bold transition-colors",
            o === value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card hover:bg-muted",
          )}
        >
          {labels ? labels(o) : o}
        </button>
      ))}
    </div>
  );
}
