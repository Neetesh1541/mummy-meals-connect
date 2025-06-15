
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChatBox } from "@/components/ChatBox";
import { User, Phone, MapPin, MessageSquare } from "lucide-react";
import { Order } from "@/types/order";

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
  return (
    <Card key={order.id} className="animate-fade-in">
      <CardHeader>
        {isMyOrder ? (
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">Order #{order.id.substring(0, 8)}</CardTitle>
            <Badge variant={order.status === 'picked_up' ? 'secondary' : 'default'}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
            </Badge>
          </div>
        ) : (
          <CardTitle className="text-lg">Order #{order.id.substring(0, 8)}</CardTitle>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center text-sm">
          <div className="font-semibold">{order.menu.title}</div>
          <div>Qty: {order.quantity}</div>
        </div>
        <div className="text-xs text-gray-500 mb-2">
          To be delivered to {order.shipping_details.name}
        </div>
        <div className="border-t pt-2 mt-2 space-y-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-semibold">Customer: {order.customer.full_name}</span>
              <a href={`tel:${order.customer.phone}`} className="ml-auto flex items-center gap-1 text-blue-600 hover:underline">
                <Phone className="h-3 w-3" />
                <span>Call</span>
              </a>
            </div>
            <div className="flex items-start gap-2 pl-6">
              <MapPin className="h-4 w-4 text-gray-500 mt-1" />
              <span className="text-xs">{formatAddress(order.shipping_details.address)}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-semibold">Chef: {order.mom.full_name}</span>
              <a href={`tel:${order.mom.phone}`} className="ml-auto flex items-center gap-1 text-blue-600 hover:underline">
                <Phone className="h-3 w-3" />
                <span>Call</span>
              </a>
            </div>
            <div className="flex items-start gap-2 pl-6">
              <MapPin className="h-4 w-4 text-gray-500 mt-1" />
              <span className="text-xs">{formatAddress(order.mom.address)}</span>
            </div>
          </div>
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
              <Button className="w-full mt-4" onClick={() => onComplete(order.id)} disabled={updatingOrderId === order.id}>
                {updatingOrderId === order.id ? 'Completing...' : 'Mark as Delivered'}
              </Button>
            )}
          </>
        ) : (
          onAccept && (
            <Button className="w-full mt-4" onClick={() => onAccept(order.id)} disabled={updatingOrderId === order.id}>
              {updatingOrderId === order.id ? 'Accepting...' : 'Accept Delivery'}
            </Button>
          )
        )}
      </CardContent>
    </Card>
  );
}
