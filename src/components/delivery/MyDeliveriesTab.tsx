
import { OrderCard } from "./OrderCard";
import { EmptyStateCard } from "./EmptyStateCard";
import { Order } from "@/types/order";

interface MyDeliveriesTabProps {
  orders: Order[];
  onComplete: (orderId: string) => void;
  updatingOrderId: string | null;
}

export function MyDeliveriesTab({ orders, onComplete, updatingOrderId }: MyDeliveriesTabProps) {
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-4">My Deliveries</h2>
      {orders.length === 0 ? (
        <EmptyStateCard 
          title="No deliveries accepted yet"
          message="Accept an order to see it here!"
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {orders.map((order) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              isMyOrder={true}
              onComplete={onComplete}
              updatingOrderId={updatingOrderId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
