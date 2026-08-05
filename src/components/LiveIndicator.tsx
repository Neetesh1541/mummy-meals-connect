import { Radio, RefreshCw, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

export type LiveStatus = "live" | "connecting" | "polling";

const CONFIG: Record<LiveStatus, { label: string; className: string }> = {
  live: {
    label: "Live",
    className: "border-secondary/40 bg-secondary/10 text-secondary",
  },
  connecting: {
    label: "Connecting…",
    className: "border-accent/40 bg-accent/10 text-accent-foreground",
  },
  polling: {
    label: "Auto-refreshing",
    className: "border-border bg-muted text-muted-foreground",
  },
};

export function LiveIndicator({
  status,
  lastUpdatedAgo,
  className,
}: {
  status: LiveStatus;
  lastUpdatedAgo?: string;
  className?: string;
}) {
  const cfg = CONFIG[status];
  const Icon = status === "live" ? Radio : status === "polling" ? RefreshCw : WifiOff;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
        cfg.className,
        className
      )}
      aria-live="polite"
    >
      <span className="relative flex h-2 w-2">
        {status === "live" && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
        )}
        <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
      </span>
      <Icon className={cn("h-3 w-3", status === "polling" && "animate-spin")} />
      {cfg.label}
      {lastUpdatedAgo && (
        <span className="font-normal opacity-80">· {lastUpdatedAgo}</span>
      )}
    </span>
  );
}
