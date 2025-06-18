
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChatBox } from "@/components/ChatBox";
import { User, Phone, MapPin, MessageSquare, Clock } from "lucide-react";
import { Order } from "@/types/order";
import { getStatusClassNames } from "@/lib/status-colors";

interface OrderCardProps {
  order: Order;
  isMyOrder: boolean;
  onAccept?: (orderId: string) => void;
  onComplete?: (orderId: string) => void;
  updatingOrderId: string | null;
}

const formatAddress = (address: any) => {
  if (!address) return 'Not provided';
  const { line1, city, state, postal_code } = address;
  return [line1, city, state, postal_code].filter(Boolean).join(', ');
};

export function OrderCard({ order, isMyOrder, onAccept, onComplete, updatingOrderId }: OrderCardProps) {
  const isUpdating = updatingOrderId === order.id;

  return (
    <Card key={order.id} className="animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{order.menu.title}</CardTitle>
            <div className="text-sm text-gray-500 mt-1">
              Order #{order.id.substring(0, 8)}
            </div>
            <div className="text-sm text-gray-500">
              {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
            </div>
          </div>
          {isMyOrder && (
            <Badge className={`capitalize ${getStatusClassNames(order.status).badge}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center text-sm mb-4">
          <div className="font-semibold">{order.menu.title}</div>
          <div>Qty: {order.quantity}</div>
        </div>
        
        <div className="text-sm text-green-600 font-semibold mb-2">
          Delivery Fee: ₹{order.delivery_fee || 40}
        </div>
        
        <div className="text-xs text-gray-500 mb-4">
          Deliver to: {order.shipping_details?.name || 'Customer'}
        </div>
        
        <div className="border-t pt-4 mt-4 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-semibold">Customer: {order.customer?.full_name}</span>
              {order.customer?.phone && (
                <a href={`tel:${order.customer.phone}`} className="ml-auto flex items-center gap-1 text-blue-600 hover:underline">
                  <Phone className="h-3 w-3" />
                  <span>Call</span>
                </a>
              )}
            </div>
            <div className="flex items-start gap-2 pl-6">
              <MapPin className="h-4 w-4 text-gray-500 mt-1" />
              <span className="text-xs">{formatAddress(order.shipping_details?.address)}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-semibold">Chef: {order.mom?.full_name}</span>
              {order.mom?.phone && (
                <a href={`tel:${order.mom.phone}`} className="ml-auto flex items-center gap-1 text-blue-600 hover:underline">
                  <Phone className="h-3 w-3" />
                  <span>Call</span>
                </a>
              )}
            </div>
            <div className="flex items-start gap-2 pl-6">
              <MapPin className="h-4 w-4 text-gray-500 mt-1" />
              <span className="text-xs">{formatAddress(order.mom?.address)}</span>
            </div>
          </div>

          {!isMyOrder && order.status === 'ready' && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">Ready for pickup!</span>
            </div>
          )}
        </div>
        
        {isMyOrder ? (
          <>
            <Collapsible className="mt-4">
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat about this order</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <ChatBox orderId={order.id} />
              </CollapsibleContent>
            </Collapsible>
            
            {order.status === 'picked_up' && onComplete && (
              <Button 
                className="w-full mt-4" 
                onClick={() => onComplete(order.id)} 
                disabled={isUpdating}
              >
                {isUpdating ? 'Delivering...' : 'Mark as Delivered'}
              </Button>
            )}
          </>
        ) : (
          onAccept && order.status === 'ready' && (
            <Button 
              className="w-full mt-4" 
              onClick={() => onAccept(order.id)} 
              disabled={isUpdating}
            >
              {isUpdating ? 'Accepting...' : 'Accept Delivery'}
            </Button>
          )
        )}
      </CardContent>
    </Card>
  );
}
