import React, { useState, useEffect, useRef } from 'react';
import { useGalleryImages } from '../hooks/UseGalleryImages';

const PhotoCarousel: React.FC = () => {
    const { images, loading } = useGalleryImages();
    const [index, setIndex] = useState(0);
    const [playing, setPlaying] = useState(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (playing && images.length > 0) {
            intervalRef.current = setInterval(() => {
                setIndex(i => (i === images.length - 1 ? 0 : i + 1));
            }, 2500);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [playing, images.length]);

    if (loading) return <div>Loading carousel...</div>;
    if (images.length === 0) return <div>No images available for carousel.</div>;

    const prev = () => setIndex(i => (i === 0 ? images.length - 1 : i - 1));
    const next = () => setIndex(i => (i === images.length - 1 ? 0 : i + 1));
    const togglePlaying = () => {
        if (!playing) setIndex(0);
        setPlaying(p => !p);
    };

    return (
        <div className="carousel">
            <div>
                <button onClick={prev}>&lt;</button>
                <img
                    src={images[index].imageUrl}
                    alt={images[index].title}
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