import { memo } from "react";

export const WavyBackground = memo(function WavyBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Simplified animated gradient background */}
      <div className="absolute inset-0 animated-soft-gradient"></div>
      
      {/* Single simplified wave */}
      <svg
        className="absolute bottom-0 left-0 w-full h-64 opacity-30"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
            <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <path
          fill="url(#wave-gradient)"
          d="M0,224L48,218.7C96,213,192,203,288,186.7C384,171,480,149,576,165.3C672,181,768,235,864,240C960,245,1056,203,1152,181.3C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>

      <svg
        className="absolute bottom-0 left-0 w-full h-48 opacity-20"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          fill="hsl(var(--accent))"
          d="M0,128L48,144C96,160,192,192,288,197.3C384,203,480,181,576,176C672,171,768,181,864,197.3C960,213,1056,235,1152,218.7C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>

      {/* Minimal floating particles - reduced from 200+ to 6 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-8 h-8 rounded-full bg-primary/10 animate-float" />
        <div className="absolute top-1/3 right-1/4 w-6 h-6 rounded-full bg-accent/15 animate-float" style={{animationDelay: '2s'}} />
        <div className="absolute bottom-1/3 left-1/3 w-10 h-10 rounded-full bg-primary/10 animate-float" style={{animationDelay: '4s'}} />
        <div className="absolute top-1/2 right-1/3 w-5 h-5 rounded-full bg-accent/10 animate-float" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-1/4 right-1/4 w-7 h-7 rounded-full bg-primary/15 animate-float" style={{animationDelay: '3s'}} />
        <div className="absolute top-2/3 left-1/5 w-4 h-4 rounded-full bg-accent/10 animate-float" style={{animationDelay: '5s'}} />
      </div>
    </div>
  );
});
