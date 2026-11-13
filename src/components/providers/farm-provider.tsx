import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import {
  FarmContext,
  type ChatMessage,
  type FarmLocation,
  type FarmProfile,
  type FarmState,
  type GpsStatus,
  type Language,
  type NotificationPrefs,
  type Units,
} from "./farm-context.tsx";
import type { Priorities, SoilInfo } from "@/lib/recommend.ts";

type SavedFarmState = {
  location: FarmLocation | null;
  soilTest: SoilInfo | null;
  units: Units;
  language: Language;
  notifications: NotificationPrefs;
  profile: FarmProfile;
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

const DEFAULT_PRIORITIES: Priorities = {
  profit: 2,
  lowCost: 1,
  waterSaving: 1,
  quickHarvest: 0,
  lowRisk: 1,
};

const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  alerts: true,
  weather: true,
  tips: false,
};

const DEFAULT_SETTINGS: SavedFarmState = {
  location: null,
  soilTest: null,
  units: "metric",
  language: "en",
  notifications: DEFAULT_NOTIFICATIONS,
  profile: DEFAULT_PROFILE,
  priorities: DEFAULT_PRIORITIES,
  irrigation: false,
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

function readSavedState(): SavedFarmState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return DEFAULT_SETTINGS;
    const saved = value as Partial<SavedFarmState>;
    return {
      ...DEFAULT_SETTINGS,
      ...saved,
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

  const setSoilTest = useCallback((soilTest: SoilInfo | null) => {
    updateSettings((current) => ({ ...current, soilTest }));
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
  const setProfile = useCallback((profile: FarmProfile) => {
    updateSettings((current) => ({ ...current, profile }));
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
          id: `${coords.latitude.toFixed(5)},${coords.longitude.toFixed(5)}`,
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

  const value = useMemo<FarmState>(
    () => ({
      location: settings.location,
      setFarmLocation,
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
      settings,
      setFarmLocation,
      gps,
      locatedAt,
      requestLocation,
      denyLocation,
      setUnits,
      setLanguage,
      setNotifications,
      setProfile,
      setSoilTest,
      setPriorities,
      setIrrigation,
      messages,
    ],
  );

  return <FarmContext value={value}>{children}</FarmContext>;
}
