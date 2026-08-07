"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getFavorites, toggleFavorite } from "@/lib/api/favorite";
import type { Business } from "@/types";

const STORAGE_KEY = "Tradexo_saved_businesses";

function readLocalIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeLocalIds(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent("saved-businesses-change"));
}

function extractBusinessIds(data: Array<{ businessId: Business | string }>) {
  return data
    .map((item) => {
      const business = item.businessId;
      if (typeof business === "string") return business;
      return business?._id ? String(business._id) : "";
    })
    .filter(Boolean);
}

export function useSavedBusinesses() {
  const { isAuthenticated } = useAuth();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);

  const refreshFromServer = useCallback(async () => {
    const res = await getFavorites();
    if (res.success && Array.isArray(res.data)) {
      const ids = extractBusinessIds(res.data);
      setSavedIds(ids);
      writeLocalIds(ids);
      return ids;
    }
    return [];
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setSavedIds(readLocalIds());
      return;
    }

    let cancelled = false;
    setSyncing(true);

    (async () => {
      try {
        const localIds = readLocalIds();
        let serverIds = await refreshFromServer();

        for (const businessId of localIds) {
          if (!serverIds.includes(businessId)) {
            await toggleFavorite(businessId);
          }
        }

        if (localIds.length) {
          serverIds = await refreshFromServer();
        }

        if (!cancelled) {
          setSavedIds(serverIds);
        }
      } catch {
        if (!cancelled) {
          setSavedIds(readLocalIds());
        }
      } finally {
        if (!cancelled) {
          setSyncing(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, refreshFromServer]);

  useEffect(() => {
    const handler = () => {
      if (!isAuthenticated) {
        setSavedIds(readLocalIds());
      }
    };
    window.addEventListener("saved-businesses-change", handler);
    return () => window.removeEventListener("saved-businesses-change", handler);
  }, [isAuthenticated]);

  const toggle = useCallback(
    async (businessId: string) => {
      if (isAuthenticated) {
        const res = await toggleFavorite(businessId);
        if (res.success && res.data) {
          setSavedIds((current) => {
            const next = res.data!.favorited
              ? Array.from(new Set([...current, businessId]))
              : current.filter((id) => id !== businessId);
            writeLocalIds(next);
            return next;
          });
        }
        return;
      }

      const next = savedIds.includes(businessId)
        ? savedIds.filter((id) => id !== businessId)
        : [...savedIds, businessId];
      writeLocalIds(next);
      setSavedIds(next);
    },
    [isAuthenticated, savedIds]
  );

  const isSaved = useCallback(
    (businessId: string) => savedIds.includes(businessId),
    [savedIds]
  );

  return { savedIds, toggle, isSaved, syncing, refreshFromServer };
}
