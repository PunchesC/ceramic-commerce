import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Home: React.FC = () => {
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
        <button onClick={() => scrollTo(landingRef)}>Landing</button>
        <button onClick={() => scrollTo(aboutRef)}>About</button>
        <button onClick={() => scrollTo(connectionsRef)}>Connections</button>
        <button onClick={() => navigate('/gallery')}>Gallery</button>
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

export default Home;