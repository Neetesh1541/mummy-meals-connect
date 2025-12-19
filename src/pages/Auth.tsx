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
import { User, Heart, Package, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  
  const { user, signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !showResetPassword) {
      navigate("/");
    }
  }, [user, navigate, showResetPassword]);

  // Handle URL parameters for email confirmation and password reset
  useEffect(() => {
    const type = searchParams.get('type');
    const errorDescription = searchParams.get('error_description');
    
    if (errorDescription) {
      toast({
        title: "Link Expired",
        description: "This link has expired or is invalid. Please request a new one.",
        variant: "destructive"
      });
      return;
    }
    
    if (type === 'recovery') {
      setShowResetPassword(true);
      setAuthMode('login');
    } else if (type === 'signup' || type === 'email_confirmation') {
      setEmailConfirmed(true);
      toast({
        title: "Email Verified!",
        description: "Your email has been verified. You can now sign in.",
      });
    }
  }, [searchParams, toast]);

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

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      toast({
        title: "Password Updated!",
        description: "Your password has been successfully reset. You can now sign in.",
      });
      setShowResetPassword(false);
      setNewPassword("");
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show password reset form
  if (showResetPassword) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-20">
          <div className="max-w-md mx-auto">
            <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="font-poppins text-2xl">Reset Your Password</CardTitle>
                <CardDescription>
                  Enter your new password below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                      minLength={6}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-warm-orange-500 to-warm-orange-600 hover:from-warm-orange-600 hover:to-warm-orange-700"
                  >
                    {isSubmitting ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
              {emailConfirmed && authMode === "login" && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-pastel-green-100 dark:bg-pastel-green-900/30 text-pastel-green-700 dark:text-pastel-green-300">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Email verified! You can now sign in.</span>
                </div>
              )}
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
