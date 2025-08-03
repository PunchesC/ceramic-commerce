import React from 'react';
import { Link } from 'react-router-dom';

// Dummy product data for demonstration
const products = [
  { id: '1', title: 'Vase', price: 49.99 },
  { id: '2', title: 'Bowl', price: 29.99 },
  { id: '3', title: 'Plate', price: 19.99 },
];

const ProductList: React.FC = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Product List</h1>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            <Link to={`/products/${product.id}`}>{product.title}</Link> - ${product.price.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;
