import React, { useEffect, useState } from 'react';
import { Order } from '../models/Order';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const navigate = useNavigate();

useEffect(() => {
  if (!user || !token) {
    navigate('/login');
    return;
  }
  if (!token) return;
console.log('Fetching orders for user:', user.email);
console.log('Using token:', token);
console.log(localStorage.getItem('token'))
  fetch('https://localhost:7034/api/orders/user/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json"
    },
  })
    .then(res => {
      if (!res.ok) {
        // Optionally handle specific status codes
        if (res.status === 401) {
          navigate('/login');
        }
        throw new Error('Failed to fetch orders');
      }
      return res.json();
    })
    .then(data => {
      console.log(data)
      setOrders(data);
      setLoading(false);
    })
    .catch(err => {
      setLoading(false);
      // Optionally set an error state and display a message
      console.error(err);
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