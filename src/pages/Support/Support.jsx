import React from 'react';
import {
  MessageSquare,
  Mail,
  MapPin,
  PhoneCall,
  Clock,
  ShieldCheck,
  Truck,
  FileText,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import './Support.css';

const Support = () => {
  const faqs = [
    {
      q: "Are your electrical products genuine?",
      a: "Yes. Every item on ElectroMart is sourced directly from authorized distributors. We provide manufacturer warranties for brands like Schneider, Nexans, and ABB."
    },
    {
      q: "How fast is delivery within Lagos?",
      a: "We offer Same-Day delivery for orders placed before 10 AM for Island/Mainland zones. Standard delivery takes 24-48 hours."
    },
    {
      q: "Can I request a formal quote for a project?",
      a: "Absolutely. Use our 'Project List' feature to add materials and submit for a bulk discount quote. Our sales team will respond within 2 hours."
    },
    {
      q: "What is your return policy?",
      a: "Sealed, non-installed electrical items can be returned within 7 days. Note: Cables cut to specific lengths are non-refundable."
    }
  ];

  return (
    <div className="support-page">
      {/* Hero Section */}
      <section className="support-hero">
        <div className="container">
          <div className="support-hero-content">
            <span className="support-badge">Contact & Help Center</span>
            <h1>How can we power your project today?</h1>
            <p>Get expert technical advice, track your orders, or request bulk pricing from our professional team.</p>
          </div>
        </div>
      </section>

      <div className="container support-grid">
        {/* Main Content */}
        <main className="support-main">
          {/* Quick Contact Cards */}
          <section className="contact-cards">
            <div className="contact-card whatsapp" onClick={() => window.open('https://wa.me/234800ELECTRO')}>
              <div className="card-icon"><MessageSquare size={24} /></div>
              <h3>WhatsApp Support</h3>
              <p>Instant chat with our sales engineers.</p>
              <span className="link-text">Chat Now <ChevronRight size={16} /></span>
            </div>

            <div className="contact-card call" onClick={() => window.location.href = 'tel:+234800ELECTRO'}>
              <div className="card-icon"><PhoneCall size={24} /></div>
              <h3>Call Center</h3>
              <p>Speak with our customer care reps.</p>
              <span className="link-text">+234 810 596 8503 ELECTRO</span>
            </div>

            <div className="contact-card email" onClick={() => window.location.href = 'mailto:support@electromart.com'}>
              <div className="card-icon"><Mail size={24} /></div>
              <h3>Email Inquiries</h3>
              <p>For formal quotes and official docs.</p>
              <span className="link-text">Send Email <ChevronRight size={16} /></span>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="faq-section">
            <div className="section-header">
              <ShieldCheck className="header-icon" />
              <h2>Common Questions</h2>
            </div>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <h4>{faq.q}</h4>
                  <p>{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Sidebar Info */}
        <aside className="support-sidebar">
          <div className="sidebar-block">
            <h3><MapPin size={18} /> Our Headquarters</h3>
            <div className="location-info">
              <p><strong>Lagos Experience Center</strong></p>
              <p>Block B, Suite 12, Alaba Specialist Market,</p>
              <p>Ojo, Lagos, Nigeria.</p>
            </div>
            <div className="hours-info">
              <h3><Clock size={18} /> Business Hours</h3>
              <ul>
                <li><span>Mon - Fri:</span> <span>8:00 AM - 6:00 PM</span></li>
                <li><span>Saturday:</span> <span>9:00 AM - 4:00 PM</span></li>
                <li><span>Sunday:</span> <span>Closed (Online Only)</span></li>
              </ul>
            </div>
          </div>

          <div className="sidebar-block documentation-block">
            <h3><FileText size={18} /> Quick Links</h3>
            <a href="/quote" className="doc-link">
              <span>Project Quote Manager</span>
              <ChevronRight size={16} />
            </a>
            <a href="/shop" className="doc-link">
              <span>Browse Technical Specs</span>
              <ChevronRight size={16} />
            </a>
            <a href="#" className="doc-link">
              <span>Return Policy</span>
              <ExternalLink size={14} />
            </a>
          </div>

          <div className="sidebar-promo">
            <Truck size={32} />
            <h3>Site Delivery</h3>
            <p>Moving materials to site in Lekki, Ajah, or Ikeja? We have dedicated logistics for heavy electrical loads.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Support;
