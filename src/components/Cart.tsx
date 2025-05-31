import React from 'react';
import { useCart } from '../contexts/CartContext';

const Cart: React.FC = () => {
  const { cart, removeFromCart } = useCart();

  if (cart.length === 0) {
    return <div>Your cart is empty.</div>;
  }

  return (
    <div>
      <h2>Your Cart</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {cart.map(item => (
          <li key={item.id} style={{ marginBottom: '1rem' }}>
            <strong>{item.title}</strong> (x{item.quantity})
            <button
              onClick={() => removeFromCart(item.id)}
              style={{ marginLeft: '1rem' }}
              aria-label={`Remove ${item.title} from cart`}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      {/* Add checkout button here in the future */}
    </div>
  );
};

export default Cart;