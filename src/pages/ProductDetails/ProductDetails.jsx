import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Star, CheckCircle, ShieldCheck, ShoppingCart, ListPlus, Share2, Heart, Truck, ClipboardList, MessageCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useProject } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';
import inventoryData from '../../data/inventory.json';
import { motion } from 'framer-motion';
import './ProductDetails.css';

const fadeIn = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('specs');
  const [quantity, setQuantity] = useState(1);

  const navigate = useNavigate();
  const cartContext = useCart();
  const wishlistContext = useWishlist();
  const { addToProject } = useProject();
  const { showToast } = useToast();

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          if (data && (data._id || data.id)) {
            setProduct(data);
            setLoading(false);
            return;
          }
        }

        const localMatch = inventoryData.find(p => 
          p.id?.toString() === id?.toString() || 
          p._id?.toString() === id?.toString()
        );

        if (localMatch) {
          setProduct(localMatch);
        } else {
          setError('Product not found in our catalog.');
        }
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
      setQuantity(1);
    }
  }, [id]);

  const handleAddToProject = () => {
    addToProject(product, quantity);
    navigate('/quote');
  };

  if (loading) return (
    <div className="container py-20 text-center">
      <div className="loading-spinner"></div>
      <p>Loading product details...</p>
    </div>
  );

  if (error || !product) return (
    <div className="container py-20 text-center">
      <h2>Product Not Found</h2>
      <p>{error || 'The product you are looking for does not exist.'}</p>
      <Link to="/shop" className="btn btn-primary mt-4">Return to Shop</Link>
    </div>
  );

  const getImageUrl = (img) => {
    if (!img) return '/placeholder-product.png';
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    return `/${img}`;
  };
  const isSaved = wishlistContext?.isInWishlist ? wishlistContext.isInWishlist(id) : false;

  return (
    <div className="product-details-page">
      <motion.div 
        className="breadcrumb-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="container breadcrumb">
          <Link to="/">Home</Link> <ChevronRight size={14} /> 
          <Link to="/shop">{product.category}</Link> <ChevronRight size={14} /> 
          <span className="active">{product.name}</span>
        </div>
      </motion.div>

      <div className="container pd-main-layout">
        <motion.div 
          className="pd-gallery"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="pd-main-image image-container-premium"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img 
              src={getImageUrl(product.image)} 
              alt={product.name} 
              onLoad={(e) => e.target.classList.add('loaded')}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/600?text=No+Image'; e.target.classList.add('loaded'); }}
            />
          </motion.div>
        </motion.div>

        <motion.div 
          className="pd-info"
          initial="initial"
          animate="animate"
          variants={{
            animate: { transition: { staggerChildren: 0.1 } }
          }}
        >
          <motion.div className="pd-brand-tag" variants={fadeIn}>{product.brand?.toUpperCase()}</motion.div>
          <motion.h1 className="pd-title" variants={fadeIn}>{product.name}</motion.h1>
          
          <motion.div className="pd-meta" variants={fadeIn}>
            <div className="pd-rating">
              <Star size={16} fill="var(--color-star)" color="var(--color-star)" />
              <strong>{product.rating}</strong> <span>({product.reviews} reviews)</span>
            </div>
            <span className="pd-meta-divider">•</span>
            <span className="pd-sku">SKU: {product.brand?.toUpperCase()}-{product.id || '001'}</span>
          </motion.div>

          <motion.div className="pd-badges" variants={fadeIn}>
            <span className="badge badge-blue"><CheckCircle size={14} /> Verified Genuine</span>
            <span className="badge badge-outline"><ShieldCheck size={14} /> 1 Year Warranty</span>
            <span className="badge badge-gray"><Truck size={14} /> Express Delivery</span>
          </motion.div>

          {/* New: Bulk Pricing Table */}
          {product.isBulkPricing && product.bulkPricing && product.bulkPricing.length > 0 && (
            <motion.div className="pd-bulk-table-container" variants={fadeIn}>
              <h4><ClipboardList size={16} /> Bulk Discount Tiers</h4>
              <div className="bulk-table">
                <div className="bulk-header">
                  <span>Quantity</span>
                  <span>Price Per Unit</span>
                  <span>Save</span>
                </div>
                {product.bulkPricing.map((tier, idx) => {
                  const savings = ((product.price - tier.discountedPrice) / product.price * 100).toFixed(0);
                  return (
                    <div key={idx} className={`bulk-row ${quantity >= tier.minQty ? 'active' : ''}`}>
                      <span>{tier.minQty}+ rolls</span>
                      <span>₦{tier.discountedPrice.toLocaleString()}</span>
                      <span className="savings-tag">-{savings}%</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          <motion.div className="pd-pricing-box" variants={fadeIn}>
            <div className="pd-calculator">
              <div className="pd-qty-control">
                <label>Quantity</label>
                <div className="qty-input-group">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>
              <div className="pd-subtotal">
                <label>Effective Total</label>
                {(() => {
                  let currentPrice = product.price;
                  if (product.isBulkPricing && product.bulkPricing) {
                    const applicableTier = [...product.bulkPricing]
                      .sort((a, b) => b.minQty - a.minQty)
                      .find(t => quantity >= t.minQty);
                    if (applicableTier) currentPrice = applicableTier.discountedPrice;
                  }
                  
                  return (
                    <>
                      <div className="subtotal-amount">
                        {product.price > 0 ? (
                          `₦${(currentPrice * quantity).toLocaleString()}`
                        ) : (
                          "Price on Request"
                        )}
                      </div>
                      {currentPrice < product.price && currentPrice > 0 && (
                        <div className="bulk-applied-tag">Bulk Discount Applied!</div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="pd-actions">
              {product.price > 0 ? (
                <button 
                  className="btn btn-primary btn-add-to-cart"
                  onClick={() => {
                    cartContext?.addToCart(product, quantity);
                    showToast(`${product.name} added to cart!`, 'cart');
                  }}
                >
                  <ShoppingCart size={18} /> Add to Cart
                </button>
              ) : (
                <button 
                  className="btn btn-primary btn-request-quote"
                  onClick={() => window.open(`https://wa.me/234800ELECTRO?text=I'm interested in the ${product.name}`, '_blank')}
                >
                  <MessageCircle size={18} /> Request Quote
                </button>
              )}
              <button 
                className="btn btn-outline btn-project"
                onClick={handleAddToProject}
              >
                <ClipboardList size={18} /> Bulk Order Quote
              </button>
              <motion.button 
                className={`btn btn-icon-only ${isSaved ? 'active' : ''}`}
                onClick={() => wishlistContext?.toggleWishlist(product._id || product.id)}
                whileTap={{ scale: 0.8 }}
              >
                <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="container pd-tabs-container">
        <div className="pd-tabs-nav">
          <button className={`pd-tab-btn ${activeTab === 'specs' ? 'active' : ''}`} onClick={() => setActiveTab('specs')}>Specifications</button>
          <button className={`pd-tab-btn ${activeTab === 'desc' ? 'active' : ''}`} onClick={() => setActiveTab('desc')}>Description</button>
        </div>
        <div className="pd-tab-content">
          {activeTab === 'specs' ? (
            <table className="specs-table">
              <tbody>
                <tr><td>Category</td><th>{product.category}</th></tr>
                <tr><td>Brand</td><th>{product.brand}</th></tr>
                <tr><td>Condition</td><th>New / Genuine</th></tr>
                <tr><td>Availability</td><th>In Stock (Lagos)</th></tr>
              </tbody>
            </table>
          ) : (
            <p>{product.description || 'Professional grade electrical equipment sourced directly from authorized distributors. Guaranteed genuine.'}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
