
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WavyBackground } from "@/components/WavyBackground";
import { HeroSection } from "@/components/HeroSection";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && userRole) {
      // Redirect authenticated users to their role-specific dashboard
      switch (userRole) {
        case 'customer':
          navigate('/customer-dashboard');
          break;
        case 'mom':
          navigate('/mom-dashboard');
          break;
        case 'delivery':
          navigate('/delivery-dashboard');
          break;
        default:
          // Stay on home page if role is not recognized
          break;
      }
    }
  }, [user, userRole, loading, navigate]);

  return (
    <div className="min-h-screen bg-background relative">
      <WavyBackground />
      <Header />
      <main className="relative z-10">
        <HeroSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
