import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronRight, Grid, List, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Shop.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState(500000); // Default to max
  const [selectedVoltages, setSelectedVoltages] = useState([]);
  const [selectedZones, setSelectedZones] = useState(['Island', 'Mainland']); // Default standard

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const location = useLocation();

  // Handle URL Query Params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const brandParam = params.get('brand');
    const searchParam = params.get('search');

    if (categoryParam) setSelectedCategories([categoryParam]);
    if (brandParam) setSelectedBrands([brandParam]);
    if (searchParam) setSearchQuery(searchParam);
  }, [location.search]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/products`);
        if (!response.ok) throw new Error('Server error');
        const data = await response.json();
        
        setProducts(data);
      } catch (err) {
        console.warn('Backend unavailable, using local data:', err.message);
        setProducts(inventoryData);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Dynamically derive categories and brands from fetched data
  const categories = [...new Set(products.map(p => p.category))].sort();
  const brands = [...new Set(products.map(p => p.brand))].sort();

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const handleBrandChange = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleVoltageChange = (voltage) => {
    setSelectedVoltages(prev => 
      prev.includes(voltage) ? prev.filter(v => v !== voltage) : [...prev, voltage]
    );
  };

  const handleZoneChange = (zone) => {
    setSelectedZones(prev => 
      prev.includes(zone) ? prev.filter(z => z !== zone) : [...prev, zone]
    );
  };

  const applyFilters = () => {
    let result = [...products];
    
    // Category Filter
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }
    
    // Brand Filter
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand));
    }

    // Price Filter — always show price=0 (Price on Request) items
    result = result.filter(p => p.price === 0 || p.price <= priceRange);

    // Voltage Filter (Matching spec or name)
    if (selectedVoltages.length > 0) {
      result = result.filter(p => {
        const productInfo = `${p.name} ${p.spec}`.toLowerCase();
        return selectedVoltages.some(v => productInfo.includes(v.toLowerCase()));
      });
    }

    // Search Query
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort logic
    if (sortBy === 'low-high') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'high-low') {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(result);
    setCurrentPage(1); 
  };

  // Reset filters
  useEffect(() => {
    applyFilters();
  }, [selectedCategories, selectedBrands, searchQuery, sortBy, products]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };
  
  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  return (
    <div className="shop-page">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-container">
        <div className="container breadcrumb">
          <span>Home</span> <ChevronRight size={14} /> <span className="active">Shop</span>
        </div>
      </div>

      <div className="container shop-layout">
        {/* Sidebar Filters */}
        <aside className="shop-sidebar">
          <div className="sidebar-header">
            <SlidersHorizontal size={18} />
            <h3>Filters</h3>
            {(selectedCategories.length > 0 || selectedBrands.length > 0 || selectedVoltages.length > 0 || priceRange < 500000) && (
              <button className="clear-filters-btn" onClick={() => { 
                setSelectedCategories([]); 
                setSelectedBrands([]); 
                setSelectedVoltages([]);
                setPriceRange(500000);
                setSelectedZones(['Island', 'Mainland']);
              }}>Clear All</button>
            )}
          </div>
          <p className="sidebar-subtitle">Refine your search</p>

          <div className="filter-section">
            <h4>Category</h4>
            <div className="filter-options">
              {categories.map((cat, idx) => (
                <label key={idx} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={selectedCategories.includes(cat)}
                    onChange={() => handleCategoryChange(cat)}
                  />
                  <span className="checkbox-custom"></span>
                  {cat}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4>Brand</h4>
            <div className="filter-options">
              {brands.map((brand, idx) => (
                <label key={idx} className="checkbox-label">
                  <input 
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                  />
                  <span className="checkbox-custom"></span>
                  {brand}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4>Voltage Rating</h4>
            <div className="filter-options">
              {['300/500V', '450/750V', '0.6/1kV', '12V', '220V'].map(v => (
                <label key={v} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={selectedVoltages.includes(v)}
                    onChange={() => handleVoltageChange(v)}
                  />
                  <span className="checkbox-custom"></span>
                  {v}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4>Price Range</h4>
            <div className="price-slider-container">
              <input 
                type="range" 
                min="0" 
                max="500000" 
                step="5000"
                value={priceRange} 
                onChange={(e) => setPriceRange(parseInt(e.target.value))}
                className="price-range-input"
              />
              <div className="price-labels">
                <span>₦0</span>
                <span className="active-price">₦{priceRange.toLocaleString()}</span>
                <span>₦500k+</span>
              </div>
            </div>
          </div>

          <div className="filter-section">
            <h4>Lagos Delivery Zone</h4>
            <div className="filter-options">
              {['Island', 'Mainland', 'Outskirts'].map(z => (
                <label key={z} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={selectedZones.includes(z)}
                    onChange={() => handleZoneChange(z)}
                  />
                  <span className="checkbox-custom"></span>
                  {z}
                </label>
              ))}
            </div>
          </div>

          <button className="btn btn-primary apply-btn" onClick={applyFilters}>
            <SlidersHorizontal size={16} style={{marginRight: '8px'}} /> Apply Filters
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="shop-main">
          <div className="shop-header">
            <div>
              <h1 className="shop-title">Pro Equipment Store</h1>
              <p className="shop-results"><span className="text-primary">{filteredProducts.length} Products</span> Found</p>
            </div>
            
            <div className="shop-controls">
              <div className="sort-dropdown">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="popular">↑↓ Sort by: Most Popular</option>
                  <option value="low-high">Price: Low to High</option>
                  <option value="high-low">Price: High to Low</option>
                </select>
              </div>
              
              <div className="view-toggles">
                <button className="view-btn active"><Grid size={18} /></button>
                <button className="view-btn"><List size={18} /></button>
              </div>
            </div>
          </div>

          <motion.div 
            className="shop-grid"
          >
            {loading ? (
              <p style={{ color: 'var(--text-secondary)', padding: '2rem' }}>Loading products...</p>
            ) : (
              <AnimatePresence mode='wait'>
                {currentProducts.map((product, index) => (
                  <motion.div
                    key={product._id || product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing <strong>{startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProducts.length)}</strong> of <strong>{filteredProducts.length}</strong> products
              </div>
              
              <div className="pagination-controls">
                <button 
                  className="page-btn text-btn" 
                  onClick={handlePrev} 
                  disabled={currentPage === 1}
                  style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  {'<'} Previous
                </button>
                
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const page = idx + 1;
                  // Simple pagination: show first, last, current, and adjacent
                  if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <button 
                        key={page}
                        className={`page-btn ${currentPage === page ? 'active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    );
                  }
                  
                  // Show dots
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="page-dots">...</span>;
                  }
                  
                  return null;
                })}
                
                <button 
                  className="page-btn text-btn" 
                  onClick={handleNext} 
                  disabled={currentPage === totalPages}
                  style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                >
                  Next {'>'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;
