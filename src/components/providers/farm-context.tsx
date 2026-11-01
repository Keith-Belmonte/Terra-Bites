import { createContext, useContext } from "react";
import type { Priorities, SoilInfo } from "@/lib/recommend.ts";

export type GpsStatus = "prompt" | "locating" | "granted" | "denied";
export type Units = "metric" | "imperial";
export type Language = "en" | "fil" | "ceb";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  // ISO 8601 UTC timestamp
  sentAt: string;
};

export type FarmProfile = {
  name: string;
  farmName: string;
  farmSize: number;
  preferredCrops: string[];
};

export type NotificationPrefs = {
  alerts: boolean;
  weather: boolean;
  tips: boolean;
};

export type DataSourcePrefs = {
  power: boolean;
  smap: boolean;
  modis: boolean;
  gpm: boolean;
};

export type FarmState = {
  locationId: string;
  setLocationId: (id: string) => void;
  gps: GpsStatus;
  locatedAt: string | null;
  requestLocation: () => void;
  denyLocation: () => void;
  units: Units;
  setUnits: (units: Units) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  notifications: NotificationPrefs;
  setNotifications: (prefs: NotificationPrefs) => void;
  dataSources: DataSourcePrefs;
  setDataSources: (prefs: DataSourcePrefs) => void;
  profile: FarmProfile;
  setProfile: (profile: FarmProfile) => void;
  /** Farmer-entered soil test; null means use the regional soil survey. */
  soilTest: SoilInfo | null;
  setSoilTest: (soil: SoilInfo | null) => void;
  priorities: Priorities;
  setPriorities: (p: Priorities) => void;
  irrigation: boolean;
  setIrrigation: (on: boolean) => void;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
};

export const FarmContext = createContext<FarmState | null>(null);

export function useFarm(): FarmState {
  const ctx = useContext(FarmContext);
  if (!ctx) throw new Error("useFarm must be used inside FarmProvider");
  return ctx;
}
