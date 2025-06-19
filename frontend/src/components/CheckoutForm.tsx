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
  const [orderStatus, setOrderStatus] = useState<'pending' | 'confirmed' | 'failed' | 'idle'>('idle');
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  // Polling function to check order/payment status
  const checkOrderStatus = async (intentId: string) => {
    try {
      const response = await fetch(`/api/orders/status?paymentIntentId=${intentId}`);
      const data = await response.json();
      if (data.status === 'confirmed') {
        setOrderStatus('confirmed');
      } else if (data.status === 'failed') {
        setOrderStatus('failed');
      } else {
        // Still pending, poll again after a delay
        setTimeout(() => checkOrderStatus(intentId), 2000);
      }
    } catch (error) {
      setOrderStatus('failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      // 1. Create the order first (inventory check happens here)
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
          status: 'Pending',
          ...(user ? {} : { guestName, guestEmail }),
        }),
      });

      if (!orderRes.ok) {
        const data = await orderRes.json();
        setError(data?.message || 'Order creation failed (possibly insufficient stock).');
        setProcessing(false);
        return;
      }

      const order = await orderRes.json();

      // 2. Create PaymentIntent, pass orderId as metadata
      const paymentRes = await fetch('https://localhost:7034/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          orderId: order.id, // pass orderId as metadata if your backend supports it
        }),
      });

      if (!paymentRes.ok) {
        setError('Failed to create payment intent');
        setProcessing(false);
        return;
      }

      const { clientSecret } = await paymentRes.json();

      // 3. Confirm card payment
      const result = await stripe?.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements?.getElement(CardElement)!,
        },
      });

      if (result?.error) {
        setError(result.error.message || 'Payment failed');
        setProcessing(false);
      } else if (result?.paymentIntent?.status === 'succeeded') {
        // 4. (Optional) PATCH order with paymentIntentId if needed
        await fetch(`https://localhost:7034/api/orders/${order.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ stripePaymentIntentId: result.paymentIntent.id }),
        });

        setPaymentIntentId(result.paymentIntent.id);
        setOrderStatus('pending');
        checkOrderStatus(result.paymentIntent.id);

        // clearCart();
        // setProcessing(false);
        // onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      setProcessing(false);
    }
  };

  return (
    <div className="formContainer">
      <form onSubmit={handleSubmit} className="checkout-form">
        {/* Show guest fields if not logged in */}
        {!user && (
          <>
            <input
              type="text"
              placeholder="Your Name"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
              required
              className="checkout-input"
            />
            <input
              type="email"
              placeholder="Your Email"
              value={guestEmail}
              onChange={e => setGuestEmail(e.target.value)}
              required
              className="checkout-input"
            />
          </>
        )}
        <label className="cardLabel">Card Details</label>
        <div className="cardBox">
          <div className="cardElementWrapper">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="submitButton"
        >
          {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
        </button>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </form>
      {orderStatus === 'pending' && <div>Processing payment, please wait...</div>}
      {orderStatus === 'confirmed' && <div>Order confirmed! Thank you for your purchase.</div>}
      {orderStatus === 'failed' && <div>Payment failed or not confirmed. Please try again.</div>}
    </div>
  );
}

export default CheckoutForm;