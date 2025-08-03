import React from 'react';
import { useParams, Link } from 'react-router-dom';

// Dummy product data for demonstration
const products = [
  { id: '1', title: 'Vase', price: 49.99, description: 'A beautiful ceramic vase.' },
  { id: '2', title: 'Bowl', price: 29.99, description: 'A handmade bowl.' },
  { id: '3', title: 'Plate', price: 19.99, description: 'A decorative plate.' },
];

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const product = products.find(p => p.id === id);

  if (!product) {
    return <div>Product not found. <Link to="/products">Back to Products</Link></div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>{product.title}</h1>
      <p><strong>Price:</strong> ${product.price.toFixed(2)}</p>
      <p>{product.description}</p>
      <Link to="/products">Back to Products</Link>
    </div>
  );
};

export default ProductDetails;
