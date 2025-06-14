
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Target, Users, Award } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-20">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-6 animate-fade-in-up">
            <h1 className="font-poppins font-bold text-4xl md:text-5xl">
              About <span className="text-primary">Mummy Meals</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A student-founded startup born from the simple desire to bring the love and taste 
              of real home-cooked food to people living away from home.
            </p>
          </div>

          {/* Story Section */}
          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-6 w-6 text-primary" />
                    <h2 className="font-poppins font-semibold text-2xl">Our Story</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Founded by a passionate computer science student, Mummy Meals addresses the 
                    real struggle of finding authentic, home-cooked meals while living away from family. 
                    We bridge the gap between homesick hearts and the loving hands of local mothers 
                    who understand the importance of a wholesome, home-style meal.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-warm-orange-100 to-pastel-green-100 rounded-lg p-6 text-center">
                  <div className="text-4xl mb-4">🏆</div>
                  <p className="font-medium text-lg">5th Position</p>
                  <p className="text-sm text-muted-foreground">Startup Hackathon Winner</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm hover:scale-105 smooth-transition">
              <CardContent className="p-8">
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="h-6 w-6 text-primary" />
                  <h3 className="font-poppins font-semibold text-xl">Our Mission</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  To empower local mothers with sustainable income opportunities while providing 
                  students and professionals with healthy, affordable, and authentic home-cooked meals 
                  that remind them of home.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm hover:scale-105 smooth-transition">
              <CardContent className="p-8">
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="h-6 w-6 text-primary" />
                  <h3 className="font-poppins font-semibold text-xl">Our Vision</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  To create a nationwide network of trusted home cooks, making home-style food 
                  accessible to everyone, everywhere, while building stronger, more connected communities.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Founder Section */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-warm-orange-50 to-pastel-green-50">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center space-x-2">
                  <Award className="h-6 w-6 text-primary" />
                  <h2 className="font-poppins font-semibold text-2xl">Meet the Founder</h2>
                </div>
                
                <div className="max-w-2xl mx-auto">
                  <h3 className="font-semibold text-xl mb-2">Neetesh Kumar</h3>
                  <p className="text-muted-foreground mb-4">3rd-year Computer Science Engineering Student, AKTU</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-white rounded-lg p-3">
                      <p className="font-medium">GDG Gurgaon</p>
                      <p className="text-muted-foreground">Community Member</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="font-medium">GDG Noida</p>
                      <p className="text-muted-foreground">Active Participant</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="font-medium">MLSA</p>
                      <p className="text-muted-foreground">Microsoft Learn</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="font-medium">Azure Dev</p>
                      <p className="text-muted-foreground">Core Team</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Values */}
          <div className="text-center space-y-8">
            <h2 className="font-poppins font-bold text-3xl">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Authenticity", description: "Real home-cooked flavors, no shortcuts" },
                { title: "Community", description: "Connecting hearts through food" },
                { title: "Empowerment", description: "Creating opportunities for local mothers" }
              ].map((value, index) => (
                <div key={index} className="space-y-2 animate-fade-in-up" style={{animationDelay: `${index * 0.2}s`}}>
                  <h3 className="font-semibold text-lg">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
