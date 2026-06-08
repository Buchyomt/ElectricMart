import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useComparison } from '../../context/ComparisonContext';
import { X, ArrowLeftRight, Trash2 } from 'lucide-react';
import './FloatingCompareBar.css';

const FloatingCompareBar = () => {
  const { comparisonItems, removeFromCompare, clearComparison } = useComparison();
  const navigate = useNavigate();

  if (comparisonItems.length === 0) return null;

  return (
    <div className="floating-compare-bar animate-slide-up">
      <div className="compare-container">
        <div className="compare-info">
          <div className="compare-icon-box">
            <ArrowLeftRight size={20} />
          </div>
          <div className="compare-text">
            <h4>Compare Products</h4>
            <p>{comparisonItems.length} of 4 items selected</p>
          </div>
        </div>

        <div className="compare-items-list">
          {comparisonItems.map((item) => (
            <div key={item._id || item.id} className="compare-item-pill">
              <img src={`/${item.image}`} alt={item.name} />
              <button 
                className="remove-item-pill"
                onClick={() => removeFromCompare(item._id || item.id)}
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {Array.from({ length: 4 - comparisonItems.length }).map((_, i) => (
            <div key={`empty-${i}`} className="compare-item-placeholder">
              <span>+</span>
            </div>
          ))}
        </div>

        <div className="compare-actions">
          <button className="btn-clear-compare" onClick={clearComparison}>
            <Trash2 size={16} />
          </button>
          <button 
            className="btn btn-primary btn-launch-compare"
            onClick={() => navigate('/compare')}
            disabled={comparisonItems.length < 2}
          >
            Compare Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingCompareBar;
