
import React, { useEffect, useState } from 'react';
import { Order } from '../models/Order';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetch(`${API_URL}/api/orders/user/me`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) navigate('/login');
          throw new Error('Failed to fetch orders');
        }
        return res.json();
      })
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
        console.error(err);
      });
  }, [user, navigate, API_URL]);

  if (loading) return <div className="orders-card">Loading...</div>;
  if (error) return <div className="orders-card" style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="orders-card">
      <h2>Your Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>{order.status}</td>
                <td>${order.total.toFixed(2)}</td>
                <td>
                  <button
                    className="orders-view-btn"
                    onClick={() => navigate(`/order-confirmation/${order.id}`)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderHistory;