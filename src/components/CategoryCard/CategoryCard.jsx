import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CategoryCard.css';

const CategoryCard = ({ icon, title, query }) => {
  const navigate = useNavigate();
  return (
    <div className="category-card" onClick={() => navigate(`/shop?category=${encodeURIComponent(query || title)}`)}>
      <span className="category-icon">{icon}</span>
      <span className="category-title">{title}</span>
    </div>
  );
};

export default CategoryCard;
