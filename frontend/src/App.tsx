import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import CartPage from './pages/CartPage';
import Header from './components/Header';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import './App.css';

// Load Stripe publishable key from .env
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);

function App() {
  return (
    <Elements stripe={stripePromise}>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </Router>
    </Elements>
  );
}

export default App;