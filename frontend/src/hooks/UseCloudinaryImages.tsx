import { useState, useEffect } from 'react';
import { useCloudinaryImageCache } from '../contexts/CloudinaryImageCacheContext';

export function useCloudinaryImages(productId: number | null) {
  const { getImages, setImages } = useCloudinaryImageCache();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!productId) return;
    const cached = getImages(productId);
    if (cached) {
      setImageUrls(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${API_URL}/api/products/${productId}/cloudinary-images`, {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch Cloudinary images');
        return res.json();
      })
      .then(data => {
        setImageUrls(data);
        setImages(productId, data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [productId, getImages, setImages, API_URL]);

  return { imageUrls, loading, error };
}