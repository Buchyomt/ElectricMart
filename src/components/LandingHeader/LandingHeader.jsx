import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Menu, X } from 'lucide-react';
import './LandingHeader.css';

const LandingHeader = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`landing-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container landing-header-inner">
        <Link to="/" className="landing-logo">
          <Zap size={28} color={scrolled ? "#2563eb" : "#fbbf24"} fill={scrolled ? "#2563eb" : "#fbbf24"} />
          <span style={{ color: scrolled ? '#0f172a' : '#ffffff' }}>EllectricMart</span>
        </Link>

        <nav className="landing-nav-desktop">
          <a href="#about" style={{ color: scrolled ? '#475569' : '#e2e8f0' }}>About Us</a>
          <a href="#solutions" style={{ color: scrolled ? '#475569' : '#e2e8f0' }}>Solutions</a>
          <a href="#process" style={{ color: scrolled ? '#475569' : '#e2e8f0' }}>How it Works</a>
        </nav>

        <div className="landing-actions-desktop">
          <button className="btn btn-outline-light" style={{ 
            borderColor: scrolled ? '#e2e8f0' : 'rgba(255,255,255,0.3)',
            color: scrolled ? '#0f172a' : '#ffffff' 
          }} onClick={() => navigate('/login')}>
            Login
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/store')}>
            Enter Storefront
          </button>
        </div>

        <button 
          className="mobile-menu-btn" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ color: scrolled ? '#0f172a' : '#ffffff' }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="landing-mobile-menu">
          <a href="#about" onClick={() => setMobileMenuOpen(false)}>About Us</a>
          <a href="#solutions" onClick={() => setMobileMenuOpen(false)}>Solutions</a>
          <a href="#process" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
          <div className="mobile-actions">
            <button className="btn btn-outline" style={{ width: '100%', marginBottom: '1rem' }} onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}>Login</button>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { setMobileMenuOpen(false); navigate('/store'); }}>Enter Storefront</button>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingHeader;
