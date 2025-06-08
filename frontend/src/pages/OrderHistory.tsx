import React, { useEffect, useState } from 'react';
import { Order } from '../models/Order';
import { useAuth } from '../contexts/AuthContex';
import { useNavigate } from 'react-router-dom';

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
    }
      if (!token) return;
      //testing purpose
      // fetch('/api/orders/user/me', 
      fetch('https://localhost:7034/api/Orders/user/me', 
        {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          setOrders(data);
          setLoading(false);
        });
    }, [user, token, navigate]);

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