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
    fetch(`https://localhost:7034/api/orders/${orderId}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data);
        setLoading(false);
        console.log(data)
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
          <li key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 8, marginRight: 16 }}>
              {item.product?.imageUrls && item.product.imageUrls.length > 0 ? (
                item.product.imageUrls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`${item.product?.title || 'Product'} image ${idx + 1}`}
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }}
                  />
                ))
              ) : (
                <img
                  src="/placeholder.jpg"
                  alt="No product"
                  style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }}
                />
              )}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{item.product?.title || 'Unknown Product'}</div>
              <div>
                Quantity: {item.quantity} &nbsp;|&nbsp; Price: ${item.price.toFixed(2)}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <h3>Total: ${order.total.toFixed(2)}</h3>
    </div>
  );
};

export default OrderConfirmation;