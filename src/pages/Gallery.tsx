import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGalleryImages } from '../hooks/UseGalleryImages';
import { GalleryImage } from '../models/GalleryImage'; // or ../types/GalleryImage
import { useCart } from '../contexts/CartContext';
import '../App.css';

const Gallery: React.FC = () => {
  const navigate = useNavigate();
  const [modalImage, setModalImage] = useState<GalleryImage | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const { images, loading } = useGalleryImages();
  const { addToCart, cart } = useCart();

  const goToSection = (hash: string = '') => {
    navigate(`/${hash}`);
  };
  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* <nav className="App-nav">
        <button onClick={() => goToSection()}>Home</button>
        <button onClick={() => goToSection('#about')}>About</button>
        <button onClick={() => goToSection('#connections')}>Connections</button>
        <button onClick={() => navigate('/cart')}>
          CART ({cart.reduce((sum, item) => sum + item.quantity, 0)})
        </button>
      </nav> */}
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
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      addToCart({ id: img.id, title: img.title });
                    }}
                    aria-label={`Add ${img.title} to cart`}
                    style={{ marginTop: '0.5rem' }}
                  >
                    Add to Cart
                  </button>
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
            <button onClick={() => setModalImage(null)} style={{ marginTop: '1rem' }}>
              Close
            </button>
            <button
              onClick={() => {
                addToCart({ id: modalImage.id, title: modalImage.title });
                setModalImage(null);
              }}
              style={{ marginTop: '1rem', marginLeft: '1rem' }}
              aria-label={`Add ${modalImage.title} to cart from modal`}
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery;