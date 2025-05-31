import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGalleryImages } from '../hooks/UseGalleryImages';
import { GalleryImage } from '../models/GalleryImage';
import '../App.css';

const Gallery: React.FC = () => {
  const navigate = useNavigate();
  const [modalImage, setModalImage] = useState<GalleryImage | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const { images, loading } = useGalleryImages();

  const goToSection = (hash: string = '') => {
    navigate(`/${hash}`);
  };
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
        {loading ? (
          <div>Loading images...</div>
        ) : (
          <div className="gallery-grid">
            {images.map((img) => (
              <div
                key={img.id}
                className="gallery-item"
                onClick={() => setModalImage(img)}
                tabIndex={0}
                role="button"
                aria-label={`View ${img.title}`}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setModalImage(img); }}
              >
                <img src={img.imageUrl} alt={img.title} />
                <div className="gallery-caption">
                  <strong>{img.title}</strong>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>{img.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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