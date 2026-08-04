import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function DashboardTabsList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <TabsList
      className={cn(
        "h-auto w-full flex-wrap gap-1 rounded-2xl border border-border/60 bg-card/70 p-1.5 backdrop-blur-sm",
        className
      )}
    >
      {children}
    </TabsList>
  );
}

export function DashboardTabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "flex-1 gap-2 rounded-xl px-4 py-2.5 text-sm font-medium smooth-transition data-[state=active]:bg-gradient-warm data-[state=active]:text-primary-foreground data-[state=active]:shadow-warm",
        className
      )}
    >
      {children}
    </TabsTrigger>
  );
}
