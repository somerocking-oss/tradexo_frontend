"use client";

import { useCallback, useEffect, useState } from "react";
import {
  detectUserCityFromIp,
  getStoredUserCity,
  storeUserCity,
} from "@/lib/user-city";

export function useUserCity(options?: { autoDetect?: boolean }) {
  const autoDetect = options?.autoDetect !== false;
  const [city, setCityState] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [wasAutoDetected, setWasAutoDetected] = useState(false);
  const [detectError, setDetectError] = useState("");

  const setCity = useCallback((value: string) => {
    setCityState(value);
    setDetectError("");
    if (value.trim()) storeUserCity(value);
  }, []);

  const detectCity = useCallback(async () => {
    setDetecting(true);
    setDetectError("");
    try {
      const detected = await detectUserCityFromIp();
      if (detected) {
        setCityState(detected);
        storeUserCity(detected);
        setWasAutoDetected(true);
        return detected;
      }
      setDetectError("Could not detect your city. Please type it manually.");
    } catch {
      setDetectError("Could not detect your city. Please type it manually.");
    } finally {
      setDetecting(false);
    }
    return null;
  }, []);

  useEffect(() => {
    const stored = getStoredUserCity();
    if (stored) {
      setCityState(stored);
      return;
    }
    if (!autoDetect) return;

    const run = () => {
      detectCity();
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }

    const timer = window.setTimeout(run, 2000);
    return () => window.clearTimeout(timer);
  }, [autoDetect, detectCity]);

  useEffect(() => {
    const onCityChange = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail) setCityState(detail);
    };
    window.addEventListener("user-city-change", onCityChange);
    return () => window.removeEventListener("user-city-change", onCityChange);
  }, []);

  return { city, setCity, detecting, wasAutoDetected, detectError, detectCity };
}
