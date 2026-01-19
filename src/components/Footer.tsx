
import { Link } from "react-router-dom";
import { Heart, Github, User, Mail, Star, Globe, ExternalLink, Sparkles } from "lucide-react";

export function Footer() {
  const reviews = [
    {
      name: "Anjali S.",
      text: "The food feels just like home. As a student living far away, Mummy Meals is a lifesaver!",
      rating: 5,
    },
    {
      name: "Rohan K.",
      text: "Amazing variety and always delivered on time. The quality is consistently great.",
      rating: 5,
    },
    {
      name: "Priya M.",
      text: "I love supporting local moms and the food is delicious. A win-win!",
      rating: 4,
    },
  ];

  return (
    <footer className="relative mt-20 overflow-hidden">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-warm" />
      
      <div className="bg-gradient-to-b from-muted/30 to-muted/60 backdrop-blur-sm">
        <div className="container py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="space-y-5">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-warm rounded-2xl flex items-center justify-center shadow-warm animate-pulse-soft">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="font-poppins font-bold text-xl text-gradient-warm">Mummy Meals</span>
                  <p className="text-xs text-muted-foreground">Home-cooked with love</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Bringing the love and taste of real home-cooked food to people living away from home. Every meal is made with care.
              </p>
              
              {/* Stats */}
              <div className="flex gap-4 pt-2">
                <div className="text-center">
                  <p className="font-bold text-xl text-primary">500+</p>
                  <p className="text-xs text-muted-foreground">Happy Customers</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-xl text-secondary">50+</p>
                  <p className="text-xs text-muted-foreground">Home Chefs</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-5">
              <h3 className="font-poppins font-semibold text-lg flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Quick Links
              </h3>
              <nav className="flex flex-col space-y-3">
                {[
                  { to: "/", label: "Home" },
                  { to: "/about", label: "About Us" },
                  { to: "/contact", label: "Contact" },
                  { to: "/auth", label: "Get Started" },
                ].map((link) => (
                  <Link 
                    key={link.to}
                    to={link.to} 
                    className="text-sm text-muted-foreground hover:text-primary smooth-transition flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary group-hover:scale-150 smooth-transition" />
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Contact Info */}
            <div className="space-y-5">
              <h3 className="font-poppins font-semibold text-lg flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Contact Us
              </h3>
              <div className="space-y-3">
                <a 
                  href="mailto:mummymeals.help@gmail.com"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary smooth-transition group"
                >
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 smooth-transition">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span>mummymeals.help@gmail.com</span>
                </a>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <span>📞</span>
                  </div>
                  <span>+91-8218828273</span>
                </div>
              </div>
            </div>

            {/* Founder Info */}
            <div className="space-y-5">
              <h3 className="font-poppins font-semibold text-lg flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                Made with ❤️ by
              </h3>
              <div className="space-y-4">
                <div className="glass-card !p-4">
                  <p className="font-semibold text-lg">Neetesh Kumar</p>
                  <p className="text-xs text-muted-foreground mt-1">3rd-year CSE, AKTU</p>
                  <p className="text-sm text-muted-foreground italic mt-3 leading-relaxed">
                    "I started Mummy Meals to bridge the distance between home and heart, one meal at a time."
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <a 
                    href="https://www.neetesh.tech" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="developer-badge"
                  >
                    <Globe className="h-4 w-4 text-primary" />
                    <span>neetesh.tech</span>
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </a>
                </div>
                
                <div className="flex gap-3">
                  <a 
                    href="https://github.com/neetesh1541" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-card hover:bg-primary/10 smooth-transition hover-lift border border-border"
                    aria-label="GitHub"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                  <a 
                    href="https://in.linkedin.com/in/neetesh-kumar-846616287" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-card hover:bg-primary/10 smooth-transition hover-lift border border-border"
                    aria-label="LinkedIn"
                  >
                    <User className="h-5 w-5" />
                  </a>
                </div>
                
                <div className="flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
                  <span className="px-2 py-1 rounded-full bg-muted/50">GDG Gurgaon</span>
                  <span className="px-2 py-1 rounded-full bg-muted/50">GDG Noida</span>
                  <span className="px-2 py-1 rounded-full bg-muted/50">MLSA</span>
                  <span className="px-2 py-1 rounded-full bg-muted/50">Azure Dev Community</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-16 pt-10 border-t border-border/50">
            <div className="text-center mb-8">
              <h3 className="font-poppins font-semibold text-2xl mb-2">
                What Our <span className="text-gradient-warm">Customers</span> Say
              </h3>
              <p className="text-sm text-muted-foreground">Real reviews from real food lovers</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
              {reviews.map((review, index) => (
                <div 
                  key={index} 
                  className="glass-card opacity-0 animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                >
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-muted'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic leading-relaxed">"{review.text}"</p>
                  <p className="font-semibold text-right mt-4 text-sm">— {review.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © 2024 Mummy Meals. All rights reserved. Empowering local moms, feeding hearts.
            </p>
            <a 
              href="https://www.neetesh.tech" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary smooth-transition flex items-center gap-2"
            >
              Developed by <span className="font-semibold text-primary">Neetesh Kumar</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
