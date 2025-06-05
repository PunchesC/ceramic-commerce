import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import CheckoutForm from './CheckoutForm';

const Cart: React.FC = () => {
    const { cart, removeFromCart, clearCart } = useCart();
    const [showCheckout, setShowCheckout] = useState(false);
    const [purchased, setPurchased] = useState(false);
    const total = cart.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);

    if (cart.length === 0) {
        return <div>Your cart is empty.</div>;
    }

    return (
        <div>
            <h2>Your Cart</h2>
            <div style={{ marginBottom: '2rem' }}>
                {cart.map(item => (
                    <div
                        key={item.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1.5rem',
                            borderBottom: '1px solid #eee',
                            paddingBottom: '1rem'
                        }}
                    >
                        <img
                            src={item.imageUrl || '/placeholder.jpg'}
                            alt={item.title}
                            style={{
                                width: 80,
                                height: 80,
                                objectFit: 'cover',
                                borderRadius: 8,
                                background: '#f4f4f4'
                            }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                            <div>Price: ${item.price?.toFixed(2)}</div>
                            <div>Quantity: {item.quantity}</div>
                        </div>
                        <button
                            onClick={() => removeFromCart(item.id)}
                            style={{
                                background: '#fa5252',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                padding: '0.5rem 1rem',
                                cursor: 'pointer'
                            }}
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>
            <div style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
                Total: ${total.toFixed(2)}
            </div>
            <button onClick={() => setShowCheckout(true)} style={{ marginBottom: '1rem' }}>
                Checkout
            </button>
            {showCheckout && (
                <div className="modal-overlay" onClick={() => setShowCheckout(false)}>
                    <div
                        className="modal-content"
                        onClick={e => e.stopPropagation()}
                        style={{
                            maxWidth: 500,
                            width: '90%',
                            minHeight: 350,
                            padding: '2rem',
                            boxSizing: 'border-box',
                            background: '#fff',
                            borderRadius: '12px',
                            boxShadow: '0 4px 32px rgba(0,0,0,0.2)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            zIndex: 1001
                        }}
                    >
                        <h3>Checkout</h3>
                        <CheckoutForm
                            total={total}
                            onSuccess={() => {
                                setPurchased(true);
                                setShowCheckout(false);
                            }}
                        />
                        <button onClick={() => setShowCheckout(false)} style={{ marginLeft: '1rem', marginTop: '1rem' }}>
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
                        <button onClick={() => setPurchased(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;