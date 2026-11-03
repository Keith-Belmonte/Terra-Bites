import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import {
  BotMessageSquareIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  CircleAlertIcon,
  DnaIcon,
  ClockIcon,
  DropletIcon,
  LayersIcon,
  SatelliteIcon,
  ShieldAlertIcon,
  TrendingUpIcon,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import ScreenHeader from "@/components/ui/screen-header.tsx";
import SuitabilityRing from "@/components/farm/suitability-ring.tsx";
import { LevelBadge } from "@/components/farm/crop-card.tsx";
import { getCrop, suitabilityLabel } from "@/lib/mock/crops.ts";
import { useRecommendations } from "@/hooks/use-recommendation.ts";
import { cn } from "@/lib/utils.ts";

export const Route = createFileRoute("/_app/crops/$cropId")({
  loader: ({ params }) => {
    const crop = getCrop(params.cropId);
    if (!crop) throw notFound();
    return { name: crop.name };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.name ?? "Crop"} | TerraBites` }],
  }),
  component: CropDetail,
});

function CropDetail() {
  const { cropId } = Route.useParams();
  const crop = getCrop(cropId);
  if (!crop) throw notFound();
  const scored = useRecommendations().byId.get(crop.id);
  if (!scored) throw notFound();
  const { score, breakdown, reasons } = scored;
  const t = crop.traits;

  const traits = [
    { label: "Soil pH", value: `${t.phMin}–${t.phMax}` },
    { label: "Temperature", value: `${t.tempMin}–${t.tempMax} °C` },
    { label: "Drought tolerance", value: t.droughtTolerance },
    { label: "Growth time", value: crop.duration },
    { label: "Farming cost", value: t.inputCost },
    { label: "Market value", value: t.marketValue },
  ];
  const bars = [
    { label: "Local soil", value: breakdown.soil },
    { label: "Weather & climate", value: breakdown.climate },
    { label: "Your priorities", value: breakdown.priorities },
  ];

  const facts: Array<{ icon: LucideIcon; label: string; value: string }> = [
    { icon: TrendingUpIcon, label: "Expected yield", value: crop.expectedYield },
    { icon: DropletIcon, label: "Water need", value: crop.water },
    { icon: ClockIcon, label: "Harvest in", value: crop.daysToHarvest },
    { icon: LayersIcon, label: "Best soil", value: crop.soils.join(", ") },
  ];

  return (
    <>
      <ScreenHeader title={crop.name} subtitle={crop.localName} backTo="/crops" />
      <div className="mx-auto max-w-3xl md:px-8 md:pt-6">
        <div className="relative h-60 overflow-hidden md:h-72 md:rounded-[2rem]">
          <img src={crop.image} alt={crop.name} className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
            <div>
              <p className="text-sm font-semibold text-white/80">{crop.type}</p>
              <h2 className="font-serif text-4xl font-semibold">{crop.name}</h2>
            </div>
            <div className="rounded-full bg-white/95 p-1 text-black">
              <SuitabilityRing score={score} size={64} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-4 pt-4 md:px-0">
          <section className="rounded-3xl bg-primary p-5 text-primary-foreground">
            <p className="flex items-center gap-2 text-sm font-semibold text-primary-foreground/80">
              <CalendarDaysIcon className="size-4" />
              Recommended planting period
            </p>
            <p className="pt-1 font-serif text-3xl font-semibold">
              {crop.plantingWindow}
            </p>
            <p className="pt-2 text-primary-foreground/90">
              {suitabilityLabel(score)} match. {crop.reason}
            </p>
          </section>

          <div className="grid grid-cols-2 gap-3">
            {facts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-border bg-card p-4">
                <Icon className="size-5 text-primary" />
                <p className="pt-2 text-xs font-semibold text-muted-foreground">
                  {label}
                </p>
                <p className="font-bold">{value}</p>
              </div>
            ))}
          </div>

          <section className="rounded-3xl border border-border bg-card p-5">
            <h2 className="font-serif text-xl font-semibold">Why this score</h2>
            <div className="flex flex-col gap-3 pt-3">
              {bars.map((b) => (
                <div key={b.label}>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{b.label}</span>
                    <span className="font-extrabold">{b.value}%</span>
                  </div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        b.value >= 75 ? "bg-primary" : "bg-chart-3",
                      )}
                      style={{ width: `${b.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <ul className="flex flex-col gap-2 pt-4">
              {reasons.map((r) => (
                <li key={r.text} className="flex gap-2 text-sm">
                  {r.kind === "good" ? (
                    <CheckCircle2Icon className="size-5 shrink-0 text-primary" />
                  ) : (
                    <CircleAlertIcon className="size-5 shrink-0 text-chart-3" />
                  )}
                  <span className="pt-0.5">{r.text}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
              <DnaIcon className="size-5 text-primary" />
              Crop characteristics
            </h2>
            <dl className="grid grid-cols-2 gap-3 pt-3 sm:grid-cols-3">
              {traits.map((tr) => (
                <div key={tr.label} className="rounded-2xl bg-muted p-3">
                  <dt className="text-xs font-semibold text-muted-foreground">{tr.label}</dt>
                  <dd className="font-bold">{tr.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-3xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
              <SatelliteIcon className="size-5 text-primary" />
              What the data says
            </h2>
            <ul className="flex flex-col divide-y divide-border pt-2">
              {crop.dataInsights.map((d) => (
                <li key={d.label} className="py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-semibold text-muted-foreground">
                      {d.label}
                    </span>
                    <span className="font-extrabold">{d.value}</span>
                  </div>
                  <p className="pt-1 text-sm">{d.note}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-border bg-card p-5">
            <h2 className="font-serif text-xl font-semibold">Care instructions</h2>
            <ol className="flex flex-col gap-3 pt-3">
              {crop.care.map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-sm font-extrabold text-secondary-foreground">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-3xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
              <ShieldAlertIcon className="size-5 text-destructive" />
              Risks to watch
            </h2>
            <ul className="flex flex-col gap-3 pt-3">
              {crop.risks.map((r) => (
                <li key={r.title} className="rounded-2xl bg-muted p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold">{r.title}</span>
                    <LevelBadge level={r.level} />
                  </div>
                  <p className="pt-1 text-sm text-muted-foreground">{r.detail}</p>
                </li>
              ))}
            </ul>
          </section>

          <Button
            size="lg"
            className="h-14 rounded-2xl text-base font-bold"
            render={<Link to="/assistant" />}
            nativeButton={false}
          >
            <BotMessageSquareIcon className="size-5" />
            Ask Siesta about {crop.name.toLowerCase()}
          </Button>
        </div>
      </div>
    </>
  );
}
