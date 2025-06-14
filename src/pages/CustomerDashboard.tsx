
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WavyBackground } from "@/components/WavyBackground";
import { MenuBrowser } from "@/components/MenuBrowser";
import { CartSidebar } from "@/components/CartSidebar";
import { OrderTracking } from "@/components/OrderTracking";
import { FeedbackForm } from "@/components/FeedbackForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Clock, MessageSquare, Home } from "lucide-react";

export default function CustomerDashboard() {
  const [showCart, setShowCart] = useState(false);

  return (
    <div className="min-h-screen bg-background relative">
      <WavyBackground />
      <Header />
      <main className="container py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-warm-orange-500 to-pastel-green-500 bg-clip-text text-transparent animate-fade-in">
              Welcome to Your Food Paradise!
            </h1>
            <p className="text-muted-foreground mt-2 animate-fade-in">
              Discover delicious home-cooked meals from local moms
            </p>
          </div>

          <div className="flex gap-6">
            <div className="flex-1">
              <Tabs defaultValue="browse" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="browse" className="gap-2">
                    <Home className="h-4 w-4" />
                    Browse Meals
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="gap-2">
                    <Clock className="h-4 w-4" />
                    Track Orders
                  </TabsTrigger>
                  <TabsTrigger value="feedback" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Feedback
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="browse" className="animate-fade-in">
                  <MenuBrowser />
                </TabsContent>

                <TabsContent value="orders" className="animate-fade-in">
                  <OrderTracking />
                </TabsContent>

                <TabsContent value="feedback" className="animate-fade-in">
                  <FeedbackForm />
                </TabsContent>
              </Tabs>
            </div>

            <CartSidebar />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
