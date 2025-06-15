
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Repeat, Play, Pause, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Subscription {
  id: string;
  status: string;
  frequency: string;
  delivery_day: string | null;
  delivery_time: string | null;
  start_date: string;
  menu: {
    title: string;
  };
}

export function MySubscriptions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
      const channel = supabase
        .channel(`my-subscriptions-${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'subscriptions', filter: `customer_id=eq.${user.id}` },
          () => fetchSubscriptions()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`id, status, frequency, delivery_day, delivery_time, start_date, menu:menu_id(title)`)
        .eq('customer_id', user.id);
      
      if (error) throw error;
      setSubscriptions(data as Subscription[] || []);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch subscriptions.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const updateSubscriptionStatus = async (id: string, status: 'active' | 'paused' | 'cancelled') => {
    try {
        const { error } = await supabase
            .from('subscriptions')
            .update({ status })
            .eq('id', id);

        if (error) throw error;

        toast({
            title: "Subscription Updated",
            description: `Your subscription has been ${status}.`
        });
    } catch (error: any) {
        console.error("Error updating subscription:", error);
        toast({
            title: "Error",
            description: "Failed to update subscription.",
            variant: "destructive"
        });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading your subscriptions...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Subscriptions</h2>
      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Repeat className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No active subscriptions</h3>
            <p className="text-gray-600">Subscribe to a meal to see it here!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map(sub => (
            <Card key={sub.id}>
              <CardHeader>
                <CardTitle>{sub.menu.title}</CardTitle>
                <CardDescription>
                  Status: <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>{sub.status}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Frequency:</strong> {sub.frequency}</p>
                {sub.delivery_day && <p><strong>Day:</strong> {sub.delivery_day}</p>}
                <p><strong>Time:</strong> {sub.delivery_time}</p>
                <p><strong>Started on:</strong> {format(new Date(sub.start_date), "PPP")}</p>
                <div className="flex gap-2 pt-4">
                    {sub.status === 'active' &&
                        <Button variant="outline" size="sm" onClick={() => updateSubscriptionStatus(sub.id, 'paused')}>
                            <Pause className="h-4 w-4 mr-2" /> Pause
                        </Button>
                    }
                    {sub.status === 'paused' &&
                        <Button variant="outline" size="sm" onClick={() => updateSubscriptionStatus(sub.id, 'active')}>
                            <Play className="h-4 w-4 mr-2" /> Resume
                        </Button>
                    }
                     {sub.status !== 'cancelled' &&
                        <Button variant="destructive" size="sm" onClick={() => updateSubscriptionstatus(sub.id, 'cancelled')}>
                            <XCircle className="h-4 w-4 mr-2" /> Cancel
                        </Button>
                     }
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
