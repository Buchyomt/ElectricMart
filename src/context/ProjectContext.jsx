import React, { createContext, useContext, useState, useEffect } from 'react';

const ProjectContext = createContext();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within a ProjectProvider');
  return context;
};

export const ProjectProvider = ({ children }) => {
  const [projectItems, setProjectItems] = useState([]);
  const [projectDetails, setProjectDetails] = useState({
    name: 'New Site Project',
    location: 'Island — Lekki / VI / Ikoyi',
    notes: ''
  });

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('project_quote_items');
    if (saved) {
      try {
        setProjectItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load project items', e);
      }
    }
  }, []);

  // Save to local storage whenever items change
  useEffect(() => {
    localStorage.setItem('project_quote_items', JSON.stringify(projectItems));
  }, [projectItems]);

  const saveProjectToBackend = async (userId) => {
    if (!userId) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: projectDetails.name,
          location: projectDetails.location,
          items: projectItems
        })
      });
      if (res.ok) {
        console.log("Project saved to cloud");
        return await res.json();
      }
    } catch (err) {
      console.error("Cloud save failed", err);
    }
  };

  const addToProject = (product, quantity = 1) => {
    setProjectItems(prev => {
      const existing = prev.find(item => (item._id || item.id) === (product._id || product.id));
      if (existing) {
        return prev.map(item => 
          (item._id || item.id) === (product._id || product.id) 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromProject = (id) => {
    setProjectItems(prev => prev.filter(item => (item._id || item.id) !== id));
  };

  const updateProjectQty = (id, quantity) => {
    setProjectItems(prev => prev.map(item => 
      (item._id || item.id) === id ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  };

  const clearProject = () => setProjectItems([]);

  const value = {
    projectItems,
    projectDetails,
    setProjectDetails,
    addToProject,
    removeFromProject,
    updateProjectQty,
    clearProject,
    saveProjectToBackend,
    itemCount: projectItems.length,
    subtotal: projectItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};
