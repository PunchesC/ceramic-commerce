import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import CartPage from './pages/CartPage';
import Header from './components/Header'; // <-- Import Header
import './App.css';

function App() {
  return (
    <Router>
      <Header /> {/* Use Header here */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </Router>
  );
}

export default App;