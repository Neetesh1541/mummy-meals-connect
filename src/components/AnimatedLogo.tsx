
import { Heart, Home } from "lucide-react";
import { useEffect, useState } from "react";

export function AnimatedLogo() {
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBounce(true);
      setTimeout(() => setBounce(false), 600);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-2 smooth-transition hover:scale-105">
      <div className={`relative w-10 h-10 bg-gradient-to-r from-warm-orange-400 to-warm-orange-600 rounded-full flex items-center justify-center ${bounce ? 'animate-bounce' : ''}`}>
        <Home className="h-6 w-6 text-white animate-pulse" />
        <Heart className="absolute -top-1 -right-1 h-4 w-4 text-red-500 animate-pulse" />
      </div>
      <span className="font-poppins font-bold text-xl bg-gradient-to-r from-warm-orange-500 to-pastel-green-500 bg-clip-text text-transparent">
        Mummy Meals
      </span>
    </div>
  );
}
