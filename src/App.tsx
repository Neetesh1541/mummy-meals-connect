import { lazy, Suspense, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { NotificationPreferencesProvider } from "@/hooks/useNotificationPreferences";
import { NotificationHistoryProvider } from "@/hooks/useNotificationHistory";
import { OfflineBanner } from "@/components/OfflineNotice";
import { ReconnectSync } from "@/components/ReconnectSync";


// Eager load the main landing page for fast initial render
import Index from "./pages/Index";

// Lazy load all other pages for better performance
const Auth = lazy(() => import("./pages/Auth"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard"));
const MomDashboard = lazy(() => import("./pages/MomDashboard"));
const DeliveryDashboard = lazy(() => import("./pages/DeliveryDashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const NotificationCenter = lazy(() => import("./pages/NotificationCenter"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCancel = lazy(() => import("./pages/PaymentCancel"));

// Notification banner (loaded lazily)
const NotificationBanner = lazy(() => import("./components/NotificationBanner").then(m => ({ default: m.NotificationBanner })));
const PwaUpdateBanner = lazy(() => import("./components/PwaUpdateBanner").then(m => ({ default: m.PwaUpdateBanner })));

import { LoadingScreen } from "./components/LoadingScreen";

// Branded loading fallback
const PageLoader = () => <LoadingScreen label="Plating up your page…" />;



// Optimized QueryClient with caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function BootSplash({ children }: { children: React.ReactNode }) {
  const [booting, setBooting] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 1200);
    return () => clearTimeout(t);
  }, []);
  return (
    <>
      {booting && <LoadingScreen />}
      <div className={booting ? "invisible" : "animate-fade-in"}>{children}</div>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <NotificationPreferencesProvider>
        <NotificationHistoryProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BootSplash>
          <BrowserRouter>
            <OfflineBanner />
            <ReconnectSync />
            <Suspense fallback={null}>
              <PwaUpdateBanner />
              <NotificationBanner />
            </Suspense>

            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/customer-dashboard" element={<CustomerDashboard />} />
                <Route path="/mom-dashboard" element={<MomDashboard />} />
                <Route path="/delivery-dashboard" element={<DeliveryDashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/notifications" element={<NotificationCenter />} />
                <Route path="/settings/notifications" element={<NotificationSettings />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-cancel" element={<PaymentCancel />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          </BootSplash>

        </TooltipProvider>
        </NotificationHistoryProvider>
        </NotificationPreferencesProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);


export default App;
