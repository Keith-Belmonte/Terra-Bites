import {
  CloudRainIcon,
  DropletsIcon,
  SproutIcon,
  ThermometerIcon,
  WavesIcon,
} from "lucide-react";
import type {
  Condition,
  FarmAlert,
  FarmLocation,
} from "@/lib/mock/conditions.ts";

export type ObservationMetric =
  | "airTemperature"
  | "rainfall"
  | "rainfallOutlook30d"
  | "relativeHumidity"
  | "soilMoisture"
  | "surfaceWetness"
  | "ndvi";

export type ObservationSource =
  "NASA POWER" | "NASA SMAP" | "NASA MODIS" | "regional-sample";

export type NormalizedObservation = {
  metric: ObservationMetric;
  value: number;
  unit: "°C" | "mm" | "%" | "m³/m³" | "index";
  source: ObservationSource;
  quality: "observed" | "sample";
  observedAt: string | null;
};

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function numericValues(value: unknown): number[] {
  const values = Array.isArray(value)
    ? value
    : Object.values(record(value) ?? {});
  return values.filter(
    (item): item is number =>
      typeof item === "number" && Number.isFinite(item) && item !== -999,
  );
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function assertObservationDate(observedAt: string): void {
  if (!Number.isFinite(Date.parse(observedAt))) {
    throw new Error("Observation date must be a valid date string.");
  }
}

function assertRange(
  name: string,
  value: number,
  min: number,
  max: number,
): void {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(
      `${name} must be a finite value between ${min} and ${max}.`,
    );
  }
}

function makeObservation(
  metric: ObservationMetric,
  value: number,
  unit: NormalizedObservation["unit"],
  source: ObservationSource,
  quality: NormalizedObservation["quality"],
  observedAt: string | null,
): NormalizedObservation {
  if (!Number.isFinite(value)) {
    throw new Error(`${metric} observation must be finite.`);
  }
  return { metric, value, unit, source, quality, observedAt };
}

/** Normalize the daily parameter maps returned by the NASA POWER point API. */
export function adaptPowerDailyResponse(
  payload: unknown,
  observedAt: string,
): NormalizedObservation[] {
  assertObservationDate(observedAt);
  const properties = record(record(payload)?.properties);
  const parameters = record(properties?.parameter);
  if (!parameters) {
    throw new Error("NASA POWER response is missing properties.parameter.");
  }

  const temperature = mean(numericValues(parameters.T2M));
  const rainfallValues = numericValues(parameters.PRECTOTCORR);
  const humidity = mean(numericValues(parameters.RH2M));
  const surfaceWetness = mean(numericValues(parameters.GWETTOP));
  const observations: NormalizedObservation[] = [];

  if (temperature !== null) {
    assertRange("NASA POWER air temperature", temperature, -90, 65);
    observations.push(
      makeObservation(
        "airTemperature",
        Number(temperature.toFixed(1)),
        "°C",
        "NASA POWER",
        "observed",
        observedAt,
      ),
    );
  }
  if (rainfallValues.length > 0) {
    for (const value of rainfallValues) {
      assertRange("NASA POWER daily rainfall", value, 0, 2000);
    }
    observations.push(
      makeObservation(
        "rainfall",
        Number(
          rainfallValues.reduce((total, value) => total + value, 0).toFixed(1),
        ),
        "mm",
        "NASA POWER",
        "observed",
        observedAt,
      ),
    );
  }
  if (humidity !== null) {
    assertRange("NASA POWER relative humidity", humidity, 0, 100);
    observations.push(
      makeObservation(
        "relativeHumidity",
        Number(humidity.toFixed(1)),
        "%",
        "NASA POWER",
        "observed",
        observedAt,
      ),
    );
  }
  if (surfaceWetness !== null) {
    assertRange("NASA POWER surface soil wetness", surfaceWetness, 0, 1);
    observations.push(
      makeObservation(
        "surfaceWetness",
        Number(surfaceWetness.toFixed(3)),
        "index",
        "NASA POWER",
        "observed",
        observedAt,
      ),
    );
  }

  if (observations.length === 0) {
    throw new Error(
      "NASA POWER response contains no usable daily measurements.",
    );
  }
  return observations;
}

