import {
  CloudRainIcon,
  ThermometerIcon,
  WindIcon,
  type LucideIcon,
} from "lucide-react";
import type { FarmWeather } from "@/lib/farm-api.ts";

export type WeatherAlert = {
  id: string;
  title: string;
  detail: string;
  severity: "high" | "medium" | "low";
  icon: LucideIcon;
  when: string;
};

export function analyzeWeatherAlerts(weather: FarmWeather): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const { current, daily } = weather;

  if (current.weather_code >= 95) {
    alerts.push({
      id: "thunderstorm",
      title: "Thunderstorm conditions reported",
      detail: "Check your local official weather service before field work.",
      severity: "high",
      icon: CloudRainIcon,
      when: "Current conditions",
    });
  }
  if (current.wind_speed_10m >= 50) {
    alerts.push({
      id: "wind",
      title: "Strong wind in the current forecast",
      detail: "Secure light structures and avoid applying sprays in windy conditions.",
      severity: "high",
      icon: WindIcon,
      when: "Current conditions",
    });
  }

  daily.time.forEach((date, index) => {
    const rain = daily.precipitation_sum[index];
    if (rain !== undefined && rain >= 25) {
      alerts.push({
        id: `rain-${date}`,
        title: "Heavy rain signal in forecast",
        detail: `${rain.toFixed(1)} mm of precipitation is forecast. Check field drainage and local advisories.`,
        severity: rain >= 50 ? "high" : "medium",
        icon: CloudRainIcon,
        when: date,
      });
    }

    const maxTemp = daily.temperature_2m_max[index];
    if (maxTemp !== undefined && maxTemp >= 35) {
      alerts.push({
        id: `heat-${date}`,
        title: "High temperature signal in forecast",
        detail: `Daytime temperature may reach ${maxTemp.toFixed(1)}°C. Monitor young plants and water stress.`,
        severity: maxTemp >= 38 ? "high" : "medium",
        icon: ThermometerIcon,
        when: date,
      });
    }
  });
  return alerts;
}
