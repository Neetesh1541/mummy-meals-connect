import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface NotificationHistoryItem {
  id: string;
  title: string;
  body?: string;
  statusKey?: string;
  /** In-app route this alert deep-links to (e.g. /customer-dashboard?order=123). */
  link?: string;
  channel: "push" | "in-app" | "silenced";
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

interface HistoryContextValue {
  items: NotificationHistoryItem[];
  unreadCount: number;
  addItem: (item: Omit<NotificationHistoryItem, "id" | "createdAt" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
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

  const markAllRead = useCallback(() => {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearAll = useCallback(() => setItems([]), []);

  const unreadCount = useMemo(() => items.filter((i) => !i.read).length, [items]);

  const value = useMemo(
    () => ({ items, unreadCount, addItem, markRead, markAllRead, removeItem, clearAll }),
    [items, unreadCount, addItem, markRead, markAllRead, removeItem, clearAll]
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
