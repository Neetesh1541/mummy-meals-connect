import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ForgotPassword } from "@/components/ForgotPassword";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Heart, Package } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type UserRole = "customer" | "mom" | "delivery";
type AuthMode = "login" | "signup";

export default function Auth() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("customer");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Handle password reset mode
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'reset') {
      setAuthMode('login');
      setShowForgotPassword(false);
    }
  }, [searchParams]);

  const roles = [
    {
      id: "customer" as UserRole,
      title: "Customer",
      description: "Order delicious home-cooked meals",
      icon: User,
      color: "bg-warm-orange-500"
    },
    {
      id: "mom" as UserRole,
      title: "Mummy Partner",
      description: "Cook and earn from home",
      icon: Heart,
      color: "bg-pastel-green-500"
    },
    {
      id: "delivery" as UserRole,
      title: "Delivery Partner",
      description: "Deliver meals and earn",
      icon: Package,
      color: "bg-cream-500"
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (authMode === "signup") {
        const userData = {
          full_name: formData.fullName,
          user_type: selectedRole,
          phone: formData.phone
        };
        
        const { error } = await signUp(formData.email, formData.password, userData);
        
        if (!error) {
          // Clear form on successful signup
          setFormData({ fullName: "", email: "", password: "", phone: "" });
        }
      } else {
        await signIn(formData.email, formData.password);
      }
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-20">
          <div className="max-w-md mx-auto">
            <ForgotPassword onBack={() => setShowForgotPassword(false)} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-20">
        <div className="max-w-md mx-auto">
          <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="font-poppins text-2xl">
                {authMode === "login" ? "Welcome Back!" : "Join Mummy Meals"}
              </CardTitle>
              <CardDescription>
                {authMode === "login" 
                  ? "Sign in to your account to continue" 
                  : "Create your account and start your journey"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {authMode === "signup" && (
                <div className="space-y-4">
                  <Label className="text-base font-medium">Choose your role:</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {roles.map((role) => {
                      const Icon = role.icon;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setSelectedRole(role.id)}
                          className={`p-4 rounded-lg border-2 text-left smooth-transition hover:scale-105 ${
                            selectedRole === role.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full ${role.color} flex items-center justify-center`}>
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium">{role.title}</h3>
                              <p className="text-sm text-muted-foreground">{role.description}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {authMode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name" 
                      required 
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email" 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    name="password"
                    type="password" 
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password" 
                    required 
                  />
                </div>

                {authMode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      name="phone"
                      type="tel" 
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number" 
                      required 
                    />
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-warm-orange-500 to-warm-orange-600 hover:from-warm-orange-600 hover:to-warm-orange-700"
                >
                  {isSubmitting ? "Please wait..." : (authMode === "login" ? "Sign In" : "Create Account")}
                </Button>
              </form>

              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">
                  or
                </span>
              </div>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                  className="text-primary hover:underline smooth-transition"
                >
                  {authMode === "login" 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Sign in"
                  }
                </button>

                {authMode === "login" && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-muted-foreground hover:text-primary smooth-transition"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}
              </div>

              {authMode === "signup" && selectedRole && (
                <div className="pt-4 border-t">
                  <Badge variant="secondary" className="w-full justify-center py-2">
                    Creating account as: {roles.find(r => r.id === selectedRole)?.title}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
