import React, { useEffect, useState } from 'react';
import { Order } from '../models/Order';

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders/user/me') // Adjust endpoint as needed
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Your Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul>
          {orders.map(order => (
            <li key={order.id}>
              <a href={`/order-confirmation/${order.id}`}>Order #{order.id}</a> — {order.status} — ${order.total.toFixed(2)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrderHistory;