import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { ProjectProvider } from './context/ProjectContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { ComparisonProvider } from './context/ComparisonContext.jsx';

// Import Global CSS System
import './assets/css/variables.css';
import './assets/css/reset.css';
import './assets/css/typography.css';
import './assets/css/main.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ProjectProvider>
            <ToastProvider>
              <ComparisonProvider>
                <App />
              </ComparisonProvider>
            </ToastProvider>
          </ProjectProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>,
);
