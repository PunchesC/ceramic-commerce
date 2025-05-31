import React, { useState } from 'react';

const images = [
  require('../assets/a.jpg'),
  require('../assets/b.jpg'),
  require('../assets/c.jpg'),
  require('../assets/d.jpg'),
  require('../assets/e.jpg'),
];

const PhotoCarousel: React.FC = () => {
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="carousel">
      <button onClick={prev}>&lt;</button>
      <img src={images[index]} alt={`Ceramic piece ${index + 1}`} style={{ width: 300, height: 300, objectFit: 'cover' }} />
      <button onClick={next}>&gt;</button>
    </div>
  );
};

export default PhotoCarousel;