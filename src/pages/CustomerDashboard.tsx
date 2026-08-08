import { MenuBrowser } from "@/components/MenuBrowser";
import { CartSidebar } from "@/components/CartSidebar";
import { OrderTracking } from "@/components/OrderTracking";
import { FeedbackForm } from "@/components/FeedbackForm";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Clock, MessageSquare, Home, Repeat } from "lucide-react";
import { MySubscriptions } from "@/components/MySubscriptions";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CartProvider } from "@/hooks/useCart";
import { useSearchParams } from "react-router-dom";
import {
  DashboardTabsList,
  DashboardTabsTrigger,
} from "@/components/dashboard/DashboardTabs";

const VALID_TABS = ["browse", "orders", "subscriptions", "feedback"];

export default function CustomerDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : "browse";

  const handleTabChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", value);
    if (value !== "orders") next.delete("order");
    setSearchParams(next, { replace: true });
  };

  return (
    <DashboardShell
      eyebrow="Customer"
      title="Welcome to your food paradise"
      subtitle="Discover delicious home-cooked meals from local moms, track your orders live, and manage your subscriptions."
    >
      <CartProvider>
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-1">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">

            <DashboardTabsList className="mb-6">
              <DashboardTabsTrigger value="browse">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Browse Meals</span>
                <span className="sm:hidden">Browse</span>
              </DashboardTabsTrigger>
              <DashboardTabsTrigger value="orders">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Track Orders</span>
                <span className="sm:hidden">Orders</span>
              </DashboardTabsTrigger>
              <DashboardTabsTrigger value="subscriptions">
                <Repeat className="h-4 w-4" />
                <span className="hidden sm:inline">Subscriptions</span>
                <span className="sm:hidden">Subs</span>
              </DashboardTabsTrigger>
              <DashboardTabsTrigger value="feedback">
                <MessageSquare className="h-4 w-4" />
                Feedback
              </DashboardTabsTrigger>
            </DashboardTabsList>

            <TabsContent value="browse" className="animate-fade-in">
              <MenuBrowser />
            </TabsContent>

            <TabsContent value="orders" className="animate-fade-in">
              <OrderTracking />
            </TabsContent>

            <TabsContent value="subscriptions" className="animate-fade-in">
              <MySubscriptions />
            </TabsContent>

            <TabsContent value="feedback" className="animate-fade-in">
              <FeedbackForm />
            </TabsContent>
          </Tabs>
        </div>

        <CartSidebar />
      </div>
      </CartProvider>
    </DashboardShell>
  );
}
