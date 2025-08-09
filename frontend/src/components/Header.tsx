import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

function Header() {
  const { cart } = useCart();
  // Compute total items in cart
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Helper to handle section navigation
  const goToSection = (hash: string) => {
    if (location.pathname === '/') {
      if (window.location.hash === hash) {
        window.location.hash = '#force-refresh';
        setTimeout(() => {
          window.location.hash = hash;
        }, 0);
      } else {
        window.location.hash = hash;
      }
    } else {
      navigate('/' + hash);
    }
  };

  return (
    <header className="header">
      <button
        className="hamburger"
        aria-label="Toggle navigation"
        onClick={() => setMenuOpen(m => !m)}
      >
        ☰
      </button>
      <nav className={`App-nav${menuOpen ? ' open' : ''}`}>
        <button onClick={() => { goToSection('#home'); setMenuOpen(false); }}>Home</button>
        <button onClick={() => { goToSection('#about'); setMenuOpen(false); }}>About</button>
        <button onClick={() => { goToSection('#connections'); setMenuOpen(false); }}>Connections</button>
        <button onClick={() => { navigate('/gallery'); setMenuOpen(false); }}>Gallery</button>
        {itemCount > 0 && (
          <button onClick={() => { navigate('/cart'); setMenuOpen(false); }}>
            CART ({itemCount})
          </button>
        )}
        {user ? (
          <>
            <button onClick={() => { navigate('/orders'); setMenuOpen(false); }}>Orders</button>
            <button onClick={() => { navigate('/profile'); setMenuOpen(false); }}>Profile</button>
            <button onClick={() => { logout(); setMenuOpen(false); }}>Logout</button>
          </>
        ) : (
          <button onClick={() => { navigate('/login'); setMenuOpen(false); }}>Login</button>
        )}
      </nav>
    </header>
  );
}

export default Header;