import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
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
            {/* ...cart list as before... */}
            <div style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
                Total: ${total.toFixed(2)}
            </div>
            <button onClick={() => setShowCheckout(true)} style={{ marginBottom: '1rem' }}>
                Checkout
            </button>
            {showCheckout && (
                <div className="modal-overlay" onClick={() => setShowCheckout(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Checkout</h3>
                        <CheckoutForm
                            total={total}
                            onSuccess={() => {
                                setPurchased(true);
                                setShowCheckout(false);
                            }}
                        />
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
                        <button onClick={() => setPurchased(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;