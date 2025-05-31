import { Link as ScrollLink } from 'react-scroll';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <nav>
        <ScrollLink to="landing" smooth={true} duration={500}>Landing</ScrollLink>
        <ScrollLink to="about" smooth={true} duration={500}>About</ScrollLink>
        <ScrollLink to="connections" smooth={true} duration={500}>Connections</ScrollLink>
        <Link to="/gallery">Gallery</Link>
      </nav>
    </header>
  );
}

export default Header;
