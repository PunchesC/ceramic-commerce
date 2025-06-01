import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import '../App.css';

function Header() {
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Helper to handle section navigation
  const goToSection = (hash: string) => {
    if (location.pathname === '/') {
      if (window.location.hash === hash) {
        // Always clear and reset the hash to force hashchange
        window.location.hash = '#force-refresh'; // set to a dummy hash
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
        <button onClick={() => { navigate('/cart'); setMenuOpen(false); }}>
          CART ({cart.reduce((sum, item) => sum + item.quantity, 0)})
        </button>
      </nav>
    </header>
  );
}

export default Header;