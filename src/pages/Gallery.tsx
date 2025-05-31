import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Gallery: React.FC = () => {
  const navigate = useNavigate();

  // Helper to navigate home and scroll to a section using hash
  const goToSection = (hash: string = '') => {
    navigate(`/${hash}`);
  };

  return (
    <>
      <nav className="App-nav">
        <button onClick={() => goToSection()}>Landing</button>
        <button onClick={() => goToSection('#about')}>About</button>
        <button onClick={() => goToSection('#connections')}>Connections</button>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </nav>
      <div style={{ padding: '2rem', marginTop: '80px' }}>
        <h1>Photo Gallery</h1>
        <p>Gallery content will go here (fetch from Firebase later).</p>
      </div>
    </>
  );
};

export default Gallery;