import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PhotoCarousel from '../components/PhotoCarousel';
import '../App.css';

const Home: React.FC = () => {
  const homeRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const connectionsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();


  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to section if hash is present in URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#about' && aboutRef.current) {
      aboutRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (hash === '#connections' && connectionsRef.current) {
      connectionsRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (hash === '' && homeRef.current) {
      homeRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <>
      <nav className="App-nav">
        <button onClick={() => scrollTo(homeRef)}>Home</button>
        <button onClick={() => scrollTo(aboutRef)}>About</button>
        <button onClick={() => scrollTo(connectionsRef)}>Connections</button>
        <button onClick={() => navigate('/gallery')}>Gallery</button>
        <p>CART ICON</p>
      </nav>
      <div ref={homeRef} className="section" style={{ background: '#f4f4f4' }}>
        <h1>Landing Section</h1>
        <p>Welcome to the artist's page!</p>
        <PhotoCarousel />
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