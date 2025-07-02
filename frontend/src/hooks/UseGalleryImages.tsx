import { useState, useEffect } from 'react';
import { GalleryImage } from '../models/GalleryImage';

export function useGalleryImages() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env.REACT_APP_API_URL;
//used mainly for fetching title and id not for image url need to be updated to use cloudinary images
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log(API_URL);
        console.log(process.env.REACT_APP_API_URL);
        const res = await fetch(`${API_URL}/api/products`, {
          credentials: 'include',
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to fetch products: ${res.status} ${res.statusText} - ${text}`);
        }
        const data = await res.json();
        setImages(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || String(err));
        setLoading(false);
        console.error('Fetch error:', err);
      }
    };
    fetchProducts();
  }, [API_URL]);

  return { images, loading, error, API_URL };
}