import { useState, useEffect } from 'react';
import { GalleryImage } from '../models/GalleryImage';

const mockImages: GalleryImage[] = [
  {
    id: 1,
    title: 'Ceramic Piece A',
    description: 'Description for piece A',
    imageUrl: require('../assets/a.jpg'),
  },
  {
    id: 2,
    title: 'Ceramic Piece B',
    description: 'Description for piece B',
    imageUrl: require('../assets/b.jpg'),
  },
  {
    id: 3,
    title: 'Ceramic Piece C',
    description: 'Description for piece C',
    imageUrl: require('../assets/c.jpg'),
  },
  {
    id: 4,
    title: 'Ceramic Piece D',
    description: 'Description for piece D',
    imageUrl: require('../assets/d.jpg'),
  },
  {
    id: 5,
    title: 'Ceramic Piece E',
    description: 'Description for piece E',
    imageUrl: require('../assets/e.jpg'),
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