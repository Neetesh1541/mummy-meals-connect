
import { OrderCard } from "./OrderCard";
import { EmptyStateCard } from "./EmptyStateCard";
import { Order } from "@/types/order";

interface AvailableDeliveriesTabProps {
  orders: Order[];
  onAccept: (orderId: string) => void;
  updatingOrderId: string | null;
}

export function AvailableDeliveriesTab({ orders, onAccept, updatingOrderId }: AvailableDeliveriesTabProps) {
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-4">Available Deliveries</h2>
      {orders.length === 0 ? (
        <EmptyStateCard 
          title="No deliveries available"
          message="Check back later for new opportunities!"
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {orders.map((order) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              isMyOrder={false}
              onAccept={onAccept}
              updatingOrderId={updatingOrderId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
