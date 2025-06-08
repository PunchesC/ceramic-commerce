import { useState, useEffect } from 'react';
import { GalleryImage } from '../models/GalleryImage';


export function useGalleryImages() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  //localhost for development, change to your API URL in production
  fetch("https://localhost:7034/api/products")
    .then(res => {
      console.log("Raw response:", res);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    })
    .then(data => {
      console.log("Fetched images:", data);
      setImages(data);
      setLoading(false);
    })
    .catch(err => {
      console.error("Fetch error:", err);
      setError(err.message);
      setLoading(false);
    });
}, []);

  return { images, loading, error };
}