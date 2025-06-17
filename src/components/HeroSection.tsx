
import { Button } from "@/components/ui/button";
import { ArrowDown, Sparkles, Heart, Utensils } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Enhanced floating elements with better positioning and animations */}
      <div className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-warm-orange-200 to-warm-orange-400 rounded-full opacity-60 animate-float-complex shadow-lg"></div>
      <div className="absolute top-32 right-16 w-20 h-20 bg-gradient-to-br from-pastel-green-200 to-pastel-green-400 rounded-2xl opacity-50 animate-float shadow-lg" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-40 left-20 w-16 h-16 bg-gradient-to-br from-cream-200 to-yellow-300 rounded-full opacity-50 animate-float-complex shadow-lg" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-32 right-12 w-28 h-28 bg-gradient-to-br from-purple-200 to-pink-300 rounded-3xl opacity-40 animate-float shadow-lg" style={{animationDelay: '3s', animationDuration: '12s', transform: 'rotate(45deg)'}}></div>
      
      {/* Decorative icons floating around */}
      <div className="absolute top-1/4 left-1/4 text-warm-orange-300 opacity-30 animate-float" style={{animationDelay: '1.5s'}}>
        <Utensils size={32} />
      </div>
      <div className="absolute top-1/3 right-1/4 text-pastel-green-400 opacity-30 animate-float-complex" style={{animationDelay: '2.5s'}}>
        <Heart size={28} />
      </div>
      <div className="absolute bottom-1/3 left-1/3 text-cream-400 opacity-30 animate-float" style={{animationDelay: '3.5s'}}>
        <Sparkles size={24} />
      </div>

      <div className="container relative z-10 text-center space-y-10 animate-fade-in-up px-4">
        <div className="space-y-6">
          <h1 className="font-poppins font-bold text-4xl md:text-6xl lg:text-7xl xl:text-8xl leading-tight">
            <span className="bg-gradient-to-r from-warm-orange-500 via-pastel-green-500 to-warm-orange-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-pan drop-shadow-sm">
              Ghar ka khana,
            </span>
            <br />
            <span className="text-foreground drop-shadow-sm">Maa ke haathon se</span>
            <span className="inline-block animate-wave ml-2 text-5xl md:text-6xl">👋</span>
          </h1>
          <div className="relative">
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-2xl p-6 border border-white/20 shadow-lg">
              Daily meals from nearby moms, cooked fresh & delivered hot. 
              <br className="hidden md:block" />
              <span className="font-medium text-foreground">Experience the warmth of home-cooked food, wherever you are.</span>
            </p>
            <div className="absolute -top-2 -right-2 text-yellow-400 animate-twinkle">
              <Sparkles size={20} />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 justify-center items-center">
          <Link to="/auth" className="group">
            <Button size="lg" className="bg-gradient-to-r from-warm-orange-500 to-warm-orange-600 hover:from-warm-orange-600 hover:to-warm-orange-700 text-white px-10 py-4 text-lg rounded-2xl smooth-transition hover:scale-105 shadow-xl shadow-warm-orange-500/30 hover:shadow-warm-orange-500/50 border-2 border-warm-orange-400/50 group-hover:border-warm-orange-300">
              <Utensils className="h-5 w-5 mr-2 group-hover:animate-bounce" />
              Order Now
            </Button>
          </Link>
          <Link to="/auth" className="group">
            <Button variant="outline" size="lg" className="px-10 py-4 text-lg rounded-2xl smooth-transition hover:scale-105 border-2 hover:bg-gradient-to-r hover:from-pastel-green-50 hover:to-warm-orange-50 dark:hover:from-pastel-green-900/20 dark:hover:to-warm-orange-900/20 shadow-lg hover:shadow-xl backdrop-blur-sm bg-white/20 dark:bg-black/20">
              <Heart className="h-5 w-5 mr-2 group-hover:animate-pulse text-red-400" />
              Join as Mom
            </Button>
          </Link>
          <Link to="/auth" className="group">
            <Button variant="outline" size="lg" className="px-10 py-4 text-lg rounded-2xl smooth-transition hover:scale-105 border-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 shadow-lg hover:shadow-xl backdrop-blur-sm bg-white/20 dark:bg-black/20">
              <svg className="h-5 w-5 mr-2 group-hover:animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Become Delivery Partner
            </Button>
          </Link>
        </div>

        <div className="pt-8">
          <div className="animate-bounce bg-gradient-to-r from-warm-orange-400 to-pastel-green-400 p-3 rounded-full w-fit mx-auto shadow-lg">
            <ArrowDown className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </section>
  );
}
