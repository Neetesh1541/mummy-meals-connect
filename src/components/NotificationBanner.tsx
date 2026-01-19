import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { useState, useEffect } from "react";

export function NotificationBanner() {
  const { permission, isSupported, requestPermission } = useNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the banner before
    const wasDismissed = localStorage.getItem('notification-banner-dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Show banner after a delay if notifications not granted
    if (isSupported && permission === 'default') {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSupported, permission]);

  const handleDismiss = () => {
    setDismissed(true);
    setIsVisible(false);
    localStorage.setItem('notification-banner-dismissed', 'true');
  };

  const handleEnable = async () => {
    await requestPermission();
    handleDismiss();
  };

  if (!isSupported || permission !== 'default' || dismissed || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-fade-up">
      <div className="glass-card !p-4 shadow-warm-lg border border-primary/20">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-primary/10 shrink-0">
            <Bell className="h-5 w-5 text-primary animate-pulse-soft" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm">Enable Notifications</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Get instant updates when your order is prepared, picked up, or delivered!
            </p>
            <div className="flex gap-2 mt-3">
              <Button 
                size="sm" 
                onClick={handleEnable}
                className="bg-gradient-warm text-white border-0 text-xs px-4"
              >
                Enable
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleDismiss}
                className="text-xs"
              >
                Maybe Later
              </Button>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 shrink-0"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
