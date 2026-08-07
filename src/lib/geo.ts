import { getCityCoordinates } from "@/lib/city-coordinates";
import type { Business } from "@/types";

type BusinessWithLocations = Business & {
  locations?: Array<{
    city?: string;
    area?: string;
    state?: string;
    pincode?: string;
    location?: { coordinates?: [number, number] };
  }>;
  latitude?: number;
  longitude?: number;
  coordSource?: string;
};

export function resolveBusinessCoords(
  business: BusinessWithLocations
): { lat: number; lng: number } | null {
  if (business.latitude != null && business.longitude != null) {
    return { lat: Number(business.latitude), lng: Number(business.longitude) };
  }

  const coords = business.locations?.[0]?.location?.coordinates;
  if (Array.isArray(coords) && coords.length >= 2) {
    return { lat: Number(coords[1]), lng: Number(coords[0]) };
  }

  const city = business.city || business.locations?.[0]?.city;
  return getCityCoordinates(city);
}

export function normalizeSearchBusiness(business: BusinessWithLocations): Business {
  const firstLocation = business.locations?.[0];
  const coords = resolveBusinessCoords(business);

  return {
    ...business,
    city: business.city || firstLocation?.city,
    area: business.area || firstLocation?.area,
    state: business.state || firstLocation?.state,
    pincode: business.pincode || firstLocation?.pincode,
    latitude: coords?.lat,
    longitude: coords?.lng,
  };
}

export function formatDistanceKm(km?: number) {
  if (km == null) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(km < 10 ? 1 : 0)} km`;
}
