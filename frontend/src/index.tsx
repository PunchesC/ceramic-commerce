import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { CloudinaryImageCacheProvider } from './contexts/CloudinaryImageCacheContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <CloudinaryImageCacheProvider>
          <App />
        </CloudinaryImageCacheProvider>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();