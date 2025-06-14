import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

// Custom styles for the CardElement
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '18px',
      color: '#32325d',
      fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
      '::placeholder': {
        color: '#a0aec0',
      },
      padding: '12px 16px',
    },
    invalid: {
      color: '#fa755a',
    },
  },
};

const CheckoutForm: React.FC<{ total: number; onSuccess: () => void }> = ({ total, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { clearCart } = useCart();
  const { token } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    // 1. Call your backend to create a PaymentIntent
    //Testing purpose, change the URL to your API endpoint
    // const res = await fetch('https://localhost:7034/api/payments/create-intent', {

    try {
      const res = await fetch('https://localhost:7034/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ amount: Math.round(total * 100) }),
      });

      if (!res.ok) {
        // Try to get error message from backend, else use status text
        let message = 'Failed to create payment intent';
        try {
          const data = await res.json();
          message = data.error || message;
        } catch {
          message = res.statusText || message;
        }
        throw new Error(message);
      }

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
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      setProcessing(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        width: '100%',
        maxWidth: 400,
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        margin: '0 auto',
      }}
    >
      <div style={{ width: '100%', marginBottom: '1rem' }}>
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>
      <button
        type="submit"
        disabled={!stripe || processing}
        style={{
          marginTop: '1rem',
          padding: '0.75rem',
          fontSize: '1rem',
          borderRadius: '6px',
          background: '#32325d',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </form>
  );
};

export default CheckoutForm;