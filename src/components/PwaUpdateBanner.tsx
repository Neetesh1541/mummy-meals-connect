import { useEffect, useState } from "react";
import { RefreshCw, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { registerAppServiceWorker } from "@/lib/registerServiceWorker";

export function PwaUpdateBanner() {
  const [reload, setReload] = useState<(() => Promise<void> | void) | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    registerAppServiceWorker({
      onNeedRefresh: (doReload) => {
        setDismissed(false);
        setReload(() => doReload);
      },
    });
  }, []);

  if (!reload || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 top-4 z-[60] mx-auto max-w-md animate-fade-up md:inset-x-auto md:right-4 md:w-96"
    >
      <div className="glass-card !p-4 border border-primary/25 shadow-warm-lg">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-xl bg-primary/10 p-2">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold">New version available</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Reload to get the latest fixes and keep order notifications and live tracking
              reliable.
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                disabled={reloading}
                onClick={async () => {
                  setReloading(true);
                  await reload();
                }}
                className="bg-gradient-warm text-primary-foreground border-0 px-4 text-xs"
              >
                <RefreshCw
                  className={`mr-1.5 h-3.5 w-3.5 ${reloading ? "animate-spin" : ""}`}
                  aria-hidden="true"
                />
                {reloading ? "Updating…" : "Reload now"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs"
                onClick={() => setDismissed(true)}
              >
                Later
              </Button>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
            aria-label="Dismiss update notice"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
