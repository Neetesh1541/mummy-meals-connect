import { memo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown, ChefHat, Utensils, Heart, Sparkles, Star, Truck } from "lucide-react";
import { Link } from "react-router-dom";

export const HeroSection = memo(function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-8 pb-20">
      {/* Animated decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating icons */}
        <div className="absolute top-20 left-[10%] animate-float" style={{ animationDelay: '0s' }}>
          <div className="p-4 rounded-2xl glass shadow-warm">
            <ChefHat className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="absolute top-32 right-[15%] animate-float" style={{ animationDelay: '2s' }}>
          <div className="p-4 rounded-2xl glass shadow-fresh">
            <Utensils className="h-8 w-8 text-secondary" />
          </div>
        </div>
        <div className="absolute bottom-32 left-[15%] animate-float" style={{ animationDelay: '4s' }}>
          <div className="p-4 rounded-2xl glass shadow-warm">
            <Star className="h-6 w-6 text-accent" />
          </div>
        </div>
        <div className="absolute bottom-40 right-[10%] animate-float" style={{ animationDelay: '1s' }}>
          <div className="p-4 rounded-2xl glass">
            <Truck className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      <div className="container relative z-10 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 animate-fade-up">
            <Sparkles className="h-4 w-4 text-primary animate-pulse-soft" />
            <span className="text-sm font-medium">Authentic Home-Cooked Meals</span>
            <Heart className="h-4 w-4 text-primary" />
          </div>

          {/* Main heading */}
          <h1 
            className="font-poppins text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight animate-fade-up"
            style={{ animationDelay: '0.1s' }}
          >
            <span className="text-gradient-warm">Mummy Meals</span>
            <br />
            <span className="text-foreground/90">Taste of Home,</span>
            <br />
            <span className="text-foreground/90">Delivered with</span>
            <span className="inline-flex items-center ml-3">
              <Heart className="h-10 w-10 sm:h-14 sm:w-14 text-red-500 fill-red-500 animate-pulse" />
            </span>
          </h1>

          {/* Description */}
          <p 
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-up"
            style={{ animationDelay: '0.2s' }}
          >
            Connect with loving home cooks in your neighborhood. Enjoy authentic, 
            <span className="text-primary font-semibold"> nutritious meals</span> made with 
            traditional recipes and <span className="text-secondary font-semibold">fresh ingredients</span>.
          </p>

          {/* Stats row */}
          <div 
            className="flex justify-center gap-8 sm:gap-12 py-6 animate-fade-up"
            style={{ animationDelay: '0.3s' }}
          >
            {[
              { value: '500+', label: 'Happy Customers' },
              { value: '50+', label: 'Home Chefs' },
              { value: '4.9★', label: 'Average Rating' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-gradient-warm">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
            style={{ animationDelay: '0.4s' }}
          >
            <Link to="/auth?role=customer">
              <Button 
                size="lg" 
                className="btn-premium bg-gradient-warm text-white border-0 text-lg px-8 py-6 rounded-2xl shadow-warm-lg hover:shadow-warm"
              >
                <Utensils className="mr-2 h-5 w-5" />
                Order Now
              </Button>
            </Link>
            <Link to="/auth?role=mom">
              <Button 
                size="lg" 
                variant="outline" 
                className="btn-premium text-lg px-8 py-6 rounded-2xl border-2 border-secondary text-secondary hover:bg-secondary hover:text-white"
              >
                <ChefHat className="mr-2 h-5 w-5" />
                Join as Mom
              </Button>
            </Link>
            <Link to="/auth?role=delivery">
              <Button 
                size="lg" 
                variant="ghost" 
                className="text-lg px-8 py-6 rounded-2xl hover:bg-primary/10"
              >
                <Truck className="mr-2 h-5 w-5" />
                Become Delivery Partner
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div 
            className="flex flex-wrap justify-center gap-3 pt-6 animate-fade-up"
            style={{ animationDelay: '0.5s' }}
          >
            {['🥗 Fresh Ingredients', '👩‍🍳 Home Chefs', '🚚 Fast Delivery', '💯 Quality Guaranteed'].map((badge, i) => (
              <span 
                key={i}
                className="px-4 py-2 rounded-full bg-card/50 border border-border text-sm font-medium"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="p-3 rounded-full glass">
            <ArrowDown className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>
    </section>
  );
});
