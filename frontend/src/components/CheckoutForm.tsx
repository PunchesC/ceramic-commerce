import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '18px',
      color: '#32325d',
      fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
      '::placeholder': { color: '#a0aec0' },
      padding: '12px 16px',
    },
    invalid: { color: '#fa755a' },
  },
};

const CheckoutForm: React.FC<{ total: number; onSuccess: () => void }> = ({ total, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, clearCart } = useCart();
  const { user, token } = useAuth();
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      // 1. Create PaymentIntent
      const res = await fetch('https://localhost:7034/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ amount: Math.round(total * 100) }),
      });

      if (!res.ok) {
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

      // 2. Confirm card payment
      const result = await stripe?.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements?.getElement(CardElement)!,
        },
      });

      if (result?.error) {
        setError(result.error.message || 'Payment failed');
        setProcessing(false);
      } else if (result?.paymentIntent?.status === 'succeeded') {
        // 3. Create the order in your backend
        const orderRes = await fetch('https://localhost:7034/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            items: cart.map(item => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price,
            })),
            total,
            stripePaymentIntentId: result.paymentIntent.id,
            status: 'Paid',
            ...(user ? {} : { guestName, guestEmail }), // Send guest info if not logged in
          }),
        });

        if (!orderRes.ok) {
          setError('Payment succeeded but failed to create order.');
          setProcessing(false);
          return;
        }

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
      {/* Show guest fields if not logged in */}
      {!user && (
        <>
          <input
            type="text"
            placeholder="Your Name"
            value={guestName}
            onChange={e => setGuestName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            value={guestEmail}
            onChange={e => setGuestEmail(e.target.value)}
            required
          />
        </>
      )}
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