import React, { useState, useEffect, useRef } from 'react';
import { useGalleryImages } from '../hooks/UseGalleryImages';

const PhotoCarousel: React.FC = () => {
    const { images, loading: productsLoading } = useGalleryImages();
    const [productIndex, setProductIndex] = useState(0);
    const [imageIndex, setImageIndex] = useState(0);
    const [playing, setPlaying] = useState(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const currentProduct = images[productIndex];
    const imageUrls = currentProduct?.imageUrls || [];

    // Reset image index when product changes
    useEffect(() => {
        setImageIndex(0);
    }, [productIndex, images]);

    // Carousel auto-play logic
useEffect(() => {
    if (
        playing &&
        images.length > 0 &&
        imageUrls.length > 0
    ) {
        intervalRef.current = setInterval(() => {
            setImageIndex(idx => {
                if (idx < imageUrls.length - 1) {
                    return idx + 1;
                } else {
                    setProductIndex(i => (i === images.length - 1 ? 0 : i + 1));
                    return 0;
                }
            });
        }, 2500);
    } else if (intervalRef.current) {
        clearInterval(intervalRef.current);
    }
    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };
}, [playing, images, productIndex, imageUrls.length]);

    if (productsLoading) return <div>Loading carousel...</div>;
    if (images.length === 0) return <div>No images available for carousel.</div>;

    // const currentProduct = images[productIndex];
    // const imageUrls = currentProduct.imageUrls || [];

    // Previous: go to previous image or previous product
    const prev = () => {
        if (imageUrls.length > 0) {
            setImageIndex(idx => {
                if (idx === 0) {
                    setProductIndex(i => (i === 0 ? images.length - 1 : i - 1));
                    return 0;
                } else {
                    return idx - 1;
                }
            });
        }
    };

    // Next: go to next image or next product
    const next = () => {
        if (imageUrls.length > 0) {
            setImageIndex(idx => {
                if (idx === imageUrls.length - 1) {
                    setProductIndex(i => (i === images.length - 1 ? 0 : i + 1));
                    return 0;
                } else {
                    return idx + 1;
                }
            });
        }
    };

    const togglePlaying = () => {
        if (!playing) setProductIndex(0);
        setPlaying(p => !p);
    };

    // Use the current image, or a placeholder
    const currentImageUrl =
        imageUrls.length > 0
            ? imageUrls[imageIndex]
            : "/placeholder.jpg";

    return (
        <div className="carousel">
            <div>
                <button onClick={prev}>&lt;</button>
                <img
                    src={currentImageUrl}
                    alt={currentProduct.title || 'Product photo'}
                    className="carousel-image"
                />
                <button onClick={next}>&gt;</button>
            </div>
            <div>
                <button onClick={togglePlaying} style={{ marginLeft: '1rem' }}>
                    {playing ? '⏸️ Pause' : '▶️ Play'}
                </button>
            </div>
        </div>
    );
};

export default PhotoCarousel;