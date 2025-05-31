import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import '../App.css';

function Header() {
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

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
      <nav className="App-nav">
        <button onClick={() => goToSection('#home')}>Home</button>
        <button onClick={() => goToSection('#about')}>About</button>
        <button onClick={() => goToSection('#connections')}>Connections</button>
        <button onClick={() => navigate('/gallery')}>Gallery</button>
        <button onClick={() => navigate('/cart')}>
          CART ({cart.reduce((sum, item) => sum + item.quantity, 0)})
        </button>
      </nav>
    </header>
  );
}

export default Header;