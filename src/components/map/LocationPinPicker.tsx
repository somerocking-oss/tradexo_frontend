"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCityCoordinates } from "@/lib/city-coordinates";
import { useUserLocation } from "@/hooks/useUserLocation";

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="width:28px;height:28px;border-radius:9999px 9999px 9999px 0;background:#0284c7;border:3px solid white;transform:rotate(-45deg);box-shadow:0 4px 10px rgba(0,0,0,.25)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

function MapClickHandler({
  onChange,
}: {
  onChange: (coords: { latitude: number; longitude: number }) => void;
}) {
  useMapEvents({
    click(event) {
      onChange({ latitude: event.latlng.lat, longitude: event.latlng.lng });
    },
  });
  return null;
}

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], Math.max(map.getZoom(), 14), { animate: true });
  }, [lat, lng, map]);
  return null;
}

interface LocationPinPickerProps {
  latitude?: string | number;
  longitude?: string | number;
  city?: string;
  onChange: (coords: { latitude: number; longitude: number }) => void;
}

export function LocationPinPicker({
  latitude,
  longitude,
  city,
  onChange,
}: LocationPinPickerProps) {
  const { coords, loading, error, detectPreciseLocation } = useUserLocation();
  const [ready, setReady] = useState(false);

  const latNum =
    latitude != null && latitude !== "" ? Number(latitude) : null;
  const lngNum =
    longitude != null && longitude !== "" ? Number(longitude) : null;
  const hasPin =
    latNum != null &&
    lngNum != null &&
    !Number.isNaN(latNum) &&
    !Number.isNaN(lngNum);

  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
    setReady(true);
  }, []);

  const center = useMemo(() => {
    if (hasPin) return [latNum!, lngNum!] as [number, number];
    const cityCoords = getCityCoordinates(city);
    if (cityCoords) return [cityCoords.lat, cityCoords.lng] as [number, number];
    if (coords) return [coords.lat, coords.lng] as [number, number];
    return [20.5937, 78.9629] as [number, number];
  }, [hasPin, latNum, lngNum, city, coords]);

  const zoom = hasPin || getCityCoordinates(city) || coords ? 14 : 5;

  const handleUseMyLocation = async () => {
    const location = coords || (await detectPreciseLocation());
    if (location) {
      onChange({ latitude: location.lat, longitude: location.lng });
    }
  };

  if (!ready) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500">
        Loading map...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="outline" loading={loading} onClick={handleUseMyLocation}>
          <LocateFixed className="h-4 w-4" /> Use my location
        </Button>
        <span className="text-xs text-slate-500">Or tap the map to drop your shop pin</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
        <MapContainer center={center} zoom={zoom} scrollWheelZoom className="h-56 w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onChange={onChange} />
          {hasPin && (
            <>
              <MapRecenter lat={latNum!} lng={lngNum!} />
              <Marker
                position={[latNum!, lngNum!]}
                icon={pinIcon}
                draggable
                eventHandlers={{
                  dragend: (event) => {
                    const point = event.target.getLatLng();
                    onChange({ latitude: point.lat, longitude: point.lng });
                  },
                }}
              />
            </>
          )}
        </MapContainer>
      </div>

      {hasPin ? (
        <p className="flex items-center gap-1.5 text-xs text-emerald-700">
          <MapPin className="h-3.5 w-3.5" />
          Pin set: {latNum!.toFixed(5)}, {lngNum!.toFixed(5)} — drag to adjust
        </p>
      ) : (
        <p className="text-xs text-amber-700">
          No pin yet. Use GPS or tap the map so buyers find you on Near Me search.
        </p>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
