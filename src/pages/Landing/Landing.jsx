import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Calculator,
  ChevronRight,
  Star,
  Activity,
  Award,
  Globe,
  Lightbulb,
  Cpu,
  CheckCircle2
} from 'lucide-react';
import LandingHeader from '../../components/LandingHeader/LandingHeader';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);

  const images = [
    '/images/hero-banner.png',
    'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&q=80', // Electrical engineering
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80' // Modern lighting
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="landing-page">
      <LandingHeader />
      {/* Dynamic Hero Section */}
      <section className="landing-hero">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentImage}
            className="hero-background"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{ 
              backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.4)), url(${images[currentImage]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed'
            }}
          />
        </AnimatePresence>

        <div className="container hero-content">
          <motion.div 
            className="hero-text-wrapper"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="hero-badge" variants={itemVariants}>
              <Zap size={16} color="#fbbf24" fill="#fbbf24" />
              <span>Powering Lagos's Infrastructure</span>
            </motion.div>
            
            <motion.h1 className="hero-title" variants={itemVariants}>
              Premium Electrical <br/>
              <span className="text-gradient">Solutions & Supplies</span>
            </motion.h1>
            
            <motion.p className="hero-subtitle" variants={itemVariants}>
              The preferred sourcing partner for top contractors, engineers, and developers across Nigeria. Experience wholesale pricing, verified authentic brands, and rapid site delivery.
            </motion.p>
            
            <motion.div className="hero-actions" variants={itemVariants}>
              <button className="btn btn-primary btn-lg pulse-btn" onClick={() => navigate('/store')}>
                Enter Portal <ArrowRight size={20} />
              </button>
              <button className="btn btn-glass btn-lg" onClick={() => navigate('/shop')}>
                Browse Catalog
              </button>
            </motion.div>
            
            <motion.div className="hero-stats" variants={itemVariants}>
              <div className="stat">
                <h3>10k+</h3>
                <p>Products</p>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <h3>24hr</h3>
                <p>Delivery</p>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <h3>100%</h3>
                <p>Genuine</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <div className="mouse">
            <div className="wheel"></div>
          </div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* Partners Section */}
      <section className="partners-section">
        <div className="container">
          <p className="partners-title">TRUSTED BY INDUSTRY LEADERS & TOP BRANDS</p>
          <div className="partners-logo-strip">
            {['Schneider Electric', 'Havells', 'Prysmian', 'Nexans', 'Clipsal', 'Mercury'].map((brand, idx) => (
              <div key={idx} className="partner-logo">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Mission & What We Do */}
      <section className="mission-section" style={{ padding: '5rem 0', background: '#f8fafc' }}>
        <div className="container">
          <div className="section-header text-center" style={{ marginBottom: '4rem' }}>
            <h2 className="section-title">Empowering the Future of Infrastructure</h2>
            <p className="section-subtitle">We are the bridge between world-class electrical manufacturers and Africa's builders.</p>
          </div>
          
          <div className="mission-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <motion.div className="mission-card" whileHover={{ y: -5 }} style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <Globe size={40} color="#3b82f6" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#0f172a' }}>Global Sourcing, Local Delivery</h3>
              <p style={{ color: '#64748b', lineHeight: 1.6 }}>We partner with the world's most reputable OEMs to bring authentic, high-quality electrical materials directly to your site, bypassing unreliable middlemen.</p>
            </motion.div>
            
            <motion.div className="mission-card" whileHover={{ y: -5 }} style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <Lightbulb size={40} color="#f59e0b" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#0f172a' }}>Innovation in Procurement</h3>
              <p style={{ color: '#64748b', lineHeight: 1.6 }}>Our digital platform revolutionizes how contractors buy. From automated quoting to AI-driven material estimation, we make procurement seamless.</p>
            </motion.div>
            
            <motion.div className="mission-card" whileHover={{ y: -5 }} style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <Cpu size={40} color="#8b5cf6" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#0f172a' }}>Smart Automation Hub</h3>
              <p style={{ color: '#64748b', lineHeight: 1.6 }}>Beyond standard supplies, we provide advanced building automation and industrial control systems to future-proof your projects.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section" style={{ padding: '6rem 0', background: 'white' }}>
        <div className="container">
          <div className="section-header text-center" style={{ marginBottom: '4rem' }}>
            <h2 className="section-title">How EllectricMart Works</h2>
            <p className="section-subtitle">A streamlined process designed for professionals.</p>
          </div>
          
          <div className="steps-container" style={{ display: 'flex', flexDirection: 'column', gap: '3rem', maxWidth: '800px', margin: '0 auto' }}>
            {[
              { title: 'Create a B2B Account', desc: 'Sign up to access wholesale pricing, dedicated support, and advanced procurement tools.' },
              { title: 'Browse or Upload BOQ', desc: 'Search our extensive catalog or simply upload your Bill of Quantities for a rapid quote.' },
              { title: 'Review & Approve', desc: 'Get transparent pricing with bulk discounts. Approve your quote with a single click.' },
              { title: 'Fast Site Delivery', desc: 'Track your order in real-time as our logistics team delivers directly to your construction site.' }
            ].map((step, index) => (
              <motion.div key={index} className="step-row" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                <div className="step-number" style={{ background: '#2563eb', color: 'white', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', flexShrink: 0 }}>
                  {index + 1}
                </div>
                <div className="step-content">
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#0f172a' }}>{step.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us - Bento Grid */}
      <section className="bento-section">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Why Professionals Choose Us</h2>
            <p className="section-subtitle">Engineered for reliability, scale, and speed.</p>
          </div>
          
          <div className="bento-grid">
            <motion.div 
              className="bento-card large"
              whileHover={{ y: -5 }}
              onClick={() => navigate('/estimator')}
            >
              <div className="bento-content">
                <div className="bento-icon-wrapper"><Calculator size={32} color="#3b82f6" /></div>
                <h3>Smart Project Estimator</h3>
                <p>Generate comprehensive material lists based on your building type in seconds. Let our algorithm do the heavy lifting.</p>
                <span className="bento-link">Try Estimator <ChevronRight size={16} /></span>
              </div>
              <div className="bento-bg-accent"></div>
            </motion.div>

            <motion.div className="bento-card" whileHover={{ y: -5 }}>
              <div className="bento-content">
                <div className="bento-icon-wrapper"><ShieldCheck size={32} color="#10b981" /></div>
                <h3>Verified Authentic</h3>
                <p>Direct partnerships with OEMs. Zero risk of counterfeits.</p>
              </div>
            </motion.div>

            <motion.div className="bento-card" whileHover={{ y: -5 }}>
              <div className="bento-content">
                <div className="bento-icon-wrapper"><Truck size={32} color="#f59e0b" /></div>
                <h3>Express Logistics</h3>
                <p>Dedicated fleet for secure site deliveries across Lagos.</p>
              </div>
            </motion.div>
            
            <motion.div className="bento-card wide" whileHover={{ y: -5 }} onClick={() => navigate('/quote')}>
              <div className="bento-content flex-row">
                <div>
                  <div className="bento-icon-wrapper"><Award size={32} color="#8b5cf6" /></div>
                  <h3>Contractor Wholesale Program</h3>
                  <p>Upload your BOQ and get exclusive B2B pricing and dedicated account management.</p>
                </div>
                <button className="btn btn-outline">Apply Now</button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="testimonial-section">
        <div className="container">
          <div className="testimonial-wrapper">
            <div className="testimonial-content">
              <div className="stars">
                {[1,2,3,4,5].map(i => <Star key={i} size={20} fill="#fbbf24" color="#fbbf24" />)}
              </div>
              <blockquote>
                "EllectricMart completely transformed our procurement process. We cut down sourcing time by 60% and their material estimator is scarily accurate."
              </blockquote>
              <div className="testimonial-author">
                <div className="author-avatar">OJ</div>
                <div>
                  <h4>Engr. Olamilekan J.</h4>
                  <p>Lead Engineer, BuildTech NG</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-cta">
        <div className="container text-center">
          <h2>Ready to power up your next project?</h2>
          <p>Join thousands of professionals already using EllectricMart.</p>
          <div className="cta-buttons">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/store')}>Go to Storefront</button>
            <button className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }} onClick={() => navigate('/shop')}>Explore Shop</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
