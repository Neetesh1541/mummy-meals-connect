import { BrandLogo } from "./BrandLogo";

interface LoadingScreenProps {
  label?: string;
}

export function LoadingScreen({ label = "Warming up the kitchen…" }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-background">
      {/* ambient graphics */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="floating-orb floating-orb-1" />
        <div className="floating-orb floating-orb-2" />
        <div className="floating-orb floating-orb-3" />
      </div>

      <div className="relative flex items-center justify-center">
        {/* pulsing rings */}
        <span className="absolute h-32 w-32 rounded-full border border-primary/25 animate-ping" aria-hidden="true" />
        <span
          className="absolute h-24 w-24 rounded-full border-2 border-dashed border-primary/40"
          style={{ animation: "spin 6s linear infinite" }}
          aria-hidden="true"
        />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl glass animate-float-gentle">
          <BrandLogo size={48} glow={false} />
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-3 text-center">
        <p className="font-poppins text-lg font-bold text-gradient-warm">Mummy Meals</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="mt-1 h-1.5 w-40 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full w-1/2 rounded-full bg-gradient-warm"
            style={{ animation: "loader-sweep 1.3s ease-in-out infinite" }}
          />
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
