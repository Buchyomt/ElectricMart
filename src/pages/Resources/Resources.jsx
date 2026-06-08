import React, { useState } from 'react';
import { FileText, ShieldCheck, Zap, BookOpen, Download, HelpCircle, ExternalLink, PenTool, Calculator as CalcIcon } from 'lucide-react';
import './Resources.css';

const Resources = () => {
  const [voltageDrop, setVoltageDrop] = useState({ length: '', current: '', voltage: 230, result: null });

  const calculateVD = (e) => {
    e.preventDefault();
    // Simplified VD formula: (2 * L * I * 0.019) / V for 2.5mm copper
    const { length, current, voltage } = voltageDrop;
    if (!length || !current) return;
    const drop = (2 * length * current * 0.019) / voltage * 100;
    setVoltageDrop({ ...voltageDrop, result: drop.toFixed(2) });
  };

  const resourceCategories = [
    {
      title: "Technical Standards",
      icon: <ShieldCheck className="res-icon" />,
      description: "Access latest electrical installation codes and safety standards for Nigerian projects.",
      items: ["NEMSA Safety Guidelines 2024", "Standard Wiring Regulations", "Solar Installation Protocols"]
    },
    {
      title: "Design & Calculation",
      icon: <Zap className="res-icon" />,
      description: "Professional tools for electrical load analysis and cable sizing.",
      items: ["Voltage Drop Calculator", "Circuit Load Estimator", "Conduit Fill Guide"]
    },
    {
      title: "Product Training",
      icon: <BookOpen className="res-icon" />,
      description: "Video tutorials and manuals for modern switchgear and smart home devices.",
      items: ["Smart Panel Setup Guide", "Industrial Breaker Maintenance", "LED Dimming Compatibility"]
    }
  ];

  return (
    <div className="resources-page">
      <div className="res-hero">
        <div className="container">
          <span className="res-badge">Pro Hub</span>
          <h1>Technical Knowledge Center</h1>
          <p>The engineer's definitive library for electrical project documentation and engineering resources.</p>
        </div>
      </div>

      <div className="container">
        {/* Engineering Tool Section */}
        <section className="res-tool-section">
          <div className="tool-card">
            <div className="tool-header">
              <CalcIcon size={24} className="text-primary" />
              <div>
                <h3>Quick Voltage Drop Calculator</h3>
                <p>Calculate estimated loss for copper cables (2.5mm base)</p>
              </div>
            </div>
            <form className="tool-form" onSubmit={calculateVD}>
              <div className="input-group">
                <label>Cable Length (m)</label>
                <input type="number" value={voltageDrop.length} onChange={e => setVoltageDrop({...voltageDrop, length: e.target.value})} placeholder="e.g. 50" />
              </div>
              <div className="input-group">
                <label>Design Current (A)</label>
                <input type="number" value={voltageDrop.current} onChange={e => setVoltageDrop({...voltageDrop, current: e.target.value})} placeholder="e.g. 20" />
              </div>
              <button type="submit" className="btn btn-primary">Calculate</button>
            </form>
            {voltageDrop.result && (
              <div className="tool-result">
                <span>Estimated Drop:</span>
                <strong>{voltageDrop.result}%</strong>
                <p className={voltageDrop.result > 3 ? 'text-danger' : 'text-success'}>
                  {voltageDrop.result > 3 ? '⚠️ Exceeds 3% limit (Lighting)' : '✅ Within safe limits'}
                </p>
              </div>
            )}
          </div>
        </section>

        <div className="res-grid">
          {resourceCategories.map((cat, idx) => (
            <div key={idx} className="res-card">
              <div className="res-card-header">
                {cat.icon}
                <h3>{cat.title}</h3>
              </div>
              <p>{cat.description}</p>
              <ul className="res-item-list">
                {cat.items.map((item, i) => (
                  <li key={i}>
                    <FileText size={14} />
                    <span>{item}</span>
                    <Download size={14} className="dl-icon" />
                  </li>
                ))}
              </ul>
              <button className="res-card-btn">Explore Category <ExternalLink size={14} /></button>
            </div>
          ))}
        </div>

        <section className="res-cta">
          <div className="res-cta-content">
            <div className="cta-text">
              <h2>Need Custom Engineering Advice?</h2>
              <p>Our licensed electrical engineers are available for site survey consultations and material specification advice.</p>
            </div>
            <button className="btn btn-primary">Book Consultation <PenTool size={18} /></button>
          </div>
        </section>

        <section className="res-faq-preview">
          <div className="faq-header">
            <HelpCircle size={24} />
            <h2>Common Technical Inquiries</h2>
          </div>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>What is the warranty on industrial breakers?</h4>
              <p>All industrial switchgear comes with a minimum 24-month manufacturer warranty and a certificate of authenticity.</p>
            </div>
            <div className="faq-item">
              <h4>Do you provide installation services?</h4>
              <p>While we are primarily a distributor, we have a network of certified ElectroMart partners who can handle professional installation.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Resources;
