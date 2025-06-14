
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface DeliveredOrder {
  id: string;
  menu: {
    title: string;
  };
  mom: {
    full_name: string;
  };
  created_at: string;
}

export function FeedbackForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deliveredOrders, setDeliveredOrders] = useState<DeliveredOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDeliveredOrders();
    }
  }, [user]);

  const fetchDeliveredOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          menu!orders_menu_id_fkey(title),
          mom:users!orders_mom_id_fkey(full_name)
        `)
        .eq('customer_id', user?.id)
        .eq('status', 'delivered');
      
      if (error) throw error;
      setDeliveredOrders(data || []);
    } catch (error) {
      console.error('Error fetching delivered orders:', error);
    }
  };

  const submitFeedback = async () => {
    if (!selectedOrder || rating === 0) {
      toast({
        title: "Error",
        description: "Please select an order and provide a rating",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          order_id: selectedOrder,
          customer_id: user?.id,
          rating: rating,
          comment: comment || null
        });
      
      if (error) throw error;
      
      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted",
      });
      
      setSelectedOrder(null);
      setRating(0);
      setComment("");
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Leave Feedback</CardTitle>
        <CardDescription>
          Share your experience with delivered orders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {deliveredOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No delivered orders to review yet
          </p>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Select Order</label>
              <select
                value={selectedOrder || ""}
                onChange={(e) => setSelectedOrder(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Choose an order...</option>
                {deliveredOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.menu.title} from {order.mom.full_name} - {new Date(order.created_at).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 cursor-pointer ${
                      star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Comment (Optional)</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about the meal and service..."
                rows={3}
              />
            </div>

            <Button
              onClick={submitFeedback}
              disabled={submitting || !selectedOrder || rating === 0}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {submitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
