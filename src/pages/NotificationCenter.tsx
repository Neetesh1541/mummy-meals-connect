import { useMemo, useState } from "react";
import { Bell, BellRing, CheckCheck, Trash2, Inbox, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useNotificationHistory } from "@/hooks/useNotificationHistory";
import { useNotifications } from "@/hooks/useNotifications";
import { PushPermissionDialog } from "@/components/PushPermissionDialog";
import { Link } from "react-router-dom";

function timeAgo(ts: number): string {
  const diff = Math.max(0, Date.now() - ts) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export default function NotificationCenter() {
  const { items, unreadCount, markRead, markAllRead, removeItem, clearAll } =
    useNotificationHistory();
  const { permission, isSupported } = useNotifications();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const visible = useMemo(
    () => (filter === "unread" ? items.filter((i) => !i.read) : items),
    [items, filter]
  );

  const pushOn = isSupported && permission === "granted";

  return (
    <DashboardShell
      eyebrow="Notifications"
      title="Your alert history"
      subtitle="Every order update we've sent you, in one place. Mark them read or clear the list anytime."
      maxWidth="max-w-4xl"
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="mr-2 h-4 w-4" aria-hidden="true" />
            Mark all read
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl text-destructive hover:text-destructive"
            onClick={clearAll}
            disabled={items.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Clear all
          </Button>
        </>
      }
    >
      <section className="glass-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={filter === "all" ? "default" : "ghost"}
              className="rounded-xl"
              onClick={() => setFilter("all")}
            >
              All
              <Badge variant="secondary" className="ml-2">{items.length}</Badge>
            </Button>
            <Button
              size="sm"
              variant={filter === "unread" ? "default" : "ghost"}
              className="rounded-xl"
              onClick={() => setFilter("unread")}
            >
              Unread
              <Badge variant="secondary" className="ml-2">{unreadCount}</Badge>
            </Button>
          </div>
          <Button variant="link" size="sm" asChild className="text-xs">
            <Link to="/settings/notifications">Notification settings</Link>
          </Button>
        </div>

        {!pushOn && (
          <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <BellOff className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium">Push alerts are off</p>
                <p className="text-xs text-muted-foreground">
                  You&apos;ll still see in-app alerts here. Turn on push to get updates when the
                  app is closed.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-gradient-warm text-primary-foreground border-0"
              onClick={() => setDialogOpen(true)}
            >
              <BellRing className="mr-2 h-4 w-4" aria-hidden="true" />
              Learn more
            </Button>
          </div>
        )}

        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Inbox className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="font-medium">
              {filter === "unread" ? "No unread alerts" : "No notifications yet"}
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Order updates will appear here as soon as your meal is placed, cooked, picked up
              and delivered.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {visible.map((item) => (
              <li
                key={item.id}
                className={`flex items-start gap-3 py-4 smooth-transition ${
                  item.read ? "opacity-70" : ""
                }`}
              >
                <span
                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    item.read ? "bg-muted" : "bg-primary/10"
                  }`}
                >
                  <Bell
                    className={`h-5 w-5 ${item.read ? "text-muted-foreground" : "text-primary"}`}
                    aria-hidden="true"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{item.title}</p>
                    {!item.read && (
                      <span className="h-2 w-2 rounded-full bg-primary" aria-label="Unread" />
                    )}
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {item.channel === "push" ? "Push" : "In-app"}
                    </Badge>
                  </div>
                  {item.body && (
                    <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">{timeAgo(item.createdAt)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {!item.read && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      aria-label="Mark as read"
                      onClick={() => markRead(item.id)}
                    >
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    aria-label="Remove notification"
                    onClick={() => removeItem(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <PushPermissionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </DashboardShell>
  );
}
