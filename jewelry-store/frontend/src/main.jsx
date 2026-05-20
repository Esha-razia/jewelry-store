import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ChatProvider } from './context/ChatContext';
import axios from 'axios';

// Set base URL for all API requests to the live server
// If VITE_API_URL is set (e.g. on Vercel), it will use that, otherwise it defaults to local relative path
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

// Auto-logout on 401: if the backend rejects a stale/invalid token,
// clear localStorage and redirect to login so the user can get a fresh token.
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        localStorage.removeItem('userInfo');
        // Redirect to login page
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ChatProvider>
            <App />
          </ChatProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>,
);
