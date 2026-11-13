import { Link, createFileRoute } from "@tanstack/react-router";
import { UserButton } from "@clerk/tanstack-react-start";
import {
  BellIcon,
  ChevronRightIcon,
  LanguagesIcon,
  MapPinIcon,
  MonitorIcon,
  MoonIcon,
  RulerIcon,
  SatelliteIcon,
  SproutIcon,
  SunIcon,
  TractorIcon,
  type LucideIcon,
} from "lucide-react";
import ScreenHeader from "@/components/ui/screen-header.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import {
  useFarm,
  type Language,
  type NotificationPrefs,
} from "@/components/providers/farm-context.tsx";
import { useTheme, type Theme } from "@/components/providers/theme-context.tsx";
import EditProfileDialog from "./-component/edit-profile-dialogue.tsx";
import { CROPS } from "@/lib/crops.ts";
import { formatArea } from "@/lib/format.ts";
import { cn } from "@/lib/utils.ts";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profile & Settings | TerraBites" }] }),
  component: Profile,
});

const LANGUAGES: Record<Language, string> = {
  en: "English",
  fil: "Filipino",
  ceb: "Cebuano",
};

const NOTIFICATION_ITEMS: Array<{
  key: keyof NotificationPrefs;
  label: string;
  hint: string;
}> = [
  {
    key: "alerts",
    label: "Forecast signals",
    hint: "Saved preference only; no alert delivery is configured",
  },
  {
    key: "weather",
    label: "Weather summary",
    hint: "Saved preference only; no scheduled summary is configured",
  },
  {
    key: "tips",
    label: "Crop tips",
    hint: "Saved preference only; no scheduled tips are configured",
  },
];

const THEMES: Array<{ value: Theme; label: string; icon: LucideIcon }> = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "Auto", icon: MonitorIcon },
];

