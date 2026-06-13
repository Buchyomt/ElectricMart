import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const CART_STORAGE_KEY = 'electricmart_cart';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token, isAuthenticated } = useAuth();

  // Load cart from backend (if auth) or localStorage (if guest)
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      if (isAuthenticated && token) {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            // Backend returns { items: [{ productId: {...}, quantity: 1 }] }
            const normalizedItems = data.items.map(item => ({
              ...(item.productId || {}),
              quantity: item.quantity,
              dbId: item._id // Item ID in the cart array
            }));
            setCartItems(normalizedItems);
          }
        } catch (err) {
          console.error('Error loading cart from server:', err);
        }
      } else {
        // Guest mode - load from localStorage
        try {
          const saved = localStorage.getItem(CART_STORAGE_KEY);
          if (saved) {
            setCartItems(JSON.parse(saved));
          }
        } catch (err) {
          console.error('Error loading cart from local storage:', err);
        }
      }
      setLoading(false);
    };

    loadCart();
  }, [isAuthenticated, token]);

  // Save guest cart to localStorage whenever it changes
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  const addToCart = useCallback(async (product, quantity = 1) => {
    if (isAuthenticated && token) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/cart`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ productId: product._id || product.id, quantity })
        });
        if (res.ok) {
          const data = await res.json();
          const normalizedItems = data.items.map(item => ({
            ...(item.productId || {}),
            quantity: item.quantity,
            dbId: item._id
          }));
          setCartItems(normalizedItems);
        }
      } catch (err) {
        console.error('Error adding to server cart:', err);
      }
    } else {
      // Local state update for guests
      setCartItems(prev => {
        const existingIndex = prev.findIndex(item => 
          (item._id || item.id) === (product._id || product.id)
        );
        
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity
          };
          return updated;
        }
        return [...prev, { ...product, quantity }];
      });
    }
  }, [isAuthenticated, token]);

  const removeFromCart = useCallback(async (productId) => {
    if (isAuthenticated && token) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/cart/${productId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const normalizedItems = data.items.map(item => ({
            ...(item.productId || {}),
            quantity: item.quantity,
            dbId: item._id
          }));
          setCartItems(normalizedItems);
        }
      } catch (err) {
        console.error('Error removing from server cart:', err);
      }
    } else {
      setCartItems(prev => prev.filter(item => (item._id || item.id) !== productId));
    }
  }, [isAuthenticated, token]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    if (isAuthenticated && token) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/cart/${productId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ quantity })
        });
        if (res.ok) {
          const data = await res.json();
          const normalizedItems = data.items.map(item => ({
            ...(item.productId || {}),
            quantity: item.quantity,
            dbId: item._id
          }));
          setCartItems(normalizedItems);
        }
      } catch (err) {
        console.error('Error updating server cart quantity:', err);
      }
    } else {
      setCartItems(prev => prev.map(item => 
        (item._id || item.id) === productId ? { ...item, quantity } : item
      ));
    }
  }, [isAuthenticated, token, removeFromCart]);

  const clearCart = useCallback(async () => {
    if (isAuthenticated && token) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL || ''}/api/cart`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setCartItems([]);
      } catch (err) {
        console.error('Error clearing server cart:', err);
      }
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated, token]);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);

  const value = {
    cartItems,
    cartCount,
    cartTotal,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
