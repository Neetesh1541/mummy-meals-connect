import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Tone = "primary" | "secondary" | "accent" | "muted";

const toneRing: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  accent: "bg-accent/20 text-accent-foreground",
  muted: "bg-muted text-muted-foreground",
};

const toneBar: Record<Tone, string> = {
  primary: "bg-gradient-warm",
  secondary: "bg-gradient-fresh",
  accent: "bg-accent",
  muted: "bg-muted-foreground/30",
};

interface StatTileProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  tone?: Tone;
  className?: string;
}

export function StatTile({
  title,
  value,
  description,
  icon,
  tone = "primary",
  className,
}: StatTileProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-border/60 bg-card/70 backdrop-blur-md smooth-transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-warm-lg",
        className
      )}
    >
      <div className={cn("absolute inset-x-0 top-0 h-1", toneBar[tone])} />
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl opacity-0 smooth-transition group-hover:opacity-100"
        aria-hidden="true"
      />
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {icon && (
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl smooth-transition group-hover:scale-110",
                toneRing[tone]
              )}
            >
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
