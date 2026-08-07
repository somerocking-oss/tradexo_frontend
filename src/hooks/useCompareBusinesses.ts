"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "Tradexo_compare";
const MAX_COMPARE = 3;

export function useCompareBusinesses() {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setIds(Array.isArray(parsed) ? parsed.slice(0, MAX_COMPARE) : []);
    } catch {
      setIds([]);
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((next: string[]) => {
    setIds(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const isCompared = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback(
    (id: string) => {
      if (ids.includes(id)) {
        persist(ids.filter((item) => item !== id));
        return { added: false, full: false };
      }
      if (ids.length >= MAX_COMPARE) {
        return { added: false, full: true };
      }
      persist([...ids, id]);
      return { added: true, full: false };
    },
    [ids, persist]
  );

  const remove = useCallback(
    (id: string) => {
      persist(ids.filter((item) => item !== id));
    },
    [ids, persist]
  );

  const clear = useCallback(() => persist([]), [persist]);

  return { ids, hydrated, isCompared, toggle, remove, clear, max: MAX_COMPARE };
}
