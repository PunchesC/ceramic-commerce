import React from 'react';

const About: React.FC = () => (
  <section className="about-section">
    <h2>About the Artist</h2>
    <p>
      Welcome! I am [Artist Name], a ceramic artist passionate about creating unique, handcrafted pieces that blend tradition and modern design. Each piece is made with care, inspired by nature and everyday life.
    </p>
    <p>
      My work explores texture, form, and color, aiming to bring beauty and function into your home. Thank you for visiting and supporting handmade art!
    </p>
    {/* You can add a portrait or studio photo here */}
    {/* <img src="/path/to/artist-photo.jpg" alt="Artist in studio" className="about-photo" /> */}
  </section>
);

export default About;