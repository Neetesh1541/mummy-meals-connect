import { useState } from "react";
import { Bell, BellOff, Check, ShieldCheck, Smartphone, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNotifications } from "@/hooks/useNotifications";
import { Link } from "react-router-dom";

interface PushPermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REASONS = [
  {
    icon: Bell,
    title: "Know the moment food is ready",
    body: "Alerts for every step: placed, cooking, ready, picked up, delivered.",
  },
  {
    icon: Smartphone,
    title: "Works when the app is closed",
    body: "Push keeps live delivery tracking accurate without keeping a tab open.",
  },
  {
    icon: ShieldCheck,
    title: "Only order updates",
    body: "No marketing spam. Quiet hours and per-step toggles stay in your control.",
  },
];

export function PushPermissionDialog({ open, onOpenChange }: PushPermissionDialogProps) {
  const { permission, isSupported, requestPermission } = useNotifications();
  const [requesting, setRequesting] = useState(false);

  const denied = permission === "denied" || !isSupported;

  const handleEnable = async () => {
    setRequesting(true);
    const granted = await requestPermission();
    setRequesting(false);
    if (granted) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            {denied ? (
              <BellOff className="h-6 w-6 text-destructive" aria-hidden="true" />
            ) : (
              <Bell className="h-6 w-6 text-primary animate-pulse-soft" aria-hidden="true" />
            )}
          </div>
          <DialogTitle>
            {denied ? "Notifications are blocked" : "Turn on order notifications"}
          </DialogTitle>
          <DialogDescription>
            {denied
              ? "Your browser is blocking push alerts for this site. You can still get every update in the app."
              : "Here's exactly what you'll receive — and what you won't."}
          </DialogDescription>
        </DialogHeader>

        {denied ? (
          <div className="space-y-4 text-sm">
            <ol className="space-y-2 text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">1.</span> Tap the lock or
                settings icon in your browser&apos;s address bar.
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">2.</span> Open{" "}
                <span className="text-foreground">Site settings → Notifications</span>.
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">3.</span> Switch it to{" "}
                <span className="text-foreground">Allow</span>, then reload this page.
              </li>
            </ol>
            <div className="rounded-2xl border border-border/60 bg-muted/40 p-3">
              <p className="flex items-center gap-2 text-sm font-medium">
                <Inbox className="h-4 w-4 text-primary" aria-hidden="true" />
                Alternatives that work right now
              </p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>• In-app alerts and the notifications center keep full history.</li>
                <li>• Live order tracking updates while the dashboard is open.</li>
              </ul>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {REASONS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-medium">{title}</span>
                  <span className="block text-xs text-muted-foreground">{body}</span>
                </span>
              </li>
            ))}
          </ul>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link to="/notifications" onClick={() => onOpenChange(false)}>
              Open notifications center
            </Link>
          </Button>
          {denied ? (
            <Button size="sm" onClick={() => onOpenChange(false)}>
              Got it
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={requesting}
              onClick={handleEnable}
              className="bg-gradient-warm text-primary-foreground border-0"
            >
              <Check className="mr-1.5 h-4 w-4" aria-hidden="true" />
              {requesting ? "Waiting…" : "Enable notifications"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
