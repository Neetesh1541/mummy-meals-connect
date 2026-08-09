import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BellRing,
  CheckCheck,
  Trash2,
  Inbox,
  BellOff,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Clock,
  Download,
  FileText,
  Package,
  Bike,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  useNotificationHistory,
  type NotificationCategory,
} from "@/hooks/useNotificationHistory";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { PushPermissionDialog } from "@/components/PushPermissionDialog";
import { Link, useNavigate } from "react-router-dom";
import { exportNotificationsCsv, exportNotificationsPdf } from "@/lib/notification-export";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 10;

function timeAgo(ts: number): string {
  const diff = Math.max(0, Date.now() - ts) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

const CHANNEL_LABEL: Record<string, string> = {
  push: "Push",
  "in-app": "In-app",
  silenced: "Silenced",
};

type TypeFilter = "all" | NotificationCategory;

const TYPE_TABS: { value: TypeFilter; label: string; icon: typeof Bell }[] = [
  { value: "all", label: "All types", icon: Bell },
  { value: "order", label: "Order", icon: Package },
  { value: "delivery", label: "Delivery", icon: Bike },
  { value: "system", label: "System", icon: Settings2 },
];

const TYPE_ICON: Record<string, typeof Bell> = {
  order: Package,
  delivery: Bike,
  system: Settings2,
};

export default function NotificationCenter() {
  const { items, unreadCount, markRead, markAllRead, removeItem, clearAll } =
    useNotificationHistory();
  const { permission, isSupported } = useNotifications();
  const { isSnoozed, snoozeMinutesLeft, snooze, clearSnooze } = useNotificationPreferences();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length, order: 0, delivery: 0, system: 0 };
    items.forEach((i) => {
      const key = i.category ?? "system";
      counts[key] = (counts[key] ?? 0) + 1;
    });
    return counts;
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (filter === "unread" && i.read) return false;
      if (typeFilter !== "all" && (i.category ?? "system") !== typeFilter) return false;
      if (!q) return true;
      return (
        i.title.toLowerCase().includes(q) ||
        (i.body ?? "").toLowerCase().includes(q) ||
        (i.statusKey ?? "").toLowerCase().includes(q)
      );
    });
  }, [items, filter, typeFilter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [query, filter, typeFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pushOn = isSupported && permission === "granted";

  const openItem = (id: string, link?: string) => {
    markRead(id);
    if (link) navigate(link);
  };

  const handleExport = async (kind: "csv" | "pdf") => {
    if (filtered.length === 0) {
      toast({ title: "Nothing to export", description: "No alerts match the current filters." });
      return;
    }
    try {
      if (kind === "csv") exportNotificationsCsv(filtered);
      else await exportNotificationsPdf(filtered);
      toast({
        title: `Exported ${filtered.length} alert${filtered.length === 1 ? "" : "s"}`,
        description: `Your ${kind.toUpperCase()} download has started.`,
      });
    } catch {
      toast({
        title: "Export failed",
        description: "We couldn't build the file. Please try again.",
        variant: "destructive",
      });
    }
  };


  return (
    <DashboardShell
      eyebrow="Notifications"
      title="Your alert history"
      subtitle="Search every order update we've sent, jump straight to the order, or silence alerts for a while."
      maxWidth="max-w-4xl"
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => (isSnoozed ? clearSnooze() : snooze(60))}
          >
            {isSnoozed ? (
              <>
                <BellRing className="mr-2 h-4 w-4" aria-hidden="true" />
                Resume alerts
              </>
            ) : (
              <>
                <Clock className="mr-2 h-4 w-4" aria-hidden="true" />
                Snooze 1 hour
              </>
            )}
          </Button>
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
            className="rounded-xl"
            onClick={() => handleExport("csv")}
            disabled={filtered.length === 0}
          >
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => handleExport("pdf")}
            disabled={filtered.length === 0}
          >
            <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
            PDF
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
        {isSnoozed && (
          <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-sm">
              <BellOff className="h-4 w-4 text-primary" aria-hidden="true" />
              Alerts snoozed for {snoozeMinutesLeft} more minute
              {snoozeMinutesLeft === 1 ? "" : "s"} — history keeps recording.
            </p>
            <Button size="sm" variant="secondary" className="rounded-xl" onClick={clearSnooze}>
              Resume now
            </Button>
          </div>
        )}

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

        <div
          className="flex flex-wrap gap-1.5 rounded-2xl border border-border/60 bg-card/60 p-1.5 backdrop-blur-sm"
          role="group"
          aria-label="Filter alerts by type"
        >
          {TYPE_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = typeFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                aria-pressed={active}
                onClick={() => setTypeFilter(tab.value)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium smooth-transition ${
                  active
                    ? "bg-primary text-primary-foreground shadow-warm"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {tab.label}
                <span
                  className={`rounded-full px-1.5 text-[10px] ${
                    active ? "bg-primary-foreground/20" : "bg-muted"
                  }`}
                >
                  {typeCounts[tab.value] ?? 0}
                </span>
              </button>
            );
          })}
        </div>


        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search alerts by keyword, e.g. delivered"
            aria-label="Search notifications"
            className="rounded-xl pl-9"
          />
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
              Enable push again
            </Button>
          </div>
        )}

        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Inbox className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="font-medium">
              {query
                ? "No alerts match your search"
                : filter === "unread"
                  ? "No unread alerts"
                  : "No notifications yet"}
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {query
                ? "Try a different keyword like “ready”, “delivered” or a dish name."
                : "Order updates will appear here as soon as your meal is placed, cooked, picked up and delivered."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {visible.map((item) => {
              const category = item.category ?? "system";
              const ItemIcon = TYPE_ICON[category] ?? Bell;
              return (
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
                  <ItemIcon
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
                    <Badge variant="secondary" className="text-[10px] uppercase">
                      {category}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {CHANNEL_LABEL[item.channel] ?? item.channel}
                    </Badge>
                  </div>

                  {item.body && (
                    <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <p className="text-xs text-muted-foreground">{timeAgo(item.createdAt)}</p>
                    {item.link && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={() => openItem(item.id, item.link)}
                      >
                        View order status
                        <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                      </Button>
                    )}
                  </div>
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
              );
            })}

          </ul>
        )}

        {filtered.length > PAGE_SIZE && (
          <nav
            className="flex items-center justify-between gap-3 border-t border-border/60 pt-4"
            aria-label="Notification pages"
          >
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                Newer
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Older
                <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </nav>
        )}
      </section>

      <PushPermissionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </DashboardShell>
  );
}
