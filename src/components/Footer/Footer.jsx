import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, FileText, Package, Headphones as HeadphonesIcon, ShieldCheck, Mail, MapPin, Phone, Globe, Share2, Zap } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-glow"></div>
      <div className="container footer-content">
        {/* Brand & About */}
        <div className="footer-section brand-section">
          <Link to="/" className="footer-logo">
            <div className="logo-icon-wrapper">
              <Zap size={24} color="#3b82f6" fill="#3b82f6" />
            </div>
            <h2>ElectroMart</h2>
          </Link>
          <p className="footer-about">
            Nigeria's premier B2B marketplace for verified electrical and construction materials. We empower contractors with direct access to top-tier global manufacturers.
          </p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-circle" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-circle" aria-label="Twitter">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </a>
            <a href="tel:+2348105968503" className="social-circle" aria-label="Phone"><Phone size={18} /></a>
            <a href="mailto:help@electromart.ng" className="social-circle" aria-label="Email"><Mail size={18} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3 className="footer-heading">Quick Links</h3>
          <ul className="footer-links">
            <li><Link to="/shop"><ShoppingBag size={14} /> Shop All Products</Link></li>
            <li><Link to="/project-list"><FileText size={14} /> Site Quote Manager</Link></li>
            <li><Link to="/orders"><Package size={14} /> Track Orders</Link></li>
            <li><Link to="/support"><ShieldCheck size={14} /> Returns Policy</Link></li>
            <li><Link to="/support"><HeadphonesIcon size={14} /> Help Center</Link></li>
          </ul>
        </div>

        {/* Zones */}
        <div className="footer-section">
          <h3 className="footer-heading">Lagos Zones Served</h3>
          <ul className="zone-list">
            <li>Lekki / Victoria Island / Ikoyi</li>
            <li>Ikeja / Maryland / Opebi</li>
            <li>Alaba / Ojo Specialist Hub</li>
            <li>Surulere / Yaba / Akoka</li>
            <li>Ikorodu / Ajah Extents</li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h3 className="footer-heading">Contact & Support</h3>
          <ul className="contact-list">
            <li>
              <div className="contact-icon-wrapper"><Phone size={14} /></div>
              <span>+234 810 596 8503</span>
            </li>
            <li>
              <div className="contact-icon-wrapper"><Mail size={14} /></div>
              <span>help@electromart.ng</span>
            </li>
            <li>
              <div className="contact-icon-wrapper"><MapPin size={14} /></div>
              <span>12 Alaba Intl Mkt, Lagos</span>
            </li>
            <li className="verified-badge">
              <ShieldCheck size={14} color="#10b981" />
              <span style={{ color: '#10b981', fontWeight: '600' }}>Verified Distributor</span>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="footer-section newsletter-section">
          <h3 className="footer-heading">Pro Newsletter</h3>
          <p>Get exclusive contractor deals and wholesale price updates weekly.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <div className="newsletter-input-group">
              <Mail size={16} className="newsletter-icon" />
              <input type="email" placeholder="Enter your email" className="newsletter-input" required />
            </div>
            <button type="submit" className="btn btn-primary newsletter-btn">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p>© {new Date().getFullYear()} ElectroMart Nigeria Ltd. Built for Professionals.</p>
            <div className="footer-legal">
              <Link to="/support">Privacy Policy</Link>
              <span className="separator">•</span>
              <Link to="/support">Terms of Service</Link>
              <span className="separator">•</span>
              <Link to="/support">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
