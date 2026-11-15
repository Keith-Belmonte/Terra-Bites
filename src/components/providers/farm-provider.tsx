import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import {
  FarmContext,
  type ChatMessage,
  type DataSourcePrefs,
  type DeviceLocation,
  type FarmLocation,
  type FarmProfile,
  type FarmState,
  type GpsStatus,
  type Language,
  type NotificationPrefs,
  type Units,
} from "./farm-context.tsx";
import type { Priorities, SoilInfo } from "@/lib/recommend.ts";
import { LOCATIONS } from "@/lib/mock/conditions.ts";

type SavedFarmState = {
  location: FarmLocation | null;
  locationId: string;
  units: Units;
  language: Language;
  notifications: NotificationPrefs;
  dataSources: DataSourcePrefs;
  profile: FarmProfile;
  soilTest: SoilInfo | null;
  priorities: Priorities;
  irrigation: boolean;
};

const STORAGE_KEY = "terrabites-farm-state";

const DEFAULT_PROFILE: FarmProfile = {
  name: "",
  farmName: "",
  farmSize: 0,
  preferredCrops: [],
};

const DEFAULT_SETTINGS: SavedFarmState = {
  location: null,
  locationId: LOCATIONS[0]!.id,
  units: "metric",
  language: "en",
  notifications: { alerts: true, weather: true, tips: false },
  dataSources: { power: true, smap: true, modis: true, gpm: true },
  profile: DEFAULT_PROFILE,
  soilTest: null,
  priorities: {
    profit: 2,
    lowCost: 1,
    waterSaving: 1,
    quickHarvest: 0,
    lowRisk: 1,
  },
  irrigation: true,
};

const subscribers = new Set<() => void>();
let cachedSettings: SavedFarmState | undefined;

function isFarmLocation(value: unknown): value is FarmLocation {
  if (!value || typeof value !== "object") return false;
  const location = value as Partial<FarmLocation>;
  return (
    typeof location.id === "string" &&
    typeof location.city === "string" &&
    typeof location.province === "string" &&
    typeof location.country === "string" &&
    typeof location.lat === "number" &&
    location.lat >= -90 &&
    location.lat <= 90 &&
    typeof location.lng === "number" &&
    location.lng >= -180 &&
    location.lng <= 180
  );
}

function toFarmLocation(location: (typeof LOCATIONS)[number]): FarmLocation {
  return {
    id: location.id,
    city: location.city,
    province: location.province,
    country: location.country,
    lat: location.lat,
    lng: location.lng,
    source: "search",
  };
}

function readSavedState(): SavedFarmState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return DEFAULT_SETTINGS;
    const saved = value as Partial<SavedFarmState>;
    const locationId =
      typeof saved.locationId === "string" &&
      LOCATIONS.some((location) => location.id === saved.locationId)
        ? saved.locationId
        : DEFAULT_SETTINGS.locationId;
    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      locationId,
      location: isFarmLocation(saved.location) ? saved.location : null,
      soilTest: saved.soilTest ?? null,
    };
  } catch (error) {
    console.error("Could not load saved farm settings:", error);
    return DEFAULT_SETTINGS;
  }
}

function getSettingsSnapshot(): SavedFarmState {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  cachedSettings ??= readSavedState();
  return cachedSettings;
}

function getServerSettingsSnapshot(): SavedFarmState {
  return DEFAULT_SETTINGS;
}

function notifySubscribers() {
  for (const subscriber of subscribers) subscriber();
}

function handleStorageChange(event: StorageEvent) {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  cachedSettings = readSavedState();
  notifySubscribers();
}

function subscribeToSettings(subscriber: () => void) {
  subscribers.add(subscriber);
  window.addEventListener("storage", handleStorageChange);
  return () => {
    subscribers.delete(subscriber);
    window.removeEventListener("storage", handleStorageChange);
  };
}

function updateSettings(
  update: (current: SavedFarmState) => SavedFarmState,
) {
  const next = update(getSettingsSnapshot());
  cachedSettings = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.error("Could not save farm settings:", error);
  }
  notifySubscribers();
}

