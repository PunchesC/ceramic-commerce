import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Order } from '../models/Order';

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //For testing purpose, change the URL to your API endpoint
    // fetch(`/api/orders/${orderId}`)
    fetch(`'https://localhost:7034/api/orders/${orderId}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data);
        setLoading(false);
      });
  }, [orderId]);

  if (loading) return <div>Loading...</div>;
  if (!order) return <div>Order not found.</div>;

  return (
    <div>
      <h2>Order Confirmation</h2>
      <p>Order ID: {order.id}</p>
      <p>Status: {order.status}</p>
      <p>Date: {new Date(order.createdAt).toLocaleString()}</p>
      <h3>Items:</h3>
      <ul>
        {order.items.map(item => (
          <li key={item.id}>
            <img
              src={item.product.imageUrl || '/placeholder.jpg'}
              alt={item.product.title}
              style={{ width: 50, height: 50, objectFit: 'cover', marginRight: 8 }}
            />
            {item.product.title} x {item.quantity} — ${item.price.toFixed(2)}
          </li>
        ))}
      </ul>
      <h3>Total: ${order.total.toFixed(2)}</h3>
    </div>
  );
};

export default OrderConfirmation;