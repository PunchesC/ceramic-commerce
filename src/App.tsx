import React, { useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Gallery from './pages/Gallery';
import './App.css';

const MainPage: React.FC = () => {
  const landingRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const connectionsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav className="App-nav">
        <button onClick={() => navigate('/')}>Landing</button>
        <button onClick={() => navigate('/gallery')}>Photo Gallery</button>
        <button onClick={() => scrollTo(aboutRef)}>About</button>
        <button onClick={() => scrollTo(connectionsRef)}>Connections</button>
      </nav>
      <div ref={landingRef} className="section" style={{ background: '#f4f4f4' }}>
        <h1>Landing Section</h1>
        <p>Welcome to the artist's page!</p>
      </div>
      <div ref={aboutRef} className="section" style={{ background: '#e9ecef' }}>
        <h1>About</h1>
        <p>About the artist and the ceramic pieces.</p>
      </div>
      <div ref={connectionsRef} className="section" style={{ background: '#f4f4f4' }}>
        <h1>Connections</h1>
        <p>Contact info, social links, etc.</p>
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/gallery" element={<Gallery />} />
      </Routes>
    </Router>
  );
}

export default App;