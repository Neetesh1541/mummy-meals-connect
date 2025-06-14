
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color?: string;
}

export function FeatureCard({ icon: Icon, title, description, color = "warm-orange" }: FeatureCardProps) {
  return (
    <Card className="group hover:shadow-lg smooth-transition border-0 bg-card/50 backdrop-blur-sm hover:scale-105">
      <CardContent className="p-6 text-center space-y-4">
        <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-${color}-400 to-${color}-600 flex items-center justify-center group-hover:animate-float`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
        <h3 className="font-poppins font-semibold text-lg">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
