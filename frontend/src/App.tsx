import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CartPage from './pages/CartPage';
import Header from './components/Header';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';
import './App.css';
import { useAuth } from './contexts/AuthContext';
import { AdminRoute, AuthRoute } from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import Gallery from './pages/Gallery';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminProductManager from './pages/AdminProductManager';

// Load Stripe publishable key from azure static app settings
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);

function App() {
  const { user } = useAuth();
  return (
    <Elements stripe={stripePromise}>
      <Router>
        <Header />
        <nav>
          <a href="/">Home</a>
          <a href="/products">Products</a>
          <a href="/gallery">Gallery</a>
          <a href="/cart">Cart</a>
          {user && <a href="/orders">My Orders</a>}
          {user && <a href="/profile">Profile</a>}
          {user?.isAdmin && <a href="/admin">Admin Dashboard</a>}
        </nav>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/cart" element={<CartPage />} />
                    <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> 
          {/* Authenticated user routes */}
          <Route path="/orders" element={
            <AuthRoute>
              <OrderHistory />
            </AuthRoute>
          } />
          <Route path="/profile" element={
            <AuthRoute>
              <Profile />
            </AuthRoute>
          } />
          {/* Admin-only routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/products" element={
            <AdminRoute>
              <AdminProductManager />
            </AdminRoute>
          } />
          {/* ...other admin routes... */}
          <Route path="/unauthorized" element={<div>403 Unauthorized</div>} />
        </Routes>
      </Router>
    </Elements>
  );
}

export default App;