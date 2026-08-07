import { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";

function useOnlineStatus() {
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return online;
}

/** Slim always-present banner so users know why data looks stale. */
export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-[70] flex items-center justify-center gap-2 bg-destructive/90 px-4 py-2 text-xs font-medium text-destructive-foreground"
    >
      <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
      You&apos;re offline — showing saved data. Live tracking resumes when you reconnect.
    </div>
  );
}

/** Full fallback screen for pages that cannot work without a network. */
export function OfflineFallbackScreen({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="glass-card w-full max-w-md space-y-5 text-center">
        <div className="flex justify-center">
          <BrandLogo size={56} />
        </div>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
          <WifiOff className="h-7 w-7 text-destructive" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">No internet connection</h2>
          <p className="text-sm text-muted-foreground">
            Mummy Meals is installed and cached, so you can keep browsing saved pages. New
            menus, orders and live delivery updates need a connection.
          </p>
        </div>
        <Button
          onClick={() => (onRetry ? onRetry() : window.location.reload())}
          className="bg-gradient-warm text-primary-foreground border-0"
        >
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
      </div>
    </div>
  );
}

export { useOnlineStatus };
