import { memo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown, Sparkles, Heart, Utensils } from "lucide-react";
import { Link } from "react-router-dom";

export const HeroSection = memo(function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Simplified floating elements for better performance */}
      <div className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full opacity-60 animate-float"></div>
      <div className="absolute top-32 right-16 w-20 h-20 bg-gradient-to-br from-accent/20 to-accent/40 rounded-2xl opacity-50 animate-float" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-40 left-20 w-16 h-16 bg-gradient-to-br from-secondary to-secondary/80 rounded-full opacity-50 animate-float" style={{animationDelay: '2s'}}></div>
      
      {/* Decorative icons - reduced for performance */}
      <div className="absolute top-1/4 left-1/4 text-primary/30 animate-float" style={{animationDelay: '1.5s'}}>
        <Utensils size={32} />
      </div>
      <div className="absolute top-1/3 right-1/4 text-accent/30 animate-float" style={{animationDelay: '2.5s'}}>
        <Heart size={28} />
      </div>

      <div className="container relative z-10 text-center space-y-10 px-4">
        <div className="space-y-6">
          <h1 className="font-poppins font-bold text-4xl md:text-6xl lg:text-7xl xl:text-8xl leading-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Ghar ka khana,
            </span>
            <br />
            <span className="text-foreground">Maa ke haathon se</span>
            <span className="inline-block ml-2 text-5xl md:text-6xl">👋</span>
          </h1>
          <div className="relative">
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed glass-effect rounded-2xl p-6">
              Daily meals from nearby moms, cooked fresh & delivered hot. 
              <br className="hidden md:block" />
              <span className="font-medium text-foreground">Experience the warmth of home-cooked food, wherever you are.</span>
            </p>
            <div className="absolute -top-2 -right-2 text-yellow-400">
              <Sparkles size={20} />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 justify-center items-center">
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground px-10 py-4 text-lg rounded-2xl smooth-transition shadow-glow">
              <Utensils className="h-5 w-5 mr-2" />
              Order Now
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="outline" size="lg" className="px-10 py-4 text-lg rounded-2xl smooth-transition glass-effect hover:bg-accent/10">
              <Heart className="h-5 w-5 mr-2 text-red-400" />
              Join as Mom
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="outline" size="lg" className="px-10 py-4 text-lg rounded-2xl smooth-transition glass-effect hover:bg-primary/10">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Become Delivery Partner
            </Button>
          </Link>
        </div>

        <div className="pt-8">
          <div className="animate-bounce bg-gradient-to-r from-primary to-accent p-3 rounded-full w-fit mx-auto shadow-lg">
            <ArrowDown className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
      </div>
    </section>
  );
});
