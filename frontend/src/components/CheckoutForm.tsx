import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../contexts/CartContext';

const CheckoutForm: React.FC<{ total: number; onSuccess: () => void }> = ({ total, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, clearCart } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    // 1. Call your backend to create a PaymentIntent
    const res = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Math.round(total * 100) }), // amount in cents
    });
    const { clientSecret } = await res.json();

    // 2. Confirm the card payment
    const result = await stripe?.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements?.getElement(CardElement)!,
      },
    });

    if (result?.error) {
      setError(result.error.message || 'Payment failed');
      setProcessing(false);
    } else if (result?.paymentIntent?.status === 'succeeded') {
      clearCart();
      setProcessing(false);
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe || processing} style={{ marginTop: '1rem' }}>
        {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </form>
  );
};

export default CheckoutForm;