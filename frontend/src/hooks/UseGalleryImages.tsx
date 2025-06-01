import { useState, useEffect } from 'react';
import { GalleryImage } from '../models/GalleryImage';

const mockImages: GalleryImage[] = [
  {
    id: 1,
    title: 'A',
    description: 'Description for piece A',
    imageUrl: require('../assets/a.jpg'),
    price: 30, // Example price
  },
  {
    id: 2,
    title: 'B',
    description: 'Description for piece B',
    imageUrl: require('../assets/b.jpg'),
    price: 20, // Example price
  },
  {
    id: 3,
    title: 'C',
    description: 'Description for piece C',
    imageUrl: require('../assets/c.jpg'),
    price: 20
  },
  {
    id: 4,
    title: 'D',
    description: 'Description for piece D',
    imageUrl: require('../assets/d.jpg'),
    price: 15,
  },
  {
    id: 5,
    title: 'E',
    description: 'Description for piece E',
    imageUrl: require('../assets/e.jpg'),
    price: 50
  },
];

export function useGalleryImages() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate async fetch
    const timer = setTimeout(() => {
      setImages(mockImages);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return { images, loading };
}