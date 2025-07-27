import { useState, useEffect } from 'react';
import { GalleryImage } from '../models/GalleryImage';

export function useGalleryImages() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        if (!res.ok) throw new Error('Failed to fetch products');
        const products = await res.json();

        // For each product, fetch backend image URLs
        const productsWithImages = await Promise.all(
          products.map(async (product: GalleryImage) => {
            const imgRes = await fetch(`${API_URL}/api/product-images/${product.id}`);
            let imageUrls: string[] = [];
            if (imgRes.ok) imageUrls = await imgRes.json();
            return { ...product, imageUrls };
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