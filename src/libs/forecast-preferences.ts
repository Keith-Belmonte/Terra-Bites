export type ForecastLeadDays = "1" | "3" | "7";

const STORAGE_KEY = "terrabites-forecast-lead-days";
const CHANGE_EVENT = "terrabites-forecast-lead-days";

export function getForecastLeadDays(): ForecastLeadDays {
  if (typeof window === "undefined") return "3";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === "1" || saved === "3" || saved === "7" ? saved : "3";
}

export function subscribeToForecastLeadDays(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function saveForecastLeadDays(value: ForecastLeadDays) {
  if (typeof window === "undefined") {
    throw new Error("Forecast preferences can only be saved in a browser.");
  }
  window.localStorage.setItem(STORAGE_KEY, value);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
