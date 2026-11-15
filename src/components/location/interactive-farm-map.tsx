import "leaflet/dist/leaflet.css";
import { type WMSParams } from "leaflet";
import { useState } from "react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  WMSTileLayer,
  useMapEvents,
} from "react-leaflet";

type InteractiveFarmMapProps = {
  latitude: number | null;
  longitude: number | null;
  onSelect: (latitude: number, longitude: number) => void;
};

function MapClickHandler({
  onSelect,
}: Pick<InteractiveFarmMapProps, "onSelect">) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export default function InteractiveFarmMap({
  latitude,
  longitude,
  onSelect,
}: InteractiveFarmMapProps) {
  const [nasaLayer, setNasaLayer] = useState<"off" | "ndvi" | "soil-moisture">("off");
  const center: [number, number] =
    latitude !== null && longitude !== null ? [latitude, longitude] : [0, 0];
  const nasaParams: WMSParams | null =
    nasaLayer === "ndvi"
      ? { layers: "VIIRS_NOAA20_NDVI_8Day" }
      : nasaLayer === "soil-moisture"
        ? { layers: "SMAP_L4_Analyzed_Surface_Soil_Moisture" }
        : null;

  return (
    <div>
      <label className="flex min-h-12 items-center justify-between gap-3 px-4 text-sm font-semibold">
        <span>NASA Earth observation layer</span>
        <select
          value={nasaLayer}
          onChange={(event) => {
            const value = event.currentTarget.value;
            if (value === "off" || value === "ndvi" || value === "soil-moisture") {
              setNasaLayer(value);
            }
          }}
          className="h-10 max-w-56 rounded-xl border border-border bg-card px-3 text-sm font-medium"
        >
          <option value="off">Off</option>
          <option value="ndvi">VIIRS vegetation (NDVI)</option>
          <option value="soil-moisture">SMAP soil moisture</option>
        </select>
      </label>
      <MapContainer
        key={`${center[0]}:${center[1]}`}
        center={center}
        zoom={latitude === null ? 2 : 16}
        scrollWheelZoom
        className="h-80 w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {nasaParams !== null && (
          <WMSTileLayer
            url="https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi"
            format="image/png"
            transparent
            version="1.3.0"
            params={nasaParams}
            attribution={`NASA <a href="https://earthdata.nasa.gov/gibs">GIBS / EOSDIS</a> · ${nasaLayer === "ndvi" ? "VIIRS NDVI" : "SMAP surface soil moisture"}`}
          />
        )}
        <MapClickHandler onSelect={onSelect} />
        {latitude !== null && longitude !== null && (
          <CircleMarker
            center={center}
            radius={9}
            pathOptions={{ color: "#166534", fillOpacity: 0.9 }}
          />
        )}
      </MapContainer>
      <p className="px-4 py-2 text-xs text-muted-foreground">
        {nasaLayer === "ndvi"
          ? "NASA VIIRS NDVI is an 8-day satellite vegetation-index image for broad visual context, not a field-level crop-health measurement."
          : nasaLayer === "soil-moisture"
            ? "NASA SMAP surface soil moisture is a coarse satellite/model analysis for regional context, not a farm soil test or plot-level measurement."
            : "NASA GIBS satellite layers are optional visual context; they do not replace field measurements."}
      </p>
    </div>
  );
}
