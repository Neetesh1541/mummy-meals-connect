
import { Link } from "react-router-dom";
import { Heart, Github, User, Mail, Star } from "lucide-react";

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
    <footer className="bg-muted/50 mt-20">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-warm-orange-400 to-warm-orange-600 rounded-full flex items-center justify-center">
                <Heart className="h-5 w-5 text-white animate-pulse" />
              </div>
              <span className="font-poppins font-bold text-lg">Mummy Meals</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Bringing the love and taste of real home-cooked food to people living away from home.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-sm hover:text-primary smooth-transition">Home</Link>
              <Link to="/about" className="text-sm hover:text-primary smooth-transition">About Us</Link>
              <Link to="/contact" className="text-sm hover:text-primary smooth-transition">Contact</Link>
              <Link to="/auth" className="text-sm hover:text-primary smooth-transition">Get Started</Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact Us</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>mummymeals.help@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📞</span>
                <span>+91-8218828273</span>
              </div>
            </div>
          </div>

          {/* Founder Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Made with ❤️ by</h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium">Neetesh Kumar</p>
              <p className="text-muted-foreground italic">"I started Mummy Meals to bridge the distance between home and heart, one meal at a time. Hope you enjoy it!"</p>
              <p className="text-muted-foreground">3rd-year CSE, AKTU</p>
              <div className="flex space-x-3">
                <a 
                  href="https://github.com/neetesh1541" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary smooth-transition"
                >
                  <Github className="h-4 w-4" />
                </a>
                <a 
                  href="https://in.linkedin.com/in/neetesh-kumar-846616287" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary smooth-transition"
                >
                  <User className="h-4 w-4" />
                </a>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>GDG Gurgaon, GDG Noida, MLSA</p>
                <p>Core Team - Azure Dev Community</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <h3 className="text-center font-semibold text-lg mb-6">What Our Customers Say</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <div key={index} className="bg-card p-6 rounded-lg shadow-sm animate-fade-in">
                <div className="flex items-center mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-muted-foreground italic mb-4">"{review.text}"</p>
                <p className="font-semibold text-right">- {review.name}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2024 Mummy Meals. All rights reserved. Empowering local moms, feeding hearts.</p>
        </div>
      </div>
    </footer>
  );
}
