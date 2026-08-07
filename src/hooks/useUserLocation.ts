"use client";

import { useCallback, useEffect, useState } from "react";
import {
  detectLocationFromIp,
  formatGeolocationError,
  storeUserCity,
} from "@/lib/user-city";

export interface UserCoords {
  lat: number;
  lng: number;
  accuracy?: number;
  updatedAt: number;
  approximate?: boolean;
}

const STORAGE_KEY = "Tradexo_user_coords";

function readStoredCoords(): UserCoords | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserCoords) : null;
  } catch {
    return null;
  }
}

function storeCoords(coords: UserCoords) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(coords));
}

function requestGpsLocation(highAccuracy: boolean): Promise<UserCoords | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          updatedAt: Date.now(),
          approximate: false,
        });
      },
      () => resolve(null),
      {
        enableHighAccuracy: highAccuracy,
        timeout: highAccuracy ? 12000 : 8000,
        maximumAge: 300000,
      }
    );
  });
}

export function useUserLocation() {
  const [coords, setCoords] = useState<UserCoords | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isApproximate, setIsApproximate] = useState(false);

  useEffect(() => {
    setCoords(readStoredCoords());
  }, []);

  /** IP-based location — no browser permission, avoids Windows GPS errors. */
  const detectApproximateLocation = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const ipLoc = await detectLocationFromIp();
      if (ipLoc?.lat != null && ipLoc.lng != null) {
        const next: UserCoords = {
          lat: ipLoc.lat,
          lng: ipLoc.lng,
          updatedAt: Date.now(),
          approximate: true,
        };
        setCoords(next);
        storeCoords(next);
        setIsApproximate(true);
        if (ipLoc.city) storeUserCity(ipLoc.city);
        setLoading(false);
        return next;
      }
      setError("Could not detect approximate location. Enter your city manually.");
    } catch {
      setError("Could not detect approximate location. Enter your city manually.");
    }
    setLoading(false);
    return null;
  }, []);

  /** GPS location — only when user explicitly requests precise location. */
  const detectPreciseLocation = useCallback(async () => {
    setLoading(true);
    setError("");

    if (typeof window === "undefined" || !navigator.geolocation) {
      setError("GPS is not supported on this device.");
      setLoading(false);
      return detectApproximateLocation();
    }

    let gps = await requestGpsLocation(false);
    if (!gps) {
      gps = await requestGpsLocation(true);
    }

    if (gps) {
      setCoords(gps);
      storeCoords(gps);
      setIsApproximate(false);
      setLoading(false);
      return gps;
    }

    setError(formatGeolocationError(2));
    setLoading(false);
    return detectApproximateLocation();
  }, [detectApproximateLocation]);

  /** Default: IP first — no permission prompt, no Windows GPS console errors. */
  const detectLocation = useCallback(async () => {
    const stored = readStoredCoords();
    if (stored) {
      setCoords(stored);
      setIsApproximate(!!stored.approximate);
      return stored;
    }
    return detectApproximateLocation();
  }, [detectApproximateLocation]);

  const clearLocation = useCallback(() => {
    setCoords(null);
    setError("");
    setIsApproximate(false);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    coords,
    loading,
    error,
    isApproximate,
    detectLocation,
    detectPreciseLocation,
    detectApproximateLocation,
    clearLocation,
    hasLocation: !!coords,
  };
}
