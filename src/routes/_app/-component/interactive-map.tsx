import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { FertilizerPlace } from "@/lib/openstreetmap.ts";
import { distanceInKilometers } from "@/lib/openstreetmap.ts";
import {
  getMapStationValue,
  type ClimateLayer,
  type MapStation,
} from "@/lib/map-layer.ts";
import type { MapCenter, MapMode } from "@/lib/map-types.ts";

const PHILIPPINES_CENTER: [number, number] = [12.8797, 121.774];

export default function InteractiveMap({
  mode,
  layer,
  monthIndex,
  stations,
  selectedLocationId,
  center,
  suppliers,
}: {
  mode: MapMode;
  layer: ClimateLayer;
  monthIndex: number;
  stations: MapStation[];
  selectedLocationId: string;
  center: MapCenter;
  suppliers: FertilizerPlace[];
}) {
  const mapCenter: [number, number] =
    mode === "suppliers"
      ? [center.latitude, center.longitude]
      : PHILIPPINES_CENTER;
  const mapZoom = mode === "suppliers" ? 10 : 5;

  return (
    <MapContainer
      key={mode}
      center={mapCenter}
      zoom={mapZoom}
      minZoom={4}
      maxZoom={17}
      scrollWheelZoom
      className="z-0 h-[min(68vh,680px)] min-h-[360px] w-full rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {mode === "climate" &&
        stations.map((station) => {
          const metric = getMapStationValue(station, layer, monthIndex);
          const selected = station.location.id === selectedLocationId;
          return (
            <CircleMarker
              key={station.location.id}
              center={[station.location.lat, station.location.lng]}
              radius={selected ? 12 : 9}
              pathOptions={{
                color: "#ffffff",
                fillColor: metric.color,
                fillOpacity: 0.9,
                weight: selected ? 4 : 2,
              }}
            >
              <Popup>
                <div className="min-w-44">
                  <p className="font-bold">{station.location.city}</p>
                  <p className="text-sm">{station.location.province}</p>
                  <p className="mt-1 text-sm font-semibold">{metric.value}</p>
                  <p className="mt-1 text-xs">
                    Main crops: {station.location.profile.mainCrops.join(", ")}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

      {mode === "suppliers" && (
        <>
          <CircleMarker
            center={[center.latitude, center.longitude]}
            radius={8}
            pathOptions={{
              color: "#ffffff",
              fillColor: "#2563eb",
              fillOpacity: 1,
              weight: 3,
            }}
          >
            <Popup>
              <p className="font-semibold">{center.label}</p>
              <p className="text-sm">Search center</p>
            </Popup>
          </CircleMarker>
          {suppliers.map((place) => (
            <CircleMarker
              key={place.id}
              center={[place.latitude, place.longitude]}
              radius={9}
              pathOptions={{
                color: "#ffffff",
                fillColor: "#15803d",
                fillOpacity: 0.95,
                weight: 2,
              }}
            >
              <Popup>
                <div className="min-w-44">
                  <p className="font-bold">{place.name}</p>
                  <p className="text-sm">{place.category}</p>
                  <p className="mt-1 text-sm">
                    {distanceInKilometers(center, place).toFixed(1)} km away
                  </p>
                  <a
                    className="mt-1 inline-block text-sm font-semibold text-green-800 underline"
                    href={`https://www.openstreetmap.org/?mlat=${place.latitude}&mlon=${place.longitude}#map=16/${place.latitude}/${place.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open listing
                  </a>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </>
      )}
    </MapContainer>
  );
}