/** Normalize SMAP volumetric water content or a provider's percent value. */
export function adaptSmapObservation(
  payload: unknown,
  observedAt: string,
): NormalizedObservation {
  assertObservationDate(observedAt);
  const data = record(payload);
  const value = data?.soilMoisture ?? data?.soil_moisture;
  const unit = data?.unit;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(
      "NASA SMAP response is missing a numeric soil moisture value.",
    );
  }

  let percent: number;
  if (unit === "%") {
    percent = value;
  } else if (unit === "m3/m3" || unit === "m³/m³") {
    percent = value * 100;
  } else {
    throw new Error("NASA SMAP soil moisture unit must be % or m3/m3.");
  }
  assertRange("NASA SMAP soil moisture", percent, 0, 100);

  return makeObservation(
    "soilMoisture",
    Number(percent.toFixed(1)),
    "%",
    "NASA SMAP",
    "observed",
    observedAt,
  );
}

/** Normalize NASA MODIS NDVI values, including the product's 0.0001 scale. */
export function adaptModisObservation(
  payload: unknown,
  observedAt: string,
): NormalizedObservation {
  assertObservationDate(observedAt);
  const data = record(payload);
  const value = data?.ndvi;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("NASA MODIS response is missing a numeric NDVI value.");
  }
  const scaleFactor = data?.scaleFactor ?? (Math.abs(value) > 1 ? 0.0001 : 1);
  if (typeof scaleFactor !== "number" || !Number.isFinite(scaleFactor)) {
    throw new Error("NASA MODIS scale factor must be a finite number.");
  }
  if (scaleFactor === 0.0001) {
    assertRange("NASA MODIS raw NDVI", value, -2000, 10000);
  }
  const ndvi = value * scaleFactor;
  assertRange("NASA MODIS NDVI", ndvi, -1, 1);

  return makeObservation(
    "ndvi",
    Number(ndvi.toFixed(3)),
    "index",
    "NASA MODIS",
    "observed",
    observedAt,
  );
}

/** Convert the app's regional sample into the same shape as provider data. */
export function adaptRegionalSample(
  location: FarmLocation,
): NormalizedObservation[] {
  return [
    makeObservation(
      "airTemperature",
      location.climate.avgTemp,
      "°C",
      "regional-sample",
      "sample",
      null,
    ),
    makeObservation(
      "rainfallOutlook30d",
      location.climate.rainOutlook30d,
      "mm",
      "regional-sample",
      "sample",
      null,
    ),
    makeObservation(
      "relativeHumidity",
      location.climate.humidity,
      "%",
      "regional-sample",
      "sample",
      null,
    ),
    makeObservation(
      "soilMoisture",
      location.climate.soilMoisture,
      "%",
      "regional-sample",
      "sample",
      null,
    ),
  ];
}

function observationFor(
  observations: NormalizedObservation[],
  metric: ObservationMetric,
): NormalizedObservation | undefined {
  return observations.find((observation) => observation.metric === metric);
}

function qualityDetail(
  observation: NormalizedObservation,
  detail: string,
): string {
  const source =
    observation.quality === "sample"
      ? "Regional sample"
      : `${observation.source} observation`;
  return `${detail} · ${source}`;
}

/** Adapt normalized measurements to the dashboard's condition-card contract. */
export function adaptObservationsToConditions(
  observations: NormalizedObservation[],
): Condition[] {
  const conditions: Condition[] = [];
  const temperature = observationFor(observations, "airTemperature");
  const rainfall =
    observationFor(observations, "rainfallOutlook30d") ??
    observationFor(observations, "rainfall");
  const soilMoisture = observationFor(observations, "soilMoisture");
  const surfaceWetness = observationFor(observations, "surfaceWetness");
  const humidity = observationFor(observations, "relativeHumidity");
  const ndvi = observationFor(observations, "ndvi");

  if (temperature) {
    conditions.push({
      key: "temperature",
      label: "Temperature",
      value: String(Math.round(temperature.value)),
      unit: temperature.unit,
      detail: qualityDetail(temperature, "Air temperature"),
      status: temperature.value >= 36 ? "alert" : "good",
      icon: ThermometerIcon,
    });
  }
  if (rainfall) {
    conditions.push({
      key: "rainfall",
      label:
        rainfall.metric === "rainfallOutlook30d"
          ? "Rainfall outlook"
          : "Rainfall total",
      value: String(Number(rainfall.value.toFixed(1))),
      unit: rainfall.unit,
      detail: qualityDetail(
        rainfall,
        rainfall.metric === "rainfallOutlook30d"
          ? "30-day outlook"
          : "Total across provider date range",
      ),
      status:
        rainfall.metric === "rainfallOutlook30d" &&
        (rainfall.value < 50 || rainfall.value > 250)
          ? "watch"
          : "good",
      icon: CloudRainIcon,
    });
  }
  if (soilMoisture) {
    conditions.push({
      key: "soil",
      label: "Soil moisture",
      value: String(Math.round(soilMoisture.value)),
      unit: soilMoisture.unit,
      detail: qualityDetail(soilMoisture, "Surface estimate"),
      status:
        soilMoisture.value < 20 || soilMoisture.value > 85
          ? "alert"
          : soilMoisture.value < 30
            ? "watch"
            : "good",
      icon: WavesIcon,
    });
  }
  if (surfaceWetness) {
    conditions.push({
      key: "surfaceWetness",
      label: "Topsoil wetness index",
      value: surfaceWetness.value.toFixed(2),
      unit: surfaceWetness.unit,
      detail: qualityDetail(surfaceWetness, "Modeled surface soil wetness"),
      status: "info",
      icon: WavesIcon,
    });
  }
  if (humidity) {
    conditions.push({
      key: "humidity",
      label: "Humidity",
      value: String(Math.round(humidity.value)),
      unit: humidity.unit,
      detail: qualityDetail(humidity, "Relative humidity"),
      status: humidity.value >= 85 ? "watch" : "good",
      icon: DropletsIcon,
    });
  }
  if (ndvi) {
    conditions.push({
      key: "ndvi",
      label: "Vegetation health",
      value: ndvi.value.toFixed(2),
      unit: ndvi.unit,
      detail: qualityDetail(ndvi, "NDVI"),
      status: ndvi.value < 0.3 ? "alert" : ndvi.value < 0.6 ? "watch" : "good",
      icon: SproutIcon,
    });
  }

  return conditions;
}

