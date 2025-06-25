import { useState, useEffect } from 'react';
import { useCloudinaryImageCache } from '../contexts/CloudinaryImageCacheContext';

export function useCloudinaryImages(productId: number | null) {
  const { getImages, setImages } = useCloudinaryImageCache();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    const cached = getImages(productId);
    if (cached) {
      setImageUrls(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`https://localhost:7034/api/products/${productId}/cloudinary-images`)
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
  }, [productId, getImages, setImages]);

  return { imageUrls, loading, error };
}