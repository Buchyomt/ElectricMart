import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryCard from '../../components/CategoryCard/CategoryCard';
import ProductCard from '../../components/ProductCard/ProductCard';
import { 
  Activity, 
  Settings, 
  Lightbulb, 
  ToggleRight, 
  Box, 
  Home as HomeIcon, 
  Wrench,
  Truck,
  ShieldCheck,
  FileText,
  Calculator,
  ArrowRight,
  CheckCircle,
  Clock,
  Shield,
  Mail,
  HardHat
} from 'lucide-react';
import inventoryData from '../../data/inventory.json';
import { motion } from 'framer-motion';
import './Home.css';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState(null); // null | 'loading' | 'success' | 'error' | 'exists'
  const [newsletterMessage, setNewsletterMessage] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        if (data && data.length > 0) {
          setProducts(data.slice(0, 8)); 
        } else {
          setProducts(inventoryData.slice(0, 8));
        }
      } catch (err) {
        console.warn('Backend unavailable, using local inventory fallback:', err.message);
        setProducts(inventoryData.slice(0, 8));
      }
    };
    fetchProducts();
  }, []);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setNewsletterStatus('loading');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail })
      });
      const data = await res.json();
      if (res.status === 201) {
        setNewsletterStatus('success');
        setNewsletterMessage(data.message);
        setNewsletterEmail('');
      } else if (res.status === 409) {
        setNewsletterStatus('exists');
        setNewsletterMessage(data.message);
      } else {
        setNewsletterStatus('error');
        setNewsletterMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setNewsletterStatus('error');
      setNewsletterMessage('Could not connect. Please check your connection.');
    }
  };

  const categories = [
    { title: 'Cables & Wires', query: 'Cables & Wires', icon: <Activity /> },
    { title: 'Fans & Cooling', query: 'Fans & Cooling', icon: <Box /> },
    { title: 'Solar & Inverters', query: 'Solar & Inverters', icon: <Settings /> },
    { title: 'Lighting & Fixtures', query: 'Lighting', icon: <Lightbulb /> },
    { title: 'Switches & Sockets', query: 'Switches & Sockets', icon: <ToggleRight /> },
    { title: 'Home Appliances', query: 'Home Appliances', icon: <HomeIcon /> },
    { title: 'Protection', query: 'Protection', icon: <ShieldCheck /> },
  ];

  const brands = ['Clipsal', 'Schneider Electric', 'Nexans', 'Havells', 'Mercury', 'Prysmian'];

  return (
    <div className="home-page">
      {/* Categories Sub-nav */}
      <motion.div 
        className="categories-bar"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <div className="container categories-container">
          {categories.map((cat, idx) => (
            <motion.div key={idx} variants={fadeInUp}>
              <CategoryCard icon={cat.icon} title={cat.title} query={cat.query} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Hero Section */}
      <section className="hero-section" style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), url('/images/hero-banner.png')` }}>
        <motion.div 
          className="container hero-content"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            className="hero-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            Lagos's #1 Electrical Marketplace
          </motion.div>
          <motion.h2 className="hero-title" variants={fadeInUp}>
            Lagos's Most Trusted Electrical Hub
          </motion.h2>
          <motion.p className="hero-subtitle" variants={fadeInUp}>
            Source genuine materials from Alaba to Lekki — fast, verified, and delivered to your site.
          </motion.p>
          <motion.div className="hero-actions" variants={fadeInUp}>
            <button className="btn btn-primary hero-btn" onClick={() => navigate('/shop')}>
              <Box size={18} style={{marginRight: '8px'}}/> Shop Now
            </button>
            <button className="btn btn-outline hero-btn" onClick={() => navigate('/quote')}>
              <FileText size={18} style={{marginRight: '8px'}}/> Get a Project Quote
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Value Propositions */}
      <section className="features-section">
        <motion.div 
          className="container features-grid"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div className="feature-item" variants={fadeInUp}>
            <div className="feature-icon"><Truck size={24} /></div>
            <div>
              <h4 className="feature-title">Lagos-Wide Delivery</h4>
              <p className="feature-desc">Island & Mainland zones covered</p>
            </div>
          </motion.div>
          <motion.div className="feature-item" variants={fadeInUp}>
            <div className="feature-icon"><ShieldCheck size={24} /></div>
            <div>
              <h4 className="feature-title">Verified Quality</h4>
              <p className="feature-desc">Certified brands, safety-guaranteed</p>
            </div>
          </motion.div>
          <motion.div className="feature-item" variants={fadeInUp}>
            <div className="feature-icon"><HardHat size={24} /></div>
            <div>
              <h4 className="feature-title">Contractor Support</h4>
              <p className="feature-desc">Bulk pricing & project quotes</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Project Estimator CTA */}
      <section className="estimator-promo-section">
        <div className="container">
          <motion.div 
            className="estimator-promo-card"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="estimator-promo-info">
              <div className="promo-badge">Contractor Tools</div>
              <h2>Not sure what materials you need?</h2>
              <p>Use our <strong>Smart Project Estimator</strong> to generate a material list based on your building type in seconds.</p>
              <button className="btn btn-primary" onClick={() => navigate('/estimator')}>
                Try the Estimator Tool <ArrowRight size={18} style={{marginLeft: '8px'}} />
              </button>
            </div>
            <div className="estimator-promo-visual">
              <Calculator size={80} strokeWidth={1} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Top Brands */}
      <section className="brands-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div>
              <h2 className="section-title">Top Brands in Lagos</h2>
              <p className="section-subtitle">Authorized distributors of leading global manufacturers</p>
            </div>
            <button className="view-all-btn-link" onClick={() => navigate('/shop')}>View all brands →</button>
          </motion.div>
          
          <motion.div 
            className="brands-grid"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {brands.map((brand, idx) => (
              <motion.div 
                key={idx} 
                className="brand-card" 
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => navigate(`/shop?brand=${brand}`)}
              >
                <span className="brand-name">{brand}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section" style={{ padding: '80px 0', backgroundColor: '#f8fafc' }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 className="section-title" style={{ justifyContent: 'center' }}>How ElectroMart Works</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>Simple, transparent, and built for contractors</p>
          </div>
          
          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', position: 'relative' }}>
            {[
              { num: '01', title: 'Create Project List', desc: 'Use our estimator or browse the shop to build your material list.', icon: <Calculator size={32} /> },
              { num: '02', title: 'Submit for Quote', desc: 'Request formal wholesale pricing with one click.', icon: <FileText size={32} /> },
              { num: '03', title: 'Approve & Pay', desc: 'Review admin-adjusted pricing and confirm your order.', icon: <CheckCircle size={32} /> },
              { num: '04', title: 'Site Delivery', desc: 'Fast, secure delivery straight to your construction site.', icon: <Truck size={32} /> }
            ].map((step, idx) => (
              <div key={idx} className="step-card" style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', position: 'relative', zIndex: 1 }}>
                <div style={{ color: '#cbd5e1', fontSize: '3rem', fontWeight: 900, position: 'absolute', top: '20px', right: '20px', opacity: 0.5 }}>{step.num}</div>
                <div style={{ color: '#3b82f6', marginBottom: '20px' }}>{step.icon}</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#0f172a' }}>{step.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="trust-section" style={{ padding: '80px 0', backgroundColor: '#0f172a', color: 'white' }}>
        <div className="container">
          <div className="trust-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            <div className="trust-item" style={{ display: 'flex', gap: '20px' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '16px', borderRadius: '12px', height: 'fit-content' }}><Shield size={32} color="#60a5fa" /></div>
              <div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>Genuine Materials</h3>
                <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>We source directly from OEMs and authorized distributors. No counterfeits, ever.</p>
              </div>
            </div>
            <div className="trust-item" style={{ display: 'flex', gap: '20px' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '16px', borderRadius: '12px', height: 'fit-content' }}><Clock size={32} color="#60a5fa" /></div>
              <div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>Same-Day Processing</h3>
                <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Quotes approved within hours. Most Lagos deliveries happen within 24-48 hours.</p>
              </div>
            </div>
            <div className="trust-item" style={{ display: 'flex', gap: '20px' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '16px', borderRadius: '12px', height: 'fit-content' }}><HardHat size={32} color="#60a5fa" /></div>
              <div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>Trade Accounts</h3>
                <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Verified contractors automatically qualify for tiered trade discounts on all orders.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Best Sellers in Lagos</h2>
              <p className="section-subtitle">Most ordered by Lagos contractors this month</p>
            </div>
            <button className="view-all-btn-link" onClick={() => navigate('/shop')}>See all →</button>
          </div>
          
          <motion.div 
            className="products-grid"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {products.map(product => (
              <motion.div key={product.id || product._id} variants={fadeInUp}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter-section" style={{ padding: '80px 0', borderTop: '1px solid #e2e8f0', background: 'linear-gradient(to right, #eff6ff, #f8fafc)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
          <Mail size={40} color="#3b82f6" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: '#0f172a' }}>Get Contractor Updates</h2>
          <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '1.1rem' }}>Join our mailing list to receive weekly price updates, new inventory alerts, and exclusive trade discounts.</p>

          {/* Notification Banner */}
          {newsletterStatus && newsletterStatus !== 'loading' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 24px',
              borderRadius: '14px',
              marginBottom: '24px',
              textAlign: 'left',
              fontWeight: '600',
              fontSize: '0.95rem',
              animation: 'fadeInDown 0.4s ease',
              ...(newsletterStatus === 'success'
                ? { background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', border: '1px solid #86efac', color: '#15803d' }
                : newsletterStatus === 'exists'
                ? { background: 'linear-gradient(135deg, #fef9c3, #fef08a)', border: '1px solid #fde047', color: '#854d0e' }
                : { background: 'linear-gradient(135deg, #fee2e2, #fecaca)', border: '1px solid #fca5a5', color: '#b91c1c' })
            }}>
              <span style={{ fontSize: '22px' }}>
                {newsletterStatus === 'success' ? '🎉' : newsletterStatus === 'exists' ? '📬' : '⚠️'}
              </span>
              <span>{newsletterMessage}</span>
            </div>
          )}

          {newsletterStatus !== 'success' && (
            <form
              style={{ display: 'flex', gap: '10px', maxWidth: '460px', margin: '0 auto' }}
              onSubmit={handleNewsletterSubmit}
            >
              <input
                type="email"
                placeholder="Enter your email address"
                required
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                style={{ flex: 1, padding: '14px 20px', borderRadius: '10px', border: '2px solid #cbd5e1', outline: 'none', fontSize: '1rem', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#cbd5e1'}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={newsletterStatus === 'loading'}
                style={{ padding: '14px 24px', borderRadius: '10px', whiteSpace: 'nowrap', opacity: newsletterStatus === 'loading' ? 0.7 : 1 }}
              >
                {newsletterStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
