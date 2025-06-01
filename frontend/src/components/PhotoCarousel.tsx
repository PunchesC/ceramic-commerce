import React, { useState, useEffect, useRef } from 'react';

const images = [
    require('../assets/a.jpg'),
    require('../assets/b.jpg'),
    require('../assets/c.jpg'),
    require('../assets/d.jpg'),
    require('../assets/e.jpg'),
];

const PhotoCarousel: React.FC = () => {
    const [index, setIndex] = useState(0);
    const [playing, setPlaying] = useState(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const prev = () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
    const next = () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

    useEffect(() => {
        if (playing) {
            intervalRef.current = setInterval(() => {
                setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
            }, 2500);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [playing]);

    const togglePlaying = () => {
        if (!playing) setIndex(0);
        setPlaying((p) => !p);
    };

    return (
        <div className="carousel">
            <div>
                <button onClick={prev}>&lt;</button>
                <img
                    src={images[index]}
                    alt={`Ceramic piece ${index + 1}`}
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