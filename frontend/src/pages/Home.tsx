import React, { useRef, useEffect } from 'react';
import PhotoCarousel from '../components/PhotoCarousel';
import '../App.css';

const Home: React.FC = () => {
  const homeRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const connectionsRef = useRef<HTMLDivElement>(null);

  // Listen for hash changes and scroll to the correct section
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#about' && aboutRef.current) {
        aboutRef.current.scrollIntoView({ behavior: 'smooth' });
      } else if (hash === '#connections' && connectionsRef.current) {
        connectionsRef.current.scrollIntoView({ behavior: 'smooth' });
      } else if (
        hash === '#home' || hash === '' || hash === '#' || hash === '#force-refresh'
      ) {
        homeRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <>
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