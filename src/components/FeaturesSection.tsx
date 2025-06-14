
import { FeatureCard } from "./FeatureCard";
import { Heart, User, Clock, Star } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Heart,
      title: "Home-cooked & Hygienic",
      description: "Every meal is prepared with love and care by local moms, ensuring the highest standards of hygiene and taste.",
      color: "warm-orange"
    },
    {
      icon: User,
      title: "Affordable for Students & Professionals",
      description: "Budget-friendly pricing designed specifically for students and working professionals living away from home.",
      color: "pastel-green"
    },
    {
      icon: Clock,
      title: "Real-time Delivery Updates",
      description: "Track your order from preparation to delivery with live updates and notifications at every step.",
      color: "cream"
    },
    {
      icon: Star,
      title: "Local Trusted Moms",
      description: "Connect with verified local mothers in your area who understand your taste preferences and dietary needs.",
      color: "warm-orange"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl">
            Why Choose <span className="text-primary">Mummy Meals?</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience the perfect blend of tradition and technology, bringing authentic home-cooked meals to your doorstep.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="animate-fade-in-up" style={{animationDelay: `${index * 0.2}s`}}>
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
