import { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WavyBackground } from "@/components/WavyBackground";

interface DashboardShellProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  maxWidth?: string;
}

export function DashboardShell({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
  maxWidth = "max-w-7xl",
}: DashboardShellProps) {
  return (
    <div className="min-h-dvh bg-background relative">
      <WavyBackground />
      <Header />
      <main id="main-content" className="container py-6 md:py-10 relative z-10">
        <div className={`${maxWidth} mx-auto space-y-6 md:space-y-8`}>
          <section className="glass rounded-3xl px-6 py-8 md:px-10 md:py-12 animate-fade-up overflow-hidden relative shadow-warm">
            <div
              className="absolute inset-0 -z-10 opacity-70"
              style={{
                background:
                  "radial-gradient(ellipse 60% 80% at 100% 0%, hsl(var(--primary) / 0.22), transparent 60%), radial-gradient(ellipse 50% 70% at 0% 100%, hsl(var(--secondary) / 0.16), transparent 60%)",
              }}
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
              aria-hidden="true"
            />

            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                {eyebrow && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                    {eyebrow}
                  </span>
                )}
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gradient-warm">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-muted-foreground max-w-xl">{subtitle}</p>
                )}
              </div>
              {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
            </div>
          </section>

          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
