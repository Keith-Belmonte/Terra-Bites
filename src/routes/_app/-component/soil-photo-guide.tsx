import { useEffect, useState } from "react";
import { CameraIcon, InfoIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useFarm } from "@/components/providers/farm-context.tsx";
import { CROP_FILTERS } from "@/lib/mock/crops.ts";
import { getLocation } from "@/lib/format.ts";
import {
  estimateSoilTexture,
  type SoilFeel,
  type SoilRibbon,
} from "@/lib/soil-texture.ts";

const TEXTURE_GUIDES = [
  {
    name: "Sandy",
    feel: "Feels gritty and falls apart easily when damp.",
    care: "Add mature compost and use mulch to help hold moisture and nutrients.",
  },
  {
    name: "Clay",
    feel: "Feels sticky when wet and can form a firm ribbon when squeezed.",
    care: "Add organic matter over time and avoid working the soil when wet.",
  },
  {
    name: "Loamy",
    feel: "Feels crumbly and holds its shape briefly, then breaks apart.",
    care: "Keep it covered and rotate crop families to maintain its structure.",
  },
];

function isSoilFeel(value: string): value is SoilFeel | "" {
  return (
    value === "" ||
    value === "gritty" ||
    value === "silky" ||
    value === "balanced"
  );
}

function isSoilRibbon(value: string): value is SoilRibbon | "" {
  return (
    value === "" ||
    value === "none" ||
    value === "short" ||
    value === "medium" ||
    value === "long"
  );
}

export default function SoilPhotoGuide() {
  const farm = useFarm();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [feel, setFeel] = useState<SoilFeel | "">("");
  const [ribbon, setRibbon] = useState<SoilRibbon | "">("");
  const soil = farm.soilTest ?? getLocation(farm.locationId).soil;
  const estimate = feel && ribbon ? estimateSoilTexture(feel, ribbon) : null;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
  }

  return (
    <div className="grid gap-4 rounded-3xl border border-border bg-card p-5 sm:p-6 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <div>
        <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
          <CameraIcon className="size-5" />
        </span>
        <h3 className="mt-4 text-lg font-bold">Offline soil texture check</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Use a simple ribbon test to get an indicative soil texture category
          for crop recommendations. No API or internet connection is needed.
        </p>
        <label className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 font-semibold text-primary-foreground hover:opacity-90">
          <CameraIcon className="size-4" />
          Take or choose a photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoChange}
            className="sr-only"
          />
        </label>
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Your soil photo"
            className="mt-4 aspect-video w-full rounded-2xl border border-border object-cover"
          />
        )}
      </div>
      <div>
        <p className="flex items-start gap-2 rounded-2xl bg-accent/30 p-3 text-sm leading-relaxed">
          <InfoIcon className="mt-0.5 size-4 shrink-0" />
          This field check is a rough texture estimate, not a lab diagnosis.
          Photos are only previewed on this device and are not analyzed or
          uploaded. Soil pH and nutrients require a soil test.
        </p>
        <ol className="mt-4 list-inside list-decimal space-y-1 text-sm text-muted-foreground">
          <li>Use a small soil sample and remove stones or roots.</li>
          <li>
            Add water a little at a time until the soil is moldable, not muddy.
          </li>
          <li>Press and roll a pinch between your thumb and forefinger.</li>
          <li>
            Note how it feels and how long a ribbon forms before it breaks.
          </li>
        </ol>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            How does the moist soil feel?
            <select
              value={feel}
              onChange={(event) => {
                const value = event.currentTarget.value;
                if (isSoilFeel(value)) setFeel(value);
              }}
              className="min-h-11 rounded-xl border border-border bg-background px-3 font-normal"
            >
              <option value="">Choose a feel</option>
              <option value="gritty">Gritty, like sand</option>
              <option value="silky">Smooth or floury</option>
              <option value="balanced">A mix of gritty and smooth</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Longest ribbon before it breaks
            <select
              value={ribbon}
              onChange={(event) => {
                const value = event.currentTarget.value;
                if (isSoilRibbon(value)) setRibbon(value);
              }}
              className="min-h-11 rounded-xl border border-border bg-background px-3 font-normal"
            >
              <option value="">Choose a length</option>
              <option value="none">No ribbon forms</option>
              <option value="short">Under 2.5 cm (about 1 inch)</option>
              <option value="medium">2.5–5 cm (about 1–2 inches)</option>
              <option value="long">Over 5 cm (over 2 inches)</option>
            </select>
          </label>
        </div>

        {estimate && (
          <section
            aria-live="polite"
            className="mt-4 rounded-2xl border border-primary/20 bg-secondary/50 p-4"
          >
            <p className="text-xs font-bold tracking-wide text-primary uppercase">
              Field estimate · not a lab result
            </p>
            <h4 className="mt-1 text-lg font-bold">{estimate.type}</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              {estimate.explanation}
            </p>
            <button
              type="button"
              onClick={() => farm.setSoilTest({ ...soil, type: estimate.type })}
              className="mt-3 min-h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Use this estimate for crop suggestions
            </button>
          </section>
        )}

        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-semibold">
            Choose a texture yourself instead
          </summary>
          <fieldset className="mt-3">
            <legend className="text-sm text-muted-foreground">
              Choose the closest category
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {CROP_FILTERS.soil.map((soilType) => (
                <button
                  key={soilType}
                  type="button"
                  aria-pressed={soil.type === soilType}
                  onClick={() => farm.setSoilTest({ ...soil, type: soilType })}
                  className={`min-h-10 rounded-xl border px-3 text-sm font-semibold ${
                    soil.type === soilType
                      ? "border-primary bg-secondary"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {soilType}
                </button>
              ))}
            </div>
          </fieldset>
        </details>
        <p className="mt-2 text-xs text-muted-foreground">
          {farm.soilTest
            ? "Your entered soil information is used by crop recommendations for this session. Only texture is inferred here; other values are not measured."
            : "Showing the regional sample soil until you enter a field texture."}
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
          {TEXTURE_GUIDES.map((guide) => (
            <article key={guide.name} className="rounded-2xl bg-muted p-4">
              <h4 className="font-bold">{guide.name}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{guide.feel}</p>
              <p className="mt-2 text-sm">{guide.care}</p>
            </article>
          ))}
        </div>
        <Link
          to="/crops"
          className="mt-3 inline-flex min-h-10 items-center font-semibold text-primary hover:underline"
        >
          See how soil affects crop recommendations
        </Link>
      </div>
    </div>
  );
}
