import React, { useState, useRef } from 'react';
import { useGalleryImages } from '../hooks/UseGalleryImages';
import { useCloudinaryImages } from '../hooks/UseCloudinaryImages';
import { GalleryImage } from '../models/GalleryImage';
import { useCart } from '../contexts/CartContext';
import '../App.css';

const Gallery: React.FC = () => {
  // Removed unused navigate variable
  const [modalImage, setModalImage] = useState<GalleryImage | null>(null);
  const [modalImageIndex, setModalImageIndex] = useState(0); // for swiping in modal
  const topRef = useRef<HTMLDivElement>(null);

  const { images, loading, error } = useGalleryImages();
  const { addToCart } = useCart();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'title-asc' | 'title-desc' | 'price-asc' | 'price-desc'>('title-asc');

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

  // Helper to get first Cloudinary image for a product
  const CloudinaryThumb: React.FC<{ productId: number; title: string }> = ({ productId, title }) => {
    const { imageUrls, loading } = useCloudinaryImages(productId);
    if (loading) return <div style={{ width: 60, height: 60, background: '#eee' }} />;
    if (imageUrls.length > 0) {
      return <img src={imageUrls[0]} alt={title || 'Product photo'} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />;
    }
    return <div style={{ width: 60, height: 60, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>;
  };

  // Modal Cloudinary images
  const { imageUrls: modalCloudinaryImages, loading: modalCloudinaryLoading } = useCloudinaryImages(modalImage ? modalImage.id : null);

  // Modal navigation
  const modalPrev = () => setModalImageIndex(idx => (modalCloudinaryImages.length > 0 ? (idx === 0 ? modalCloudinaryImages.length - 1 : idx - 1) : 0));
  const modalNext = () => setModalImageIndex(idx => (modalCloudinaryImages.length > 0 ? (idx === modalCloudinaryImages.length - 1 ? 0 : idx + 1) : 0));

  // Reset modal image index when modalImage or images change
  React.useEffect(() => {
    setModalImageIndex(0);
  }, [modalImage, modalCloudinaryImages.length]);

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
                <CloudinaryThumb productId={img.id} title={img.title} />
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
                        imageUrls: [], // You can fetch Cloudinary images here if needed
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
            {modalCloudinaryLoading ? (
              <div style={{ width: 300, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
            ) : modalCloudinaryImages.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={modalPrev}>&lt;</button>
                  <img
                    src={modalCloudinaryImages[modalImageIndex]}
                    alt={modalImage.title || 'Product photo'}
                    style={{ width: 300, height: 300, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }}
                  />
                  <button onClick={modalNext}>&gt;</button>
                </div>
                <div style={{ marginTop: 8, fontSize: '0.9em', color: '#666' }}>
                  Image {modalImageIndex + 1} of {modalCloudinaryImages.length}
                </div>
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
                  imageUrls: modalCloudinaryImages,
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