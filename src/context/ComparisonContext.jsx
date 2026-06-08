import React, { createContext, useContext, useState, useCallback } from 'react';

const ComparisonContext = createContext(null);

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) throw new Error('useComparison must be used within a ComparisonProvider');
  return context;
};

export const ComparisonProvider = ({ children }) => {
  const [comparisonItems, setComparisonItems] = useState([]);

  const addToCompare = useCallback((product) => {
    setComparisonItems((prev) => {
      // Prevent duplicates
      if (prev.find(item => (item._id || item.id) === (product._id || product.id))) {
        return prev;
      }
      // Limit to 4 items for layout sanity
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, product];
    });
  }, []);

  const removeFromCompare = useCallback((productId) => {
    setComparisonItems((prev) => prev.filter(item => (item._id || item.id) !== productId));
  }, []);

  const clearComparison = useCallback(() => {
    setComparisonItems([]);
  }, []);

  const isInComparison = useCallback((productId) => {
    return comparisonItems.some(item => (item._id || item.id) === productId);
  }, [comparisonItems]);

  return (
    <ComparisonContext.Provider value={{ 
      comparisonItems, 
      addToCompare, 
      removeFromCompare, 
      clearComparison,
      isInComparison 
    }}>
      {children}
    </ComparisonContext.Provider>
  );
};
