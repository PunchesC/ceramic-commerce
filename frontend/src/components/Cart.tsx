import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';

const Cart: React.FC = () => {
    const { cart, removeFromCart, clearCart } = useCart();
    const [showCheckout, setShowCheckout] = useState(false);
    const [purchased, setPurchased] = useState(false);
    const total = cart.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);

    const handleCheckout = () => {
        setShowCheckout(true);
    };

    const handlePurchase = () => {
        setPurchased(true);
        setShowCheckout(false);
        clearCart(); // Clear the cart after purchase
    };

    if (cart.length === 0) {
        return <div>Your cart is empty.</div>;
    }

    return (
        <div>
            <h2>Your Cart</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {cart.map(item => (
                    <li key={item.id} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                        {item.imageUrl && (
                            <img
                                src={item.imageUrl}
                                alt={item.title}
                                style={{ width: 60, height: 60, objectFit: 'cover', marginRight: 12, borderRadius: 6 }}
                            />
                        )}
                        <strong>{item.title}</strong> (x{item.quantity})
                        <span style={{ marginLeft: '1rem' }}>${(item.price ?? 0).toFixed(2)}</span>
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
            <div style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
                Total: ${total.toFixed(2)}
            </div>
            {/* ...rest of your code... */}
            {showCheckout && (
                <div className="modal-overlay" onClick={() => setShowCheckout(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Checkout</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {cart.map(item => (
                                <li key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                    {item.imageUrl && (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.title}
                                            style={{ width: 40, height: 40, objectFit: 'cover', marginRight: 8, borderRadius: 4 }}
                                        />
                                    )}
                                    {item.title} (x{item.quantity}) - ${(item.price ?? 0).toFixed(2)}
                                </li>
                            ))}
                        </ul>
                        <div style={{ fontWeight: 'bold', margin: '1rem 0' }}>
                            Total: ${total.toFixed(2)}
                        </div>
                        <button onClick={handlePurchase} style={{ marginTop: '1rem' }}>
                            Complete Purchase
                        </button>
                        <button onClick={() => setShowCheckout(false)} style={{ marginLeft: '1rem' }}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
{purchased && (
    <div className="modal-overlay">
        <div className="modal-content">
            <h3>Order Confirmation</h3>
            <p>Thank you for your purchase!</p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {cart.map(item => (
                    <li key={item.id}>
                        {item.title} (x{item.quantity})
                    </li>
                ))}
            </ul>
            <div style={{ fontWeight: 'bold', margin: '1rem 0' }}>
                Total: ${total.toFixed(2)}
            </div>
            <button onClick={() => setPurchased(false)}>Close</button>
        </div>
    </div>
)}
        </div>
    );
};

export default Cart;