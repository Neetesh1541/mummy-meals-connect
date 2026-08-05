import { BrandLogo } from "./BrandLogo";

export function AnimatedLogo() {
  return (
    <div className="flex items-center gap-2.5 smooth-transition hover:scale-[1.03]">
      <BrandLogo size={38} spin />
      <span className="flex flex-col leading-none">
        <span className="font-poppins text-xl font-extrabold tracking-tight text-gradient-warm">
          Mummy Meals
        </span>
        <span className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:block">
          Ghar ka khana
        </span>
      </span>
    </div>
  );
}
