import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ProductCard.css';
import { ShoppingCart, Heart, Truck, ClipboardList, ArrowLeftRight, MessageCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useProject } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';
import { useComparison } from '../../context/ComparisonContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToProject } = useProject();
  const { showToast } = useToast();
  const { addToCompare, removeFromCompare, isInComparison, comparisonItems } = useComparison();

  const isSaved = isInWishlist(product._id || product.id);
  const isComparing = isInComparison(product._id || product.id);
  const navigate = useNavigate();

  const handleCompareToggle = (e) => {
    e.preventDefault();
    if (isComparing) {
      removeFromCompare(product._id || product.id);
    } else {
      if (comparisonItems.length >= 4) {
        showToast("You can only compare up to 4 items", "warning");
        return;
      }
      addToCompare(product);
      showToast(`${product.name} added to comparison`, "info");
    }
  };

  const handleAddToProject = (e) => {
    e.preventDefault();
    addToProject(product, 1);
    navigate('/quote');
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        {product.isBulkPricing && <span className="tag-bulk">BULK PRICING</span>}
        {product.stockQuantity === 0 && <span className="tag-oos">OUT OF STOCK</span>}
        <div className="card-actions-overlay">
          <button 
            className={`wishlist-btn ${isSaved ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product._id || product.id);
            }}
            title="Add to Wishlist"
          >
            <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
          </button>
          <button 
            className={`project-btn ${isComparing ? 'active' : ''}`}
            onClick={handleCompareToggle}
            title="Add to Comparison"
            style={isComparing ? { backgroundColor: 'var(--color-primary)', color: 'white' } : {}}
          >
            <ArrowLeftRight size={18} />
          </button>
          <button 
            className="project-btn"
            onClick={handleAddToProject}
            title="Add to Project Quote"
          >
            <ClipboardList size={18} />
          </button>
        </div>
        <Link to={`/product/${product._id || product.id}`} className="product-image-link">
          <img 
            src={product.image && (product.image.startsWith('http://') || product.image.startsWith('https://')) ? product.image : `/${product.image}`} 
            alt={product.name} 
            className="product-image" 
            onLoad={(e) => e.target.classList.add('loaded')}
            onError={(e) => { e.target.src = '/placeholder-product.png'; e.target.classList.add('loaded'); }}
          />
        </Link>
      </div>
      
      <div className="product-details">
        <Link to={`/product/${product._id || product.id}`} className="product-info-link">
          <span className="product-brand">{product.brand}</span>
          <h3 className="product-name">{product.name}</h3>
          {product.spec && <p className="product-spec">{product.spec}</p>}
        </Link>
        
        <div className="product-rating">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`star ${i < Math.floor(product.rating) ? 'filled' : ''}`}>★</span>
          ))}
          <span className="reviews">({product.reviews})</span>
        </div>
        
        {product.deliveryTime && (
          <div className="product-delivery">
            <Truck size={14} className="delivery-icon" />
            <span>{product.deliveryTime}</span>
          </div>
        )}
        
        <div className="product-price">
          {product.price > 0 ? `₦${product.price.toLocaleString()}` : 'Price on Request'}
        </div>
        
        <div className="product-card-footer">
          {product.price > 0 ? (
            product.stockQuantity === 0 ? (
              <button className="btn btn-primary add-to-cart-btn" disabled style={{opacity: 0.5, cursor: 'not-allowed'}}>
                Out of Stock
              </button>
            ) : (
              <button 
                className="btn btn-primary add-to-cart-btn"
                onClick={() => {
                  addToCart(product, 1);
                  showToast(`${product.name} added to cart!`, 'cart');
                }}
              >
                <ShoppingCart size={16} style={{ marginRight: '8px' }} />
                Add to Cart
              </button>
            )
          ) : (
            <button 
              className="btn btn-primary request-quote-btn"
              onClick={(e) => {
                e.preventDefault();
                window.open(`https://wa.me/234800ELECTRIC?text=I'm interested in the ${product.name}`, '_blank');
              }}
            >
              <MessageCircle size={16} style={{ marginRight: '8px' }} />
              Request Quote
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
