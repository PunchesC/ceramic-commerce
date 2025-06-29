import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'pending' | 'confirmed' | 'failed' | 'idle'>('idle');
  const [shippingAddress, setShippingAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const API_URL = process.env.REACT_APP_API_URL;

  // Polling function to check order/payment status
  const checkOrderStatus = async (intentId: string, attempt = 0) => {
    if (attempt > 15) { // stop after 15 tries (~30 seconds)
      setOrderStatus('failed');
      setError('Order confirmation timed out.');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/orders/status?paymentIntentId=${intentId}`);
      if (response.status === 404) {
        setTimeout(() => checkOrderStatus(intentId, attempt + 1), 2000);
        return;
      }
      const data = await response.json();
      if (data.status === 'confirmed') {
        setOrderStatus('confirmed');
      } else if (data.status === 'failed') {
        setOrderStatus('failed');
      } else {
        setTimeout(() => checkOrderStatus(intentId, attempt + 1), 2000);
      }
    } catch (error) {
      setOrderStatus('failed');
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Prevent duplicate submission
    if (processing || orderStatus === 'pending' || orderStatus === 'confirmed') {
      setError('Order is already being processed or completed.');
      return;
    }
    // Validate shipping address
    const { line1, city, state, postalCode, country } = shippingAddress;
    if (!line1 || !city || !state || !postalCode || !country) {
      setError('Please fill out all required shipping address fields.');
      return;
    }

    setProcessing(true);
    try {
      // 1. Create PaymentIntent first
      const paymentRes = await fetch(`${API_URL}/api/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: Math.round(total * 100),
        }),
      });

      if (!paymentRes.ok) {
        setError('Failed to create payment intent');
        setProcessing(false);
        return;
      }

      const { clientSecret, paymentIntentId } = await paymentRes.json();

      // 2. Create the order, passing paymentIntentId
      const orderRes = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          stripePaymentIntentId: paymentIntentId,
          total,
          status: 'pending', // use lowercase
          ...(user ? {} : { guestName, guestEmail }),
          shippingAddress: { ...shippingAddress },
        }),
      });

      if (!orderRes.ok) {
        const data = await orderRes.json();
        setError(data?.message || 'Order creation failed (possibly insufficient stock).');
        setProcessing(false);
        return;
      }

      const order = await orderRes.json();

      // 3. Confirm card payment
      const result = await stripe?.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements?.getElement(CardElement)!,
        },
      });

      if (result?.error) {
        setError(result.error.message || 'Payment failed');
        setProcessing(false);
      } else if 
      (result?.paymentIntent?.status === 'succeeded') {
        // Removed setPaymentIntentId to fix unused variable lint error
        setOrderStatus('pending');
        checkOrderStatus(result.paymentIntent.id);
        clearCart();
        navigate(`/order-confirmation/${order.id}`);
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
        <label>Shipping Address</label>
        <input
          type="text"
          placeholder="Address Line 1"
          value={shippingAddress.line1}
          onChange={e => setShippingAddress({ ...shippingAddress, line1: e.target.value })}
          required
          className="checkout-input"
        />
        <input
          type="text"
          placeholder="Address Line 2"
          value={shippingAddress.line2}
          onChange={e => setShippingAddress({ ...shippingAddress, line2: e.target.value })}
          className="checkout-input"
        />
        <input
          type="text"
          placeholder="City"
          value={shippingAddress.city}
          onChange={e => setShippingAddress({ ...shippingAddress, city: e.target.value })}
          required
          className="checkout-input"
        />
        <input
          type="text"
          placeholder="State"
          value={shippingAddress.state}
          onChange={e => setShippingAddress({ ...shippingAddress, state: e.target.value })}
          required
          className="checkout-input"
        />
        <input
          type="text"
          placeholder="Postal Code"
          value={shippingAddress.postalCode}
          onChange={e => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
          required
          className="checkout-input"
        />
        <input
          type="text"
          placeholder="Country"
          value={shippingAddress.country}
          onChange={e => setShippingAddress({ ...shippingAddress, country: e.target.value })}
          required
          className="checkout-input"
        />
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