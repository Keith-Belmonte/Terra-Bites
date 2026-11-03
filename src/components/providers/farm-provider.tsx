import { useCallback, useMemo, useRef, useState } from "react";
import {
  FarmContext,
  type ChatMessage,
  type DataSourcePrefs,
  type FarmProfile,
  type FarmState,
  type GpsStatus,
  type Language,
  type NotificationPrefs,
  type Units,
} from "./farm-context.tsx";
import { LOCATIONS } from "@/lib/mock/conditions.ts";
import type { Priorities, SoilInfo } from "@/lib/recommend.ts";

// Simulated GPS lookup delay until real geolocation is connected.
const LOCATE_DELAY_MS = 1400;

export default function FarmProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locationId, setLocationIdState] = useState(LOCATIONS[0].id);
  const [soilTest, setSoilTest] = useState<SoilInfo | null>(null);
  const [priorities, setPriorities] = useState<Priorities>({
    profit: 2,
    lowCost: 1,
    waterSaving: 1,
    quickHarvest: 0,
    lowRisk: 1,
  });
  const [irrigation, setIrrigation] = useState(true);
  const [gps, setGps] = useState<GpsStatus>("prompt");
  const [locatedAt, setLocatedAt] = useState<string | null>(null);
  const [units, setUnits] = useState<Units>("metric");
  const [language, setLanguage] = useState<Language>("en");
  const [notifications, setNotifications] = useState<NotificationPrefs>({
    alerts: true,
    weather: true,
    tips: false,
  });
  const [dataSources, setDataSources] = useState<DataSourcePrefs>({
    power: true,
    smap: true,
    modis: true,
    gpm: true,
  });
  const [profile, setProfile] = useState<FarmProfile>({
    name: "Keith Bryan",
    farmName: "Talos II",
    farmSize: 2.5,
    preferredCrops: ["rice", "mung-bean", "onion"],
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A soil test belongs to one field, so moving area falls back to the survey.
  const setLocationId = useCallback((id: string) => {
    setLocationIdState(id);
    setSoilTest(null);
  }, []);

  const requestLocation = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setGps("locating");
    timer.current = setTimeout(() => {
      setGps("granted");
      setLocatedAt(new Date().toISOString());
    }, LOCATE_DELAY_MS);
  }, []);

  const denyLocation = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setGps("denied");
  }, []);

  const value = useMemo<FarmState>(
    () => ({
      locationId,
      setLocationId,
      gps,
      locatedAt,
      requestLocation,
      denyLocation,
      units,
      setUnits,
      language,
      setLanguage,
      notifications,
      setNotifications,
      dataSources,
      setDataSources,
      profile,
      setProfile,
      soilTest,
      setSoilTest,
      priorities,
      setPriorities,
      irrigation,
      setIrrigation,
      messages,
      setMessages,
    }),
    [
      locationId,
      setLocationId,
      gps,
      locatedAt,
      requestLocation,
      denyLocation,
      units,
      language,
      notifications,
      dataSources,
      profile,
      soilTest,
      priorities,
      irrigation,
      messages,
    ],
  );

  return <FarmContext value={value}>{children}</FarmContext>;
}
