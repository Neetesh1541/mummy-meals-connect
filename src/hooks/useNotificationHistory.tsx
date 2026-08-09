import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type NotificationCategory = "order" | "delivery" | "system";

export interface NotificationHistoryItem {
  id: string;
  title: string;
  body?: string;
  statusKey?: string;
  /** In-app route this alert deep-links to (e.g. /customer-dashboard?order=123). */
  link?: string;
  channel: "push" | "in-app" | "silenced";
  /** High-level alert type used for filtering. */
  category?: NotificationCategory;
  createdAt: number;
  read: boolean;
}

const STORAGE_KEY = "mummy-meals-notification-history";
const MAX_ITEMS = 100;

function readStored(): NotificationHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as NotificationHistoryItem[]) : [];
  } catch {
    return [];
  }
}

/** A stored link matches the current route when path matches and every link param is present. */
export function linkMatchesRoute(link: string, route: string): boolean {
  try {
    const a = new URL(link, "http://x");
    const b = new URL(route, "http://x");
    if (a.pathname !== b.pathname) return false;
    for (const [k, v] of a.searchParams.entries()) {
      if (b.searchParams.get(k) !== v) return false;
    }
    return true;
  } catch {
    return false;
  }
}

interface HistoryContextValue {
  items: NotificationHistoryItem[];
  unreadCount: number;
  addItem: (item: Omit<NotificationHistoryItem, "id" | "createdAt" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  /** Marks every alert whose deep-link matches the given route as read. */
  markReadByLink: (route: string) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
}

const Ctx = createContext<HistoryContextValue | undefined>(undefined);

export function NotificationHistoryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<NotificationHistoryItem[]>(readStored);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, [items]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(readStored());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addItem = useCallback<HistoryContextValue["addItem"]>((item) => {
    setItems((prev) => {
      const entry: NotificationHistoryItem = {
        ...item,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
        read: false,
      };
      return [entry, ...prev].slice(0, MAX_ITEMS);
    });
  }, []);

  const markRead = useCallback((id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)));
  }, []);

  const markReadByLink = useCallback((route: string) => {
    if (!route) return;
    setItems((prev) => {
      let changed = false;
      const next = prev.map((i) => {
        if (i.read || !i.link) return i;
        if (linkMatchesRoute(i.link, route)) {
          changed = true;
          return { ...i, read: true };
        }
        return i;
      });
      return changed ? next : prev;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearAll = useCallback(() => setItems([]), []);

  const unreadCount = useMemo(() => items.filter((i) => !i.read).length, [items]);

  const value = useMemo(
    () => ({
      items,
      unreadCount,
      addItem,
      markRead,
      markReadByLink,
      markAllRead,
      removeItem,
      clearAll,
    }),
    [items, unreadCount, addItem, markRead, markReadByLink, markAllRead, removeItem, clearAll]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNotificationHistory(): HistoryContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error(
      "useNotificationHistory must be used within a NotificationHistoryProvider"
    );
  }
  return ctx;
}
