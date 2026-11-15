import { Link, createFileRoute } from "@tanstack/react-router";
import { UserButton, useUser } from "@clerk/tanstack-react-start";
import { useSyncExternalStore } from "react";
import {
  BellIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  CloudRainIcon,
  DatabaseIcon,
  ExternalLinkIcon,
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
import { Button } from "@/components/ui/button.tsx";
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
  type DataSourcePrefs,
  type Language,
  type NotificationPrefs,
} from "@/components/providers/farm-context.tsx";
import {
  getForecastLeadDays,
  saveForecastLeadDays,
  subscribeToForecastLeadDays,
} from "@/lib/forecast-preferences.ts";
import { useTheme, type Theme } from "@/components/providers/theme-context.tsx";
import EditProfileDialog from "./-component/edit-profile-dialogue.tsx";
import FarmReminders from "./-component/farm-reminders.tsx";
import { CROPS } from "@/lib/mock/crops.ts";
import { formatArea, getLocation } from "@/lib/format.ts";
import { cn } from "@/lib/utils.ts";
import { toast } from "sonner";

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
    label: "Farm alerts",
    hint: "Drought, pests and storms near you",
  },
  {
    key: "weather",
    label: "Daily weather summary",
    hint: "Every morning at 6 AM",
  },
  {
    key: "tips",
    label: "Planting tips",
    hint: "When a good planting window opens",
  },
];

const DATA_SOURCES: Array<{
  key: keyof DataSourcePrefs;
  name: string;
  what: string;
}> = [
  { key: "power", name: "NASA POWER", what: "Temperature, sunlight, humidity" },
  { key: "smap", name: "NASA SMAP", what: "Soil moisture from satellite" },
  { key: "modis", name: "NASA MODIS", what: "Vegetation health (NDVI)" },
  { key: "gpm", name: "NASA GPM IMERG", what: "Rainfall estimates" },
];

const THEMES: Array<{ value: Theme; label: string; icon: LucideIcon }> = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "Auto", icon: MonitorIcon },
];

function getNotificationPermission(): NotificationPermission | "unsupported" {
  return "Notification" in window ? Notification.permission : "unsupported";
}

function subscribeToNotificationPermission(onChange: () => void) {
  window.addEventListener("focus", onChange);
  window.addEventListener("terrabites-notification-permission", onChange);
  return () => {
    window.removeEventListener("focus", onChange);
    window.removeEventListener("terrabites-notification-permission", onChange);
  };
}

function Profile() {
  const farm = useFarm();
  const { isLoaded, user } = useUser();
  const { theme, setTheme } = useTheme();
  const forecastLeadDays = useSyncExternalStore(
    subscribeToForecastLeadDays,
    getForecastLeadDays,
    () => "3",
  );
  const notificationPermission = useSyncExternalStore(
    subscribeToNotificationPermission,
    getNotificationPermission,
    () => "default",
  );
  const loc = getLocation(farm.locationId);
  const locationName = farm.deviceLocation
    ? [
        farm.deviceLocation.city,
        farm.deviceLocation.region ?? farm.deviceLocation.country,
      ]
        .filter(Boolean)
        .join(", ") ||
      `${farm.deviceLocation.latitude.toFixed(4)}, ${farm.deviceLocation.longitude.toFixed(4)}`
    : loc.city;
  const accountName =
    user?.fullName ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress ||
    "Account";
  const initials = accountName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const preferred = CROPS.filter((c) =>
    farm.profile.preferredCrops.includes(c.id),
  );

  async function enableBrowserNotifications() {
    if (!("Notification" in window)) {
      return;
    }
    try {
      await Notification.requestPermission();
      window.dispatchEvent(new Event("terrabites-notification-permission"));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown browser error";
      toast.error(`Could not request notification permission: ${message}`);
    }
  }

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
            {isLoaded && user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={`${accountName} profile`}
                className="size-16 shrink-0 rounded-2xl object-cover"
              />
            ) : (
              <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary font-serif text-2xl font-semibold text-primary-foreground">
                {initials}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-xl font-extrabold">
                {isLoaded ? accountName : "Loading account..."}
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
                {formatArea(farm.profile.farmSize, farm.units)}
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
              <p className="truncate font-bold">{locationName}</p>
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

        <SettingsGroup
          title="Advanced forecast & reminders"
          icon={CloudRainIcon}
        >
          <Row icon={CalendarDaysIcon} label="Forecast lead time">
            <Select
              items={{
                "1": "1 day ahead",
                "3": "3 days ahead",
                "7": "7 days ahead",
              }}
              value={forecastLeadDays}
              onValueChange={(value) => {
                if (value === "1" || value === "3" || value === "7") {
                  try {
                    saveForecastLeadDays(value);
                  } catch (error) {
                    const message =
                      error instanceof Error
                        ? error.message
                        : "Unknown browser error";
                    toast.error(
                      `Could not save forecast preference: ${message}`,
                    );
                  }
                }
              }}
            >
              <SelectTrigger className="h-11 min-w-36 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 day ahead</SelectItem>
                <SelectItem value="3">3 days ahead</SelectItem>
                <SelectItem value="7">7 days ahead</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Browser notifications</p>
              <p className="text-sm text-muted-foreground">
                {notificationPermission === "granted"
                  ? "Permission granted. Automatic background push delivery is not set up yet."
                  : notificationPermission === "denied"
                    ? "Notifications are blocked in your browser settings."
                    : notificationPermission === "unsupported"
                      ? "This browser does not support notifications."
                      : "Allow browser permission for future weather and farm alerts."}
              </p>
            </div>
            {notificationPermission !== "granted" &&
              notificationPermission !== "unsupported" && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={enableBrowserNotifications}
                >
                  Allow notifications
                </Button>
              )}
          </div>
          <p className="px-4 pb-4 text-xs text-muted-foreground">
            Forecast lead time controls the forecast shown on Farm Maps.
            Automatic background push reminders require a push service and are
            not active in this version.
          </p>
          <FarmReminders />
        </SettingsGroup>

        <SettingsGroup title="Data sources" icon={DatabaseIcon}>
          {DATA_SOURCES.map((d) => (
            <label
              key={d.key}
              className="flex min-h-16 cursor-pointer items-center gap-3 px-4 py-3"
            >
              <SatelliteIcon className="size-5 shrink-0 text-primary" />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{d.name}</span>
                <span className="block text-sm text-muted-foreground">
                  {d.what}
                </span>
              </span>
              <Switch
                checked={farm.dataSources[d.key]}
                onCheckedChange={(checked) =>
                  farm.setDataSources({ ...farm.dataSources, [d.key]: checked })
                }
                className="scale-125"
              />
            </label>
          ))}
        </SettingsGroup>

        {/* Attribution */}
        <section className="rounded-3xl bg-secondary/70 p-5">
          <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
            <SatelliteIcon className="size-5" />
            Where our insights come from
          </h2>
          <p className="pt-2 leading-relaxed">
            TerraBites insights are based on NASA Earth observation data (POWER,
            SMAP, MODIS and GPM) and other public environmental data, such as
            national soil surveys and weather services. Satellite readings cover
            areas of hundreds of metres, so always compare them with what you
            see in your own field.
          </p>
          <p className="pt-2 text-sm text-muted-foreground">
            This version shows sample data while live connections are being set
            up.
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
