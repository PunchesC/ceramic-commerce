import { useState, useEffect } from 'react';
import { GalleryImage } from '../models/GalleryImage';
import type { ImageVariant } from '../models/ImageVariant';

export function useGalleryImages() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch product list first
        const res = await fetch(`${API_URL}/api/products`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch products');
        const products = await res.json();

        // If each product already includes imageUrls (thumbnails), use them directly
        if (products.length && Array.isArray(products[0]?.imageUrls)) {
          setImages(products);
          setLoading(false);
          return;
        }

        // Otherwise, fetch image variants per product and prefer all w800 URLs, else originals
        const productsWithImages = await Promise.all(
          products.map(async (product: GalleryImage) => {
            try {
              const imgRes = await fetch(`${API_URL}/api/product-images/${product.id}`, { credentials: 'include' });
              if (!imgRes.ok) return { ...product, imageUrls: [] };
              const variants: ImageVariant[] = await imgRes.json();
              variants.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

              const w800s = variants.filter(v => v.variant?.toLowerCase() === 'w800');
              const originals = variants.filter(v => v.variant?.toLowerCase() === 'original');
              const chosen = w800s.length ? w800s : originals;
              const urls = chosen.map(v => v.url);

              return { ...product, imageUrls: urls };
            } catch {
              return { ...product, imageUrls: [] };
            }
          })
        );

        setImages(productsWithImages);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || String(err));
        setLoading(false);
      }
    };

    fetchProducts();
  }, [API_URL]);

  return { images, loading, error };
}