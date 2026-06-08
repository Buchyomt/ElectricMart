import React from 'react';
import { Link } from 'react-router-dom';
import { useComparison } from '../../context/ComparisonContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { 
  ChevronRight, 
  Trash2, 
  ShoppingCart, 
  ArrowLeft,
  Check,
  Zap,
  ShieldCheck,
  Star
} from 'lucide-react';
import './Compare.css';

const Compare = () => {
  const { comparisonItems, removeFromCompare, clearComparison } = useComparison();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  if (comparisonItems.length === 0) {
    return (
      <div className="compare-empty-state">
        <div className="container text-center py-20">
          <div className="empty-icon-circle"><ArrowLeft size={32} /></div>
          <h2>No products to compare</h2>
          <p>Go back to the shop and select up to 4 items to compare side-by-side.</p>
          <Link to="/shop" className="btn btn-primary mt-6">Return to Shop</Link>
        </div>
      </div>
    );
  }

  const features = [
    { label: 'Brand', key: 'brand' },
    { label: 'Category', key: 'category' },
    { label: 'Price', key: 'price', format: (v) => `₦${v.toLocaleString()}` },
    { label: 'Specifications', key: 'spec' },
    { label: 'Rating', key: 'rating', icon: <Star size={14} fill="var(--color-star)" color="var(--color-star)" /> },
    { label: 'Delivery', key: 'deliveryTime' },
  ];

  return (
    <div className="compare-page animate-fade-in">
      <div className="breadcrumb-container">
        <div className="container breadcrumb">
          <Link to="/">Home</Link> <ChevronRight size={14} /> 
          <Link to="/shop">Shop</Link> <ChevronRight size={14} /> 
          <span className="active">Compare Products</span>
        </div>
      </div>

      <div className="container">
        <div className="compare-header-row">
          <div>
            <h1>Technical Comparison</h1>
            <p>Evaluating {comparisonItems.length} professional grade electrical items</p>
          </div>
          <button className="clear-all-text" onClick={clearComparison}>
            <Trash2 size={16} /> Clear Comparison
          </button>
        </div>

        <div className="compare-table-wrapper">
          <div className="compare-table">
            {/* Header / Product Images */}
            <div className="compare-row header-row">
              <div className="feature-label">Product</div>
              {comparisonItems.map(item => (
                <div key={item._id || item.id} className="item-column product-header">
                  <button className="remove-item-top" onClick={() => removeFromCompare(item._id || item.id)}><X size={14}/></button>
                  <img src={`/${item.image}`} alt={item.name} />
                  <h3>{item.name}</h3>
                  <button 
                    className="btn btn-primary btn-sm btn-add-compare"
                    onClick={() => {
                      addToCart(item, 1);
                      showToast(`${item.name} added to cart`, 'cart');
                    }}
                  >
                    <ShoppingCart size={14} /> Add to Cart
                  </button>
                </div>
              ))}
              {/* Fill empty columns if less than 4 */}
              {Array.from({ length: 4 - comparisonItems.length }).map((_, i) => (
                <div key={`empty-h-${i}`} className="item-column empty"></div>
              ))}
            </div>

            {/* Features Rows */}
            {features.map((feature, idx) => (
              <div key={idx} className="compare-row">
                <div className="feature-label">
                  {feature.icon && <span style={{marginRight: '8px'}}>{feature.icon}</span>}
                  {feature.label}
                </div>
                {comparisonItems.map(item => (
                  <div key={item._id || item.id} className="item-column">
                    <span className="feature-value">
                      {feature.format ? feature.format(item[feature.key]) : item[feature.key]}
                    </span>
                  </div>
                ))}
                {Array.from({ length: 4 - comparisonItems.length }).map((_, i) => (
                  <div key={`empty-f-${idx}-${i}`} className="item-column empty"></div>
                ))}
              </div>
            ))}

            {/* Bottom Actions */}
            <div className="compare-row actions-row">
              <div className="feature-label">Actions</div>
              {comparisonItems.map(item => (
                <div key={item._id || item.id} className="item-column">
                  <Link to={`/product/${item._id || item.id}`} className="view-details-link">
                    View Full Details <ChevronRight size={14} />
                  </Link>
                </div>
              ))}
              {/* Fill empty columns if less than 4 */}
              {Array.from({ length: 4 - comparisonItems.length }).map((_, i) => (
                <div key={`empty-a-${i}`} className="item-column empty"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Footnote */}
        <div className="compare-footer-notice">
          <div className="notice-item">
            <ShieldCheck size={20} />
            <p>All items compared are verified genuine and sourced from authorized Lagos distributors.</p>
          </div>
          <div className="notice-item">
            <Zap size={20} />
            <p>Direct support available for bulk project quantities on all compared items.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal smaller X icon for the remove button
const X = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default Compare;
