import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, BellOff, BellRing, Clock, Moon, ArrowLeft, RotateCcw, Smartphone, MonitorSmartphone, Inbox } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/hooks/useNotifications";
import { PushPermissionDialog } from "@/components/PushPermissionDialog";
import {
  useNotificationPreferences,
  type OrderStatusKey,
} from "@/hooks/useNotificationPreferences";

const STATUS_ROWS: { key: OrderStatusKey; label: string; description: string }[] = [
  { key: "placed", label: "Order placed", description: "Confirmation as soon as your order is booked" },
  { key: "preparing", label: "Chef is cooking", description: "When the mom starts preparing your meal" },
  { key: "ready", label: "Ready for pickup", description: "When your tiffin is packed and waiting" },
  { key: "picked_up", label: "Out for delivery", description: "When a delivery partner picks up your order" },
  { key: "delivered", label: "Delivered", description: "When your meal reaches your door" },
];

const SNOOZE_OPTIONS = [30, 60, 180];

export default function NotificationSettings() {
  const {
    preferences,
    setPreferences,
    reset,
    isQuietNow,
    isSnoozed,
    snoozeMinutesLeft,
    snooze,
    clearSnooze,
  } = useNotificationPreferences();
  const { permission, isSupported, requestPermission, sendNotification } = useNotifications();
  const [pushDialogOpen, setPushDialogOpen] = useState(false);

  const pushBlocked = !isSupported || permission === "denied";


  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <Header />

      <main id="main-content" className="flex-1 container max-w-3xl py-10 space-y-6">
        <div className="space-y-2">
          <Button asChild variant="ghost" size="sm" className="rounded-xl -ml-2 gap-2">
            <Link to="/profile">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to profile
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Notification settings</h1>
          <p className="text-muted-foreground">
            Choose how Mummy Meals alerts you about order updates, and set quiet hours when you would rather
            not be disturbed.
          </p>
        </div>

        {/* Channels */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Bell className="h-5 w-5 text-primary" aria-hidden="true" />
              Alert channels
            </CardTitle>
            <CardDescription>Turn each delivery channel on or off.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="push-enabled" className="flex items-center gap-2 text-base">
                  <Smartphone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Push notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  System notifications that appear even when this tab is in the background.
                </p>
                {pushBlocked && (
                  <p className="text-sm text-destructive">
                    {isSupported
                      ? "Blocked in your browser settings. Allow notifications for this site to use push."
                      : "Your browser does not support push notifications."}
                  </p>
                )}
              </div>
              <Switch
                id="push-enabled"
                checked={preferences.pushEnabled}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, pushEnabled: checked }))
                }
                aria-describedby="push-help"
              />
            </div>
            <p id="push-help" className="sr-only">
              Enables operating system notifications for order status changes.
            </p>

            {preferences.pushEnabled && isSupported && permission !== "granted" && (
              <Button onClick={requestPermission} size="sm" className="rounded-xl">
                Allow browser notifications
              </Button>
            )}

            <Separator />

            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="inapp-enabled" className="flex items-center gap-2 text-base">
                  <MonitorSmartphone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  In-app alerts
                </Label>
                <p className="text-sm text-muted-foreground">
                  Toast messages shown inside Mummy Meals while you are using it.
                </p>
              </div>
              <Switch
                id="inapp-enabled"
                checked={preferences.inAppEnabled}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, inAppEnabled: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Per-status */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl">Order status updates</CardTitle>
            <CardDescription>Pick which steps of the order timeline should alert you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {STATUS_ROWS.map((row) => (
              <div key={row.key} className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <Label htmlFor={`status-${row.key}`} className="text-base">
                    {row.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{row.description}</p>
                </div>
                <Switch
                  id={`status-${row.key}`}
                  checked={preferences.statuses[row.key]}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      statuses: { ...prev.statuses, [row.key]: checked },
                    }))
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quiet hours */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Moon className="h-5 w-5 text-primary" aria-hidden="true" />
              Quiet hours
              {isQuietNow && (
                <Badge variant="secondary" className="ml-1 gap-1">
                  <BellOff className="h-3 w-3" aria-hidden="true" />
                  Active now
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Push notifications are silenced during this window. In-app alerts still appear while you are
              actively using the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="quiet-enabled" className="text-base">
                Enable quiet hours
              </Label>
              <Switch
                id="quiet-enabled"
                checked={preferences.quietHours.enabled}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({
                    ...prev,
                    quietHours: { ...prev.quietHours, enabled: checked },
                  }))
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quiet-start">Starts at</Label>
                <Input
                  id="quiet-start"
                  type="time"
                  className="rounded-xl"
                  value={preferences.quietHours.start}
                  disabled={!preferences.quietHours.enabled}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      quietHours: { ...prev.quietHours, start: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet-end">Ends at</Label>
                <Input
                  id="quiet-end"
                  type="time"
                  className="rounded-xl"
                  value={preferences.quietHours.end}
                  disabled={!preferences.quietHours.enabled}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      quietHours: { ...prev.quietHours, end: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Overnight windows work as expected — for example 22:00 to 07:00.
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="rounded-xl gap-2"
            onClick={() =>
              sendNotification("Test notification 🔔", {
                body: "This is how order updates will look.",
                tag: "test-notification",
              })
            }
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            Send a test alert
          </Button>
          <Button variant="ghost" className="rounded-xl gap-2" onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset to defaults
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