function Profile() {
  const farm = useFarm();
  const { theme, setTheme } = useTheme();
  const loc = farm.location;
  const initials =
    farm.profile.name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "F";
  const preferred = CROPS.filter((c) =>
    farm.profile.preferredCrops.includes(c.id),
  );

  return (
    <>
      <ScreenHeader
        title="Profile"
        subtitle="Your farm and app settings"
        actions={<UserButton />}
      />
      <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 pt-4 md:px-8">
        {/* Profile card */}
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary font-serif text-2xl font-semibold text-primary-foreground">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-xl font-extrabold">
                {farm.profile.name || "Your profile"}
              </h2>
              <p className="truncate text-sm text-muted-foreground">
                {farm.profile.farmName || "Add your farm details"}
              </p>
            </div>
            <EditProfileDialog />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-5">
            <div className="rounded-2xl bg-muted p-3">
              <TractorIcon className="size-5 text-primary" />
              <p className="pt-1 text-xs font-semibold text-muted-foreground">
                Farm size
              </p>
              <p className="font-bold">
                {farm.profile.farmSize > 0
                  ? formatArea(farm.profile.farmSize, farm.units)
                  : "Not set"}
              </p>
            </div>
            <Link
              to="/location"
              className="cursor-pointer rounded-2xl bg-muted p-3 transition-colors hover:bg-secondary"
            >
              <MapPinIcon className="size-5 text-primary" />
              <p className="pt-1 text-xs font-semibold text-muted-foreground">
                Location
              </p>
              <p className="truncate font-bold">{loc?.city ?? "Not set"}</p>
            </Link>
          </div>
          <p className="pt-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">
            Preferred crops
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {preferred.map((c) => (
              <Link
                key={c.id}
                to="/crops/$cropId"
                params={{ cropId: c.id }}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold text-secondary-foreground"
              >
                <SproutIcon className="size-4" /> {c.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Preferences */}
        <SettingsGroup title="Preferences">
          <Row icon={RulerIcon} label="Units">
            <Segmented
              value={farm.units}
              onChange={farm.setUnits}
              options={[
                { value: "metric", label: "Metric" },
                { value: "imperial", label: "Imperial" },
              ]}
            />
          </Row>
          <Row icon={LanguagesIcon} label="Language">
            <Select
              items={LANGUAGES}
              value={farm.language}
              onValueChange={(v) => {
                if (v) farm.setLanguage(v);
              }}
            >
              <SelectTrigger className="h-11 min-w-32 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(LANGUAGES) as Language[]).map((l) => (
                  <SelectItem key={l} value={l}>
                    {LANGUAGES[l]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>
          <Row icon={SunIcon} label="Theme">
            <Segmented
              value={theme}
              onChange={setTheme}
              options={THEMES.map((t) => ({ value: t.value, label: t.label }))}
            />
          </Row>
        </SettingsGroup>

        <SettingsGroup title="Notifications" icon={BellIcon}>
          <p className="px-4 pt-3 text-xs text-muted-foreground">
            These preferences are saved locally. Scheduled notifications are not
            configured.
          </p>
          {NOTIFICATION_ITEMS.map((n) => (
            <label
              key={n.key}
              className="flex min-h-16 cursor-pointer items-center gap-3 px-4 py-3"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{n.label}</span>
                <span className="block text-sm text-muted-foreground">
                  {n.hint}
                </span>
              </span>
              <Switch
                checked={farm.notifications[n.key]}
                onCheckedChange={(checked) =>
                  farm.setNotifications({
                    ...farm.notifications,
                    [n.key]: checked,
                  })
                }
                className="scale-125"
              />
            </label>
          ))}
        </SettingsGroup>

        <SettingsGroup title="Connected services" icon={SatelliteIcon}>
          <div className="px-4 py-3">
            <p className="font-semibold">Open-Meteo</p>
            <p className="text-sm text-muted-foreground">
              Live forecast, historical weather, and modelled surface soil
              moisture.
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="font-semibold">NASA POWER</p>
            <p className="text-sm text-muted-foreground">
              Recent gridded temperature, precipitation, and solar estimates; no
              NASA account or API key is required.
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="font-semibold">NASA GEOS-CF</p>
            <p className="text-sm text-muted-foreground">
              Five-day gridded temperature and rainfall outlook from NASA&apos;s
              global forecast model.
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="font-semibold">NASA GIBS / EOSDIS</p>
            <p className="text-sm text-muted-foreground">
              Optional VIIRS vegetation-index and SMAP surface-soil-moisture
              imagery on the farm map. These are broad-scale visual context, not
              field measurements.
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="font-semibold">Cloudflare Workers AI</p>
            <p className="text-sm text-muted-foreground">
              Server-side AI assistant. Uses the Cloudflare AI binding; no
              separate AI key is required.
            </p>
          </div>
        </SettingsGroup>

        {/* Attribution */}
        <section className="rounded-3xl bg-secondary/70 p-5">
          <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
            <SatelliteIcon className="size-5" />
            Where our insights come from
          </h2>
          <p className="pt-2 leading-relaxed">
            Weather insights and forecast signals use Open-Meteo data. NASA
            GEOS-CF adds a five-day model outlook; NASA POWER adds recent
            gridded temperature, precipitation, and solar estimates. These are
            regional estimates, not measurements from a sensor on your farm.
            NASA GIBS VIIRS and SMAP imagery is visual context only, not a
            field-level crop-health measurement or soil test. Crop details are
            global reference traits; regional crop picks rank growing-condition
            fit and do not confirm local seed availability. Soil suitability
            uses your entered soil test or a clearly labelled general estimate.
          </p>
          <p className="pt-2 text-sm text-muted-foreground">
            AI advice is generated by Cloudflare Workers AI from the prompt and
            current weather and NASA POWER context when available. Verify
            critical decisions with a local agricultural extension officer.
          </p>
        </section>

        <Link
          to="/"
          className="flex min-h-14 cursor-pointer items-center justify-between rounded-2xl border border-border bg-card px-4 font-semibold transition-colors hover:bg-muted"
        >
          View welcome tour
          <ChevronRightIcon className="size-5" />
        </Link>
        <p className="pb-4 text-center text-xs text-muted-foreground">
          TerraBites v0.1 · © {new Date().getFullYear()}
        </p>
      </div>
    </>
  );
}

function SettingsGroup({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="flex items-center gap-2 px-1 pb-2 text-sm font-bold tracking-wider text-muted-foreground uppercase">
        {Icon && <Icon className="size-4" />}
        {title}
      </h2>
      <div className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
        {children}
      </div>
    </section>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-16 flex-wrap items-center gap-3 px-4 py-3">
      <Icon className="size-5 shrink-0 text-primary" />
      <span className="flex-1 font-semibold">{label}</span>
      {children}
    </div>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div className="flex rounded-xl bg-muted p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "h-9 cursor-pointer rounded-lg px-3 text-sm font-semibold transition-colors",
            value === o.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
