import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../App.css';

type GalleryImage = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
};

const images: GalleryImage[] = [
  {
    id: 1,
    title: 'Ceramic Piece A',
    description: 'Description for piece A',
    imageUrl: require('../assets/a.jpg'),
  },
  {
    id: 2,
    title: 'Ceramic Piece B',
    description: 'Description for piece B',
    imageUrl: require('../assets/b.jpg'),
  },
  {
    id: 3,
    title: 'Ceramic Piece C',
    description: 'Description for piece C',
    imageUrl: require('../assets/c.jpg'),
  },
  {
    id: 4,
    title: 'Ceramic Piece D',
    description: 'Description for piece D',
    imageUrl: require('../assets/d.jpg'),
  },
  {
    id: 5,
    title: 'Ceramic Piece E',
    description: 'Description for piece E',
    imageUrl: require('../assets/e.jpg'),
  },
];

const Gallery: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [modalImage, setModalImage] = useState<GalleryImage | null>(null);

  // Ref for the top of the gallery
  const topRef = useRef<HTMLDivElement>(null);

  // Helper to navigate home and scroll to a section using hash
  const goToSection = (hash: string = '') => {
    navigate(`/${hash}`);
  };
    // Scroll to top of gallery
  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav className="App-nav">
        <button onClick={() => goToSection()}>Home</button>
        <button onClick={() => goToSection('#about')}>About</button>
        <button onClick={() => goToSection('#connections')}>Connections</button>
        <button onClick={scrollToTop}>Gallery</button>
        <p>CART ICON</p>
      </nav>
      <div ref={topRef} style={{ padding: '2rem', marginTop: '80px' }}>
        <h1>Gallery</h1>
        <div className="gallery-grid">
          {images.map((img) => (
            <div
              key={img.id}
              className="gallery-item"
              onClick={() => setModalImage(img)}
              tabIndex={0}
              role="button"
              aria-label={`View ${img.title}`}
            >
              <img src={img.imageUrl} alt={img.title} />
              <div className="gallery-caption">
                <strong>{img.title}</strong>
                <div style={{ fontSize: '0.9em', color: '#666' }}>{img.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Modal code remains unchanged */}
      {modalImage && (
        <div className="modal-overlay" onClick={() => setModalImage(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <img src={modalImage.imageUrl} alt={modalImage.title} />
            <h2>{modalImage.title}</h2>
            <p>{modalImage.description}</p>
            <button onClick={() => setModalImage(null)} style={{ marginTop: '1rem' }}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery;