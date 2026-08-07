import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { useState, useEffect } from "react";
import { PushPermissionDialog } from "@/components/PushPermissionDialog";

export function NotificationBanner() {
  const { permission, isSupported } = useNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem("notification-banner-dismissed");
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    if (isSupported && permission === "default") {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSupported, permission]);

  const handleDismiss = () => {
    setDismissed(true);
    setIsVisible(false);
    localStorage.setItem("notification-banner-dismissed", "true");
  };

  if (!isSupported || permission !== "default" || dismissed || !isVisible) {
    return (
      <PushPermissionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    );
  }

  return (
    <>
      <div
        role="region"
        aria-label="Notification permission prompt"
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-fade-up"
      >
        <div className="glass-card !p-4 shadow-warm-lg border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary/10 shrink-0">
              <Bell className="h-5 w-5 text-primary animate-pulse-soft" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm">Stay updated on your meal</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Order updates only — placed, cooking, ready, on the way, delivered. No marketing.
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={() => setDialogOpen(true)}
                  className="bg-gradient-warm text-primary-foreground border-0 text-xs px-4"
                >
                  See how it works
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDismiss} className="text-xs">
                  Maybe Later
                </Button>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0"
              onClick={handleDismiss}
              aria-label="Dismiss notification prompt"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <PushPermissionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