export default function FarmProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = useSyncExternalStore(
    subscribeToSettings,
    getSettingsSnapshot,
    getServerSettingsSnapshot,
  );
  const [gps, setGps] = useState<GpsStatus>("prompt");
  const [locatedAt, setLocatedAt] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const setFarmLocation = useCallback((location: FarmLocation) => {
    updateSettings((current) => ({ ...current, location, soilTest: null }));
    setGps("granted");
    setLocatedAt(new Date().toISOString());
  }, []);

  const setLocationId = useCallback((id: string) => {
    const selected = LOCATIONS.find((location) => location.id === id);
    if (!selected) {
      throw new Error(`Unknown farm location: ${id}`);
    }
    updateSettings((current) => ({
      ...current,
      location: toFarmLocation(selected),
      locationId: id,
      soilTest: null,
    }));
  }, []);

  const setUnits = useCallback((units: Units) => {
    updateSettings((current) => ({ ...current, units }));
  }, []);
  const setLanguage = useCallback((language: Language) => {
    updateSettings((current) => ({ ...current, language }));
  }, []);
  const setNotifications = useCallback((notifications: NotificationPrefs) => {
    updateSettings((current) => ({ ...current, notifications }));
  }, []);
  const setDataSources = useCallback((dataSources: DataSourcePrefs) => {
    updateSettings((current) => ({ ...current, dataSources }));
  }, []);
  const setProfile = useCallback((profile: FarmProfile) => {
    updateSettings((current) => ({ ...current, profile }));
  }, []);
  const setSoilTest = useCallback((soilTest: SoilInfo | null) => {
    updateSettings((current) => ({ ...current, soilTest }));
  }, []);
  const setPriorities = useCallback((priorities: Priorities) => {
    updateSettings((current) => ({ ...current, priorities }));
  }, []);
  const setIrrigation = useCallback((irrigation: boolean) => {
    updateSettings((current) => ({ ...current, irrigation }));
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGps("denied");
      return;
    }
    setGps("locating");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setFarmLocation({
          id: `gps:${coords.latitude.toFixed(5)},${coords.longitude.toFixed(5)}`,
          city: "Farm location",
          province: "",
          country: "",
          lat: coords.latitude,
          lng: coords.longitude,
          accuracy: coords.accuracy,
          source: "gps",
        });
      },
      (error) => {
        console.error("Browser geolocation failed:", error.message);
        setGps(error.code === error.PERMISSION_DENIED ? "denied" : "prompt");
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 },
    );
  }, [setFarmLocation]);

  const denyLocation = useCallback(() => setGps("denied"), []);
  const location = settings.location;
  const deviceLocation = useMemo<DeviceLocation | null>(
    () =>
      location
        ? {
            latitude: location.lat,
            longitude: location.lng,
            city: location.city || null,
            region: location.province || null,
            country: location.country || null,
          }
        : null,
    [location],
  );

  const value = useMemo<FarmState>(
    () => ({
      location,
      setFarmLocation,
      locationId: settings.locationId,
      setLocationId,
      deviceLocation,
      gps,
      locatedAt,
      requestLocation,
      denyLocation,
      units: settings.units,
      setUnits,
      language: settings.language,
      setLanguage,
      notifications: settings.notifications,
      setNotifications,
      dataSources: settings.dataSources,
      setDataSources,
      profile: settings.profile,
      setProfile,
      soilTest: settings.soilTest,
      setSoilTest,
      priorities: settings.priorities,
      setPriorities,
      irrigation: settings.irrigation,
      setIrrigation,
      messages,
      setMessages,
    }),
    [
      location,
      setFarmLocation,
      settings,
      setLocationId,
      deviceLocation,
      gps,
      locatedAt,
      requestLocation,
      denyLocation,
      setUnits,
      setLanguage,
      setNotifications,
      setDataSources,
      setProfile,
      setSoilTest,
      setPriorities,
      setIrrigation,
      messages,
    ],
  );

  return <FarmContext value={value}>{children}</FarmContext>;
}
