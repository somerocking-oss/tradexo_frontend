"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TrackedProfileLink } from "@/components/business/TrackedProfileLink";
import { trackProfileClick, type TrackingContext } from "@/lib/analytics/track";
import { resolveBusinessCoords } from "@/lib/geo";
import { getBusinessProfilePath } from "@/lib/business-url";
import type { Business } from "@/types";

const userIcon = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:9999px;background:#2563eb;border:3px solid white;box-shadow:0 0 0 2px #2563eb88"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const businessIcon = L.divIcon({
  className: "",
  html: `<div style="width:12px;height:12px;border-radius:9999px;background:#f97316;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.25)"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

interface ListingsMapProps {
  businesses: Business[];
  userLat?: number;
  userLng?: number;
  radiusKm?: number;
  height?: number;
  tracking?: TrackingContext;
}

export function ListingsMap({
  businesses,
  userLat,
  userLng,
  radiusKm = 25,
  height = 480,
  tracking,
}: ListingsMapProps) {
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  const mapTracking = useMemo(
    (): TrackingContext => ({
      source: tracking?.source || "map",
      keyword: tracking?.keyword,
      city: tracking?.city,
    }),
    [tracking]
  );

  const markers = useMemo(
    () =>
      businesses
        .map((business) => {
          const coords = resolveBusinessCoords(business);
          if (!coords) return null;
          return { business, ...coords };
        })
        .filter(Boolean) as Array<{ business: Business; lat: number; lng: number }>,
    [businesses]
  );

  const center = useMemo(() => {
    if (userLat != null && userLng != null) return [userLat, userLng] as [number, number];
    if (markers.length) return [markers[0].lat, markers[0].lng] as [number, number];
    return [20.5937, 78.9629] as [number, number];
  }, [userLat, userLng, markers]);

  const zoom = userLat != null ? 12 : markers.length ? 11 : 5;

  const handlePinClick = (business: Business) => {
    trackProfileClick(String(business._id), {
      source: mapTracking.source || "map",
      keyword: mapTracking.keyword,
      city: mapTracking.city || business.city,
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm" style={{ height }}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLat != null && userLng != null && (
          <>
            <Marker position={[userLat, userLng]} icon={userIcon}>
              <Popup>You are here</Popup>
            </Marker>
            <Circle
              center={[userLat, userLng]}
              radius={radiusKm * 1000}
              pathOptions={{ color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.08 }}
            />
          </>
        )}

        {markers.map(({ business, lat, lng }) => (
          <Marker
            key={business._id}
            position={[lat, lng]}
            icon={businessIcon}
            eventHandlers={{
              click: () => handlePinClick(business),
            }}
          >
            <Popup>
              <div className="min-w-[160px]">
                <p className="font-semibold text-slate-900">{business.name}</p>
                {(business.area || business.city) && (
                  <p className="text-xs text-slate-600">
                    {[business.area, business.city].filter(Boolean).join(", ")}
                  </p>
                )}
                {business.distanceKm != null && (
                  <p className="mt-1 text-xs font-medium text-[#e86200]">{business.distanceKm} km away</p>
                )}
                <TrackedProfileLink
                  businessId={String(business._id)}
                  href={getBusinessProfilePath(business)}
                  tracking={{
                    source: mapTracking.source || "map",
                    keyword: mapTracking.keyword,
                    city: mapTracking.city || business.city,
                  }}
                  className="mt-2 inline-block text-xs font-semibold text-[#ff6c00] hover:underline"
                >
                  View details →
                </TrackedProfileLink>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
