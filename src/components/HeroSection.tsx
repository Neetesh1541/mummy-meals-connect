
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center wavy-bg wave-pattern overflow-hidden">
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-warm-orange-200 rounded-full opacity-50 animate-float-complex"></div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-pastel-green-200 rounded-full opacity-50 animate-float" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-40 left-20 w-12 h-12 bg-cream-200 rounded-full opacity-50 animate-float-complex" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-cream-200/50 rounded-lg opacity-30 animate-float" style={{animationDelay: '3s', animationDuration: '12s', transform: 'rotate(45deg)'}}></div>

      <div className="container relative z-10 text-center space-y-8 animate-fade-in-up">
        <div className="space-y-4">
          <h1 className="font-poppins font-bold text-4xl md:text-6xl lg:text-7xl leading-tight">
            <span className="bg-gradient-to-r from-warm-orange-500 via-pastel-green-500 to-warm-orange-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-pan">
              Ghar ka khana,
            </span>
            <br />
            <span className="text-foreground">Maa ke haathon se</span>
            <span className="inline-block animate-wave ml-2">👋</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Daily meals from nearby moms, cooked fresh & delivered hot. 
            Experience the warmth of home-cooked food, wherever you are.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-to-r from-warm-orange-500 to-warm-orange-600 hover:from-warm-orange-600 hover:to-warm-orange-700 text-white px-8 py-3 rounded-full smooth-transition hover:scale-105 shadow-lg shadow-warm-orange-500/20 hover:shadow-warm-orange-500/40">
              Order Now
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="outline" size="lg" className="px-8 py-3 rounded-full smooth-transition hover:scale-105 border-2 hover:bg-accent">
              Join as Mom
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="outline" size="lg" className="px-8 py-3 rounded-full smooth-transition hover:scale-105 border-2 hover:bg-accent">
              Become Delivery Partner
            </Button>
          </Link>
        </div>

        <div className="pt-12">
          <ArrowDown className="h-6 w-6 mx-auto text-muted-foreground animate-bounce" />
        </div>
      </div>
    </section>
  );
}
