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

  const { images, loading, error } = useGalleryImages();
  const { addToCart } = useCart();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'title-asc' | 'title-desc' | 'price-asc' | 'price-desc'>('title-asc');

// // Multiply products for testing (e.g., repeat 5 times)
// const multipliedImages = Array(5)
//   .fill(null)
//   .flatMap((_, i) =>
//     images.map(img => ({
//       ...img,
//       id: Number(`${img.id}${i}`), // Ensure unique id for each duplicate
//       title: `${img.title} (${i + 1})`, // Optional: show which copy
//     }))
//   );

// Use multipliedImages instead of images below:
// const types = Array.from(new Set(multipliedImages.map(img => img.type).filter(Boolean)));

// const filteredImages = multipliedImages
//   .filter(img => img.title.toLowerCase().includes(search.toLowerCase()))
//   .filter(img => typeFilter === 'all' || img.type === typeFilter)
//   .sort((a, b) => {
//     if (sort === 'title-asc') return a.title.localeCompare(b.title);
//     if (sort === 'title-desc') return b.title.localeCompare(a.title);
//     if (sort === 'price-asc') return a.price - b.price;
//     if (sort === 'price-desc') return b.price - a.price;
//     return 0;
//   });
  // Get unique types from images
  const types = Array.from(new Set(images.map(img => img.type).filter(Boolean)));
  
  const filteredImages = images
    .filter(img => img.title.toLowerCase().includes(search.toLowerCase()))
    .filter(img => typeFilter === 'all' || img.type === typeFilter)
    .sort((a, b) => {
      if (sort === 'title-asc') return a.title.localeCompare(b.title);
      if (sort === 'title-desc') return b.title.localeCompare(a.title);
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      return 0;
    });

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
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          {types.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value as any)}>
          <option value="title-asc">Sort by Title (A-Z)</option>
          <option value="title-desc">Sort by Title (Z-A)</option>
          <option value="price-asc">Sort by Price (Low to High)</option>
          <option value="price-desc">Sort by Price (High to Low)</option>
        </select>
      </div>
      {/* --- Loading, Error, and Empty States --- */}
      {loading ? (
        <div>Loading images...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>Error: {error}</div>
      ) : images.length === 0 ? (
        <div style={{ color: 'orange' }}>No products found.</div>
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
              {img.images && img.images.length > 0 ? (
                <div style={{ display: 'flex', gap: 4 }}>
                  {img.images.map((image, idx) => (
                    <img
                      key={idx}
                      src={image.url}
                      alt={`${img.title} image ${idx + 1}`}
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ width: 200, height: 200, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  No Image
                </div>
              )}
              <div className="gallery-caption">
                <strong>{img.title}</strong>
                <div style={{ fontSize: '0.9em', color: '#666' }}>{img.description}</div>
                <div style={{ fontWeight: 'bold', margin: '0.5em 0' }}>
                  ${typeof img.price === "number" ? img.price.toFixed(2) : "0.00"}
                </div>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    addToCart({
                      id: img.id,
                      title: img.title,
                      imageUrls: img.images ? img.images.map((i: any) => i.url) : [],
                      price: img.price,
                    });
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
    {/* --- Modal for Image Details --- */}
    {modalImage && (
      <div className="modal-overlay" onClick={() => setModalImage(null)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          {modalImage.images && modalImage.images.length > 0 ? (
            <div style={{ display: 'flex', gap: 8 }}>
              {modalImage.images.map((image, idx) => (
                <img
                  key={idx}
                  src={image.url}
                  alt={`${modalImage.title} image ${idx + 1}`}
                  style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }}
                />
              ))}
            </div>
          ) : (
            <div style={{ width: 300, height: 300, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              No Image
            </div>
          )}
          <h2>{modalImage.title}</h2>
          <p>{modalImage.description}</p>
          <div style={{ fontWeight: 'bold', margin: '0.5em 0' }}>
            ${typeof modalImage.price === "number" ? modalImage.price.toFixed(2) : "0.00"}
          </div>
          <button onClick={() => setModalImage(null)} style={{ marginTop: '1rem' }}>
            Close
          </button>
          <button
            onClick={() => {
              addToCart({
                id: modalImage.id,
                title: modalImage.title,
                imageUrls: modalImage.images ? modalImage.images.map((i: any) => i.url) : [],
                price: modalImage.price,
              });
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