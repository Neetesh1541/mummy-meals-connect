import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

/**
 * Background sync: as soon as the device comes back online (or the tab becomes
 * visible after being offline), refresh every cached query and let listeners
 * (order tracking, delivery map, notifications) refetch via `app:reconnect`.
 */
export function ReconnectSync() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const wasOffline = useRef(!navigator.onLine);

  useEffect(() => {
    const resync = (announce: boolean) => {
      queryClient.invalidateQueries();
      window.dispatchEvent(new Event("app:reconnect"));
      if (announce) {
        toast({
          title: "Back online",
          description: "Refreshing your orders and notifications…",
        });
      }
    };

    const onOnline = () => {
      wasOffline.current = false;
      resync(true);
    };

    const onOffline = () => {
      wasOffline.current = true;
    };

    const onVisible = () => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        resync(wasOffline.current);
        wasOffline.current = false;
      }
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [queryClient, toast]);

  return null;
}
