import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, MapPin, User, FileText, Package, HeadphonesIcon, Home, LogOut, LayoutDashboard, ChevronDown, Calculator, BookOpen, Shield, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Header.css';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Handle scroll for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 80;
      setScrolled((prev) => {
        if (prev !== isScrolled) return isScrolled;
        return prev;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Pulse effect when cart updates
  useEffect(() => {
    if (cartCount > 0) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      {/* Top Bar */}
      <div className="header-top">
        <div className="container header-top-content">
          <div className="top-item">
            <Package size={14} /> Lagos-Wide Delivery
          </div>
          <div className="top-divider">|</div>
          <div className="top-item">
            <span style={{ color: '#4ade80' }}>✓</span> Verified Genuine Products
          </div>
          <div className="top-divider">|</div>
          <div className="top-item">
            <HeadphonesIcon size={14} /> Call: +234 810 596 8503
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="header-main">
        <div className="container header-main-content">
          <Link to="/" className="brand">
            <span className="bolt">⚡</span>
            <h1>ElectricMart</h1>
          </Link>

          <form className="search-bar" onSubmit={(e) => {
            e.preventDefault();
            const query = e.target.search.value;
            if (query.trim()) {
              navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
            }
          }}>
            <Search className="search-icon" size={20} />
            <input
              type="text"
              name="search"
              placeholder="Search by product name, brand, or SKU..."
              className="search-input"
            />
            <button type="submit" className="btn btn-primary search-btn">Search</button>
          </form>

          <div className="header-actions">
            <div className="action-item location">
              <MapPin size={20} />
              <div className="action-text">
                <span className="action-label">Deliver to</span>
                <span className="action-value">Lagos, NG</span>
              </div>
            </div>

            <Link to="/checkout" className="action-item cart" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className={`cart-icon-wrapper ${pulse ? 'pulse' : ''}`}>
                <ShoppingCart size={24} />
                {cartCount > 0 && <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>}
              </div>
            </Link>

            {isAuthenticated ? (
              <div className="action-item auth user-menu" ref={dropdownRef}>
                <button
                  className="user-menu-trigger"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="user-avatar-sm" />
                  ) : (
                    <div className="user-initials-sm">{getInitials(user?.name)}</div>
                  )}
                  <div className="action-text">
                    <span className="action-label">Hello,</span>
                    <span className="action-value">{user?.name?.split(' ')[0] || 'User'}</span>
                  </div>
                  <ChevronDown size={14} className={`dropdown-chevron ${showDropdown ? 'open' : ''}`} />
                </button>

                {showDropdown && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-user-info">
                        {user?.avatar ? (
                          <img src={user.avatar} alt={user.name} className="dropdown-avatar" />
                        ) : (
                          <div className="dropdown-initials">{getInitials(user?.name)}</div>
                        )}
                        <div>
                          <div className="dropdown-name">{user?.name}</div>
                          <div className="dropdown-email">{user?.email}</div>
                        </div>
                      </div>
                    </div>
                    <div className="dropdown-divider" />
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="dropdown-item" style={{ color: '#3b82f6', fontWeight: '700' }} onClick={() => setShowDropdown(false)}>
                        <Shield size={16} /> Shop Manager
                      </Link>
                    )}
                    <Link to="/account" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <Link to="/account" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <Package size={16} /> My Orders
                    </Link>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item logout-item" onClick={handleLogout}>
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="action-item auth">
                <User size={20} />
                <div className="action-text">
                  <span className="action-label">Account</span>
                  <Link to="/login" className="action-value auth-link" style={{ textDecoration: 'none', color: 'inherit' }}>Sign In / Register</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="header-nav">
        <div className="container nav-content">
          <NavLink to="/home" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Home size={18} /> Home
          </NavLink>
          <NavLink to="/shop" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Package size={18} /> Products
          </NavLink>
          <NavLink to="/estimator" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Calculator size={18} /> Estimator
          </NavLink>
          <NavLink to="/quote" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <FileText size={18} /> Project List
          </NavLink>
          <NavLink to="/track" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Truck size={18} /> Track Order
          </NavLink>
          <NavLink to="/resources" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <BookOpen size={18} /> Pro Hub
          </NavLink>
          <NavLink to="/support" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <HeadphonesIcon size={18} /> Support
          </NavLink>
          <NavLink to="/account" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <User size={18} /> Account
          </NavLink>
        </div>
      </nav>
    </header>
  );
};

export default Header;