/** Build current-field alerts only from measurements that are actually present. */
export function adaptObservationsToAlerts(
  observations: NormalizedObservation[],
): FarmAlert[] {
  const alerts: FarmAlert[] = [];
  const soilMoisture = observationFor(observations, "soilMoisture");
  const rainfall = observationFor(observations, "rainfallOutlook30d");
  const humidity = observationFor(observations, "relativeHumidity");

  if (soilMoisture && soilMoisture.value < 30) {
    alerts.push({
      id: "soil-moisture-low",
      title: "Soil moisture is low",
      detail: `Moisture is estimated at ${Math.round(soilMoisture.value)}%. Check the field before irrigating.`,
      severity: soilMoisture.value < 20 ? "high" : "medium",
      icon: WavesIcon,
      when:
        soilMoisture.quality === "sample"
          ? "Regional sample"
          : "Latest observation",
    });
  } else if (soilMoisture && soilMoisture.value > 85) {
    alerts.push({
      id: "soil-moisture-high",
      title: "Waterlogging may be a risk",
      detail: `Soil moisture is estimated at ${Math.round(soilMoisture.value)}%. Check field drainage.`,
      severity: "medium",
      icon: WavesIcon,
      when:
        soilMoisture.quality === "sample"
          ? "Regional sample"
          : "Latest observation",
    });
  }

  if (rainfall && rainfall.value < 50) {
    alerts.push({
      id: "rainfall-low",
      title: "Limited rainfall expected",
      detail: `The 30-day rainfall outlook is ${Math.round(rainfall.value)} mm. Plan water use around crop needs.`,
      severity: "medium",
      icon: CloudRainIcon,
      when:
        rainfall.quality === "sample"
          ? "Regional sample"
          : "Latest observation",
    });
  } else if (rainfall && rainfall.value > 250) {
    alerts.push({
      id: "rainfall-high",
      title: "High rainfall outlook",
      detail: `The 30-day rainfall outlook is ${Math.round(rainfall.value)} mm. Keep drainage channels clear.`,
      severity: "medium",
      icon: CloudRainIcon,
      when:
        rainfall.quality === "sample"
          ? "Regional sample"
          : "Latest observation",
    });
  }

  if (humidity && humidity.value >= 85) {
    alerts.push({
      id: "humidity-high",
      title: "High humidity",
      detail: "Inspect crops regularly for signs of moisture-related disease.",
      severity: "low",
      icon: DropletsIcon,
      when:
        humidity.quality === "sample"
          ? "Regional sample"
          : "Latest observation",
    });
  }

  return alerts;
}

export function buildAgronomyInsight(
  observations: NormalizedObservation[],
  recommendation?: { cropName: string; score: number },
): { title: string; detail: string } {
  const alert = adaptObservationsToAlerts(observations)[0];
  if (alert) {
    return {
      title: alert.title,
      detail: alert.detail,
    };
  }

  if (recommendation) {
    return {
      title: `Leading crop match: ${recommendation.cropName}`,
      detail: `${recommendation.score}% suitability based on the available soil, climate, and farm priorities.`,
    };
  }

  return {
    title: "More field data needed",
    detail: "Add soil and climate observations to see crop-specific guidance.",
  };
}
