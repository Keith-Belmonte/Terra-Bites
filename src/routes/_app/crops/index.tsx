import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MapPinIcon, SearchXIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";
import ScreenHeader from "@/components/ui/screen-header.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty.tsx";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet.tsx";
import { CropRow } from "@/components/farm/crop-card.tsx";
import { useRecommendations } from "@/hooks/use-recommendation.ts";
import BasisPanel from "./-component/basic-panel.tsx";
import { useFarm } from "@/components/providers/farm-context.tsx";
import {
  CROPS,
  CROP_FILTERS,
  FILTER_LABELS,
  type Crop,
  type CropFilterKey,
} from "@/lib/mock/crops.ts";
import { getLocation } from "@/lib/format.ts";
import { cn } from "@/lib/utils.ts";

export const Route = createFileRoute("/_app/crops/")({
  head: () => ({ meta: [{ title: "Crop Recommendations | TerraBites" }] }),
  component: Crops,
});

type Filters = Record<CropFilterKey, string[]>;

const EMPTY_FILTERS: Filters = {
  type: [],
  season: [],
  water: [],
  soil: [],
  duration: [],
};

const FILTER_KEYS = Object.keys(CROP_FILTERS) as CropFilterKey[];

function cropValues(crop: Crop, key: CropFilterKey): string[] {
  switch (key) {
    case "type":
      return [crop.type];
    case "season":
      return crop.seasons;
    case "water":
      return [crop.water];
    case "soil":
      return crop.soils;
    case "duration":
      return [crop.duration];
  }
}

function matches(crop: Crop, filters: Filters): boolean {
  return FILTER_KEYS.every((key) => {
    const selected = filters[key];
    return (
      selected.length === 0 ||
      cropValues(crop, key).some((v) => selected.includes(v))
    );
  });
}

function Crops() {
  const { locationId } = useFarm();
  const { ranked } = useRecommendations();
  const loc = getLocation(locationId);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [quickType, setQuickType] = useState<string | null>(null);

  const active = { ...filters, type: quickType ? [quickType] : filters.type };
  const list = ranked.filter((r) => matches(r.crop, active));
  const activeCount = FILTER_KEYS.reduce((n, k) => n + active[k].length, 0);

  const toggle = (key: CropFilterKey, value: string) => {
    if (key === "type") setQuickType(null);
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  const clearAll = () => {
    setFilters(EMPTY_FILTERS);
    setQuickType(null);
  };

  return (
    <>
      <ScreenHeader
        title="Crops"
        subtitle={
          <span className="inline-flex items-center gap-1">
            <MapPinIcon className="size-3.5" /> Suited to {loc.city}
          </span>
        }
        actions={
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="secondary"
                  size="lg"
                  className="h-11 rounded-full px-4 font-bold"
                />
              }
            >
              <SlidersHorizontalIcon />
              Filters
              {activeCount > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-primary text-[11px] text-primary-foreground">
                  {activeCount}
                </span>
              )}
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="max-h-[85vh] overflow-y-auto rounded-t-3xl md:mx-auto md:max-w-xl"
            >
              <SheetHeader>
                <SheetTitle className="font-serif text-2xl">Filter crops</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-5 px-4">
                {FILTER_KEYS.map((key) => (
                  <fieldset key={key}>
                    <legend className="pb-2 text-sm font-bold">
                      {FILTER_LABELS[key]}
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {CROP_FILTERS[key].map((value) => (
                        <Chip
                          key={value}
                          selected={active[key].includes(value)}
                          onClick={() => toggle(key, value)}
                        >
                          {value}
                        </Chip>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>
              <SheetFooter className="flex-row">
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-12 flex-1 rounded-xl font-bold"
                  onClick={clearAll}
                >
                  Clear all
                </Button>
                <SheetClose
                  render={
                    <Button size="lg" className="h-12 flex-1 rounded-xl font-bold" />
                  }
                >
                  Show {list.length} crops
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        }
      />
      <div className="mx-auto max-w-3xl px-4 pt-4 md:px-8">
        <BasisPanel />

        {/* Quick type chips */}
        <div className="-mx-4 flex pt-4 gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          <Chip
            selected={quickType === null && filters.type.length === 0}
            onClick={() => {
              setQuickType(null);
              setFilters((p) => ({ ...p, type: [] }));
            }}
          >
            All crops
          </Chip>
          {CROP_FILTERS.type.map((t) => (
            <Chip
              key={t}
              selected={quickType === t}
              onClick={() => {
                setFilters((p) => ({ ...p, type: [] }));
                setQuickType(quickType === t ? null : t);
              }}
            >
              {t}
            </Chip>
          ))}
        </div>

        {activeCount > 0 && (
          <div className="flex items-center justify-between pt-3 text-sm">
            <span className="text-muted-foreground">
              {list.length} of {CROPS.length} crops match
            </span>
            <Button variant="ghost" size="sm" onClick={clearAll} className="font-bold">
              <XIcon /> Clear filters
            </Button>
          </div>
        )}

        {list.length === 0 ? (
          <Empty className="mt-6 rounded-3xl border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchXIcon />
              </EmptyMedia>
              <EmptyTitle>No crops match these filters</EmptyTitle>
              <EmptyDescription>
                Try removing a filter to see more options for your area.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={clearAll}>Clear filters</Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="flex flex-col gap-3 pt-4">
            {list.map((item) => (
              <CropRow key={item.crop.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "h-11 shrink-0 cursor-pointer rounded-full border px-4 text-sm font-bold transition-colors",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
