import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGalleryImages } from '../hooks/UseGalleryImages';
import { GalleryImage } from '../models/GalleryImage';
import { useCart } from '../contexts/CartContext';
import '../App.css';

const Gallery: React.FC = () => {
  const navigate = useNavigate();
  const [modalImage, setModalImage] = useState<GalleryImage | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const { images, loading } = useGalleryImages();
  const { addToCart, cart } = useCart();

  // --- Add these states for search and sort ---
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'title-asc' | 'title-desc' | 'price-asc' | 'price-desc'>('title-asc');

  const filteredImages = images
    .filter(img => img.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'title-asc') return a.title.localeCompare(b.title);
      if (sort === 'title-desc') return b.title.localeCompare(a.title);
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      return 0;
    });

  // In the select:
  <select value={sort} onChange={e => setSort(e.target.value as any)}>
    <option value="title-asc">Sort by Title (A-Z)</option>
    <option value="title-desc">Sort by Title (Z-A)</option>
    <option value="price-asc">Sort by Price (Low to High)</option>
    <option value="price-desc">Sort by Price (High to Low)</option>
  </select>

  return (
    <>
      <div ref={topRef} style={{ padding: '2rem', marginTop: '80px' }}>
        <h1>Gallery</h1>
        {/* --- Search and Sort Controls --- */}
        <div className="gallery-controls" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '0.5rem', fontSize: '1rem' }}
          />
          <select value={sort} onChange={e => setSort(e.target.value as any)}>
            <option value="title-asc">Sort by Title (A-Z)</option>
            <option value="title-desc">Sort by Title (Z-A)</option>
            <option value="price-asc">Sort by Price (Low to High)</option>
            <option value="price-desc">Sort by Price (High to Low)</option>
          </select>
        </div>
        {loading ? (
          <div>Loading images...</div>
        ) : (
          <div className="gallery-grid">
            {filteredImages.map((img) => (
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
                  <div style={{ fontWeight: 'bold', margin: '0.5em 0' }}>${img.price.toFixed(2)}</div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      addToCart({ id: img.id, title: img.title, imageUrl: img.imageUrl });
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
            <div style={{ fontWeight: 'bold', margin: '0.5em 0' }}>${modalImage.price.toFixed(2)}</div>
            <button onClick={() => setModalImage(null)} style={{ marginTop: '1rem' }}>
              Close
            </button>
            <button
              onClick={() => {
                addToCart({ id: modalImage.id, title: modalImage.title, imageUrl: modalImage.imageUrl });
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