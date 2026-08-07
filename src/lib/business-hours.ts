import type { Business } from "@/types";

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

type DayKey = (typeof DAY_KEYS)[number];

function parseTimeToMinutes(time?: string): number | null {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function isWithinSlot(nowMinutes: number, open?: string, close?: string) {
  const openMin = parseTimeToMinutes(open);
  const closeMin = parseTimeToMinutes(close);
  if (openMin == null || closeMin == null) return false;
  if (closeMin > openMin) {
    return nowMinutes >= openMin && nowMinutes < closeMin;
  }
  return nowMinutes >= openMin || nowMinutes < closeMin;
}

function getTodayKey(date = new Date()): DayKey {
  return DAY_KEYS[date.getDay()];
}

export function isBusinessOpenNow(business: Business, now = new Date()): boolean {
  const timing = business.timing as
    | {
        open24Hours?: boolean;
        sameForAllDays?: boolean;
        defaultOpen?: string;
        defaultClose?: string;
        weekly?: Record<
          string,
          { isClosed?: boolean; is24Hours?: boolean; open?: string; close?: string }
        >;
      }
    | undefined;

  if (timing?.open24Hours) return true;

  const today = getTodayKey(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  if (timing?.weekly?.[today]) {
    const day = timing.weekly[today];
    if (day.isClosed) return false;
    if (day.is24Hours) return true;
    return isWithinSlot(nowMinutes, day.open, day.close);
  }

  if (timing?.sameForAllDays && timing.defaultOpen && timing.defaultClose) {
    return isWithinSlot(nowMinutes, timing.defaultOpen, timing.defaultClose);
  }

  const records = business.timings || [];
  const todayRecord = records.find(
    (item) => String(item.day || "").toLowerCase() === today
  );

  if (todayRecord) {
    if (todayRecord.isClosed) return false;
    if (todayRecord.is24Hours) return true;
    const slot = todayRecord.slots?.[0];
    return isWithinSlot(nowMinutes, slot?.open, slot?.close);
  }

  return false;
}

export function getOpenStatusLabel(business: Business): "open" | "closed" | "unknown" {
  const timing = business.timing;
  const hasHours =
    !!timing ||
    (business.timings && business.timings.length > 0);

  if (!hasHours) return "unknown";
  return isBusinessOpenNow(business) ? "open" : "closed";
}
