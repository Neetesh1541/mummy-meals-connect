import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type OrderStatusKey = "placed" | "preparing" | "ready" | "picked_up" | "delivered";

export interface NotificationPreferences {
  pushEnabled: boolean;
  inAppEnabled: boolean;
  statuses: Record<OrderStatusKey, boolean>;
  quietHours: {
    enabled: boolean;
    start: string; // "HH:MM"
    end: string; // "HH:MM"
  };
  /** Epoch ms until which alerts are silenced (history is still recorded). */
  snoozedUntil: number | null;
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  pushEnabled: true,
  inAppEnabled: true,
  statuses: {
    placed: true,
    preparing: true,
    ready: true,
    picked_up: true,
    delivered: true,
  },
  quietHours: { enabled: false, start: "22:00", end: "07:00" },
  snoozedUntil: null,
};

const STORAGE_KEY = "mummy-meals-notification-prefs";

function readStored(): NotificationPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      statuses: { ...DEFAULT_PREFERENCES.statuses, ...(parsed.statuses ?? {}) },
      quietHours: { ...DEFAULT_PREFERENCES.quietHours, ...(parsed.quietHours ?? {}) },
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function toMinutes(value: string): number {
  const [h, m] = value.split(":").map((n) => Number.parseInt(n, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

export function isWithinQuietHours(prefs: NotificationPreferences, now = new Date()): boolean {
  if (!prefs.quietHours.enabled) return false;
  const start = toMinutes(prefs.quietHours.start);
  const end = toMinutes(prefs.quietHours.end);
  const current = now.getHours() * 60 + now.getMinutes();
  if (start === end) return false;
  // Overnight window (e.g. 22:00 → 07:00)
  if (start > end) return current >= start || current < end;
  return current >= start && current < end;
}

interface NotificationPreferencesContextValue {
  preferences: NotificationPreferences;
  setPreferences: (updater: (prev: NotificationPreferences) => NotificationPreferences) => void;
  reset: () => void;
  isQuietNow: boolean;
  shouldNotify: (status?: string) => { push: boolean; inApp: boolean };
}

const Ctx = createContext<NotificationPreferencesContextValue | undefined>(undefined);

export function NotificationPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPrefsState] = useState<NotificationPreferences>(readStored);
  const [minuteTick, setMinuteTick] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      /* storage unavailable */
    }
  }, [preferences]);

  useEffect(() => {
    const id = setInterval(() => setMinuteTick((v) => v + 1), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setPrefsState(readStored());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setPreferences = useCallback(
    (updater: (prev: NotificationPreferences) => NotificationPreferences) => {
      setPrefsState((prev) => updater(prev));
    },
    []
  );

  const reset = useCallback(() => setPrefsState(DEFAULT_PREFERENCES), []);

  const isQuietNow = useMemo(() => {
    void minuteTick;
    return isWithinQuietHours(preferences);
  }, [preferences, minuteTick]);

  const shouldNotify = useCallback(
    (status?: string) => {
      const statusAllowed =
        !status || preferences.statuses[status as OrderStatusKey] !== false;
      if (!statusAllowed) return { push: false, inApp: false };
      return {
        push: preferences.pushEnabled && !isQuietNow,
        inApp: preferences.inAppEnabled,
      };
    },
    [preferences, isQuietNow]
  );

  const value = useMemo(
    () => ({ preferences, setPreferences, reset, isQuietNow, shouldNotify }),
    [preferences, setPreferences, reset, isQuietNow, shouldNotify]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNotificationPreferences() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useNotificationPreferences must be used within a NotificationPreferencesProvider");
  }
  return ctx;
}
