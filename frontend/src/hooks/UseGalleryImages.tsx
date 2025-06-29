import { useState, useEffect } from 'react';
import { GalleryImage } from '../models/GalleryImage';

export function useGalleryImages() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env.REACT_APP_API_URL;
//used mainly for fetching title and id not for image url need to be updated to use cloudinary images
  useEffect(() => {
    fetch(`${API_URL}/api/products`, {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then(data => {
        setImages(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { images, loading, error, API_URL };
}