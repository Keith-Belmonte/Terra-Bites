import { useCallback, useMemo, useState } from "react";
import {
  FarmContext,
  type ChatMessage,
  type DataSourcePrefs,
  type DeviceLocation,
  type FarmProfile,
  type FarmState,
  type GpsStatus,
  type Language,
  type NotificationPrefs,
  type Units,
} from "./farm-context.tsx";
import { LOCATIONS } from "@/lib/mock/conditions.ts";
import type { Priorities, SoilInfo } from "@/lib/recommend.ts";

type ReverseGeocodeResult = {
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    province?: string;
    country?: string;
  };
};

export default function FarmProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locationId, setLocationIdState] = useState(LOCATIONS[0].id);
  const [deviceLocation, setDeviceLocation] = useState<DeviceLocation | null>(null);
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

  // A soil test belongs to one field, so moving area falls back to the survey.
  const setLocationId = useCallback((id: string) => {
    setLocationIdState(id);
    setDeviceLocation(null);
    setSoilTest(null);
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGps("denied");
      return;
    }

    setGps("locating");
    setDeviceLocation(null);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const { latitude, longitude } = coords;
      setDeviceLocation({ latitude, longitude, city: null, region: null, country: null });
      setGps("granted");
      setLocatedAt(new Date().toISOString());

      try {
        const params = new URLSearchParams({
          format: "jsonv2",
          lat: String(latitude),
          lon: String(longitude),
          addressdetails: "1",
        });
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?${params}`,
          { headers: { Accept: "application/json" } },
        );
        if (!response.ok) return;

        const result = (await response.json()) as ReverseGeocodeResult;
        const address = result.address;
        const city =
          address?.city ??
          address?.town ??
          address?.village ??
          address?.municipality ??
          address?.county ??
          null;
        setDeviceLocation({
          latitude,
          longitude,
          city,
          region: address?.state ?? address?.province ?? null,
          country: address?.country ?? null,
        });
      } catch {
        setDeviceLocation({ latitude, longitude, city: null, region: null, country: null });
      }
    }, () => {
      setGps("denied");
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
  }, []);

  const denyLocation = useCallback(() => {
    setGps("denied");
  }, []);

  const value = useMemo<FarmState>(
    () => ({
      locationId,
      setLocationId,
      deviceLocation,
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
      deviceLocation,
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
