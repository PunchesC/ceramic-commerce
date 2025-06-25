import React, { useState, useEffect, useRef } from 'react';
import { useGalleryImages } from '../hooks/UseGalleryImages';
import { useCloudinaryImages } from '../hooks/UseCloudinaryImages';

const PhotoCarousel: React.FC = () => {
    const { images, loading: productsLoading } = useGalleryImages();
    const [productIndex, setProductIndex] = useState(0);
    const [cloudinaryImageIndex, setCloudinaryImageIndex] = useState(0);
    const [playing, setPlaying] = useState(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch Cloudinary images for the current product
    const currentProductId = images.length > 0 ? images[productIndex].id : null;
    const { imageUrls, loading: imagesLoading } = useCloudinaryImages(currentProductId);

    // Reset image index when product or images change
    useEffect(() => {
        setCloudinaryImageIndex(0);
    }, [currentProductId, imageUrls.length]);

    // Carousel auto-play logic
    useEffect(() => {
        if (playing && images.length > 0 && imageUrls.length > 0) {
            intervalRef.current = setInterval(() => {
                setCloudinaryImageIndex(idx => {
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
    }, [playing, images.length, imageUrls.length]);

    if (productsLoading) return <div>Loading carousel...</div>;
    if (images.length === 0) return <div>No images available for carousel.</div>;

    // Previous: go to previous image or previous product
    const prev = () => {
        if (imageUrls.length > 0) {
            setCloudinaryImageIndex(idx => {
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
            setCloudinaryImageIndex(idx => {
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

    // Use the current Cloudinary image, or a placeholder
    const currentImageUrl =
        !imagesLoading && imageUrls.length > 0
            ? imageUrls[cloudinaryImageIndex]
            : null; // null means show spinner

    return (
        <div className="carousel">
            <div>
                <button onClick={prev}>&lt;</button>
                {imagesLoading ? (
                    <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span>Loading...</span>
                    </div>
                ) : currentImageUrl ? (
                    <img
                        src={currentImageUrl}
                        alt={images[productIndex].title}
                        className="carousel-image"
                    />
                ) : (
                    <img
                        src="/placeholder.jpg"
                        alt="No image"
                        className="carousel-image"
                    />
                )}
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