import logo from "@/assets/mummy-meals-logo.png";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
  spin?: boolean;
}

export function BrandLogo({ className, size = 40, glow = true, spin = false }: BrandLogoProps) {
  return (
    <span
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {glow && (
        <span
          className="absolute inset-0 rounded-full bg-primary/25 blur-xl animate-pulse-soft"
          aria-hidden="true"
        />
      )}
      <img
        src={logo}
        alt="Mummy Meals logo"
        width={size}
        height={size}
        className={cn(
          "relative h-full w-full object-contain drop-shadow-sm",
          spin && "animate-float-gentle"
        )}
      />
    </span>
  );
}
