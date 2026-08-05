import { CheckCircle2, ChefHat, Package, Truck, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export const ORDER_STEPS = [
  { key: "placed", label: "Order placed", caption: "We got your order", icon: CheckCircle2 },
  { key: "preparing", label: "Cooking", caption: "Mummy is cooking fresh", icon: ChefHat },
  { key: "ready", label: "Packed", caption: "Ready for pickup", icon: Package },
  { key: "picked_up", label: "On the way", caption: "Out for delivery", icon: Truck },
  { key: "delivered", label: "Delivered", caption: "Enjoy your meal!", icon: Home },
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  placed: "Order placed",
  preparing: "Cooking now",
  ready: "Packed & ready",
  picked_up: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function OrderStatusTimeline({ status }: { status: string }) {
  const activeIndex = Math.max(
    0,
    ORDER_STEPS.findIndex((s) => s.key === status)
  );
  const progress = (activeIndex / (ORDER_STEPS.length - 1)) * 100;

  return (
    <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 sm:p-5">
      <div className="relative">
        {/* track */}
        <div className="absolute left-0 right-0 top-5 h-1 rounded-full bg-border" aria-hidden="true" />
        <div
          className="absolute left-0 top-5 h-1 rounded-full bg-gradient-warm transition-[width] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: `${progress}%` }}
          aria-hidden="true"
        />

        <ol className="relative flex justify-between gap-1">
          {ORDER_STEPS.map((step, i) => {
            const done = i < activeIndex;
            const current = i === activeIndex;
            const Icon = step.icon;
            return (
              <li
                key={step.key}
                className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center"
              >
                <span
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500",
                    done && "border-primary bg-primary text-primary-foreground",
                    current &&
                      "scale-110 border-primary bg-primary text-primary-foreground shadow-warm",
                    !done && !current && "border-border bg-card text-muted-foreground"
                  )}
                >
                  {current && (
                    <span
                      className="absolute inset-0 rounded-full bg-primary/40 animate-ping"
                      aria-hidden="true"
                    />
                  )}
                  <Icon className="relative h-4 w-4" />
                </span>
                <span
                  className={cn(
                    "text-[11px] font-semibold leading-tight sm:text-xs transition-colors duration-500",
                    done || current ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
                <span className="hidden text-[10px] leading-tight text-muted-foreground sm:block">
                  {current ? step.caption : ""}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
