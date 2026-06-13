import React, { useState } from 'react';
import { FileText, ShieldCheck, Zap, BookOpen, Download, HelpCircle, ExternalLink, PenTool, Calculator as CalcIcon } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import './Resources.css';

const Resources = () => {
  const { showToast } = useToast();
  const [voltageDrop, setVoltageDrop] = useState({ length: '', current: '', voltage: 230, result: null });

  const calculateVD = (e) => {
    e.preventDefault();
    // Simplified VD formula: (2 * L * I * 0.019) / V for 2.5mm copper
    const { length, current, voltage } = voltageDrop;
    if (!length || !current) return;
    const drop = (2 * length * current * 0.019) / voltage * 100;
    setVoltageDrop({ ...voltageDrop, result: drop.toFixed(2) });
  };

  const generateResourcePDF = (title, type = 'Document') => {
    try {
      const { jsPDF } = window.jspdf;
      if (!jsPDF) {
        showToast("PDF generator not loaded yet. Please try again.", "warning");
        return;
      }
      
      const doc = new jsPDF();
      
      // Branding
      const primaryBlue = [37, 99, 235];
      const darkSlate = [15, 23, 42];
      
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 0, 210, 45, 'F');
      
      doc.setFontSize(26);
      doc.setTextColor(...primaryBlue);
      doc.setFont("helvetica", "bold");
      doc.text("ELECTRICMART PRO HUB", 20, 25);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.text("Technical Resources & Engineering Library", 20, 35);
      
      // Document Title
      doc.setFontSize(18);
      doc.setTextColor(...darkSlate);
      doc.setFont("helvetica", "bold");
      doc.text(title.toUpperCase(), 20, 65);
      
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.text(`Document Type: ${type} | Date: ${new Date().toLocaleDateString()}`, 20, 75);
      
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 80, 190, 80);
      
      // Placeholder content
      doc.setFontSize(12);
      doc.setTextColor(...darkSlate);
      doc.setFont("helvetica", "normal");
      
      const content = `This document provides the latest information regarding ${title}.\nAs part of the ElectricMart Pro Hub initiative, we aim to provide\nup-to-date standards, calculations, and training materials for\nelectrical professionals in Nigeria.\n\n[ This is a dynamically generated placeholder document. ]\n[ The full technical text for "${title}" will be \n  inserted here once the administrative team uploads \n  the complete technical specifications. ]\n\nKey Areas Covered:\n- Safety Standards and Compliance\n- Installation Best Practices\n- Material Specifications\n- Troubleshooting and Maintenance\n\nFor immediate technical assistance, please use the \n"Book Consultation" button on the Pro Hub page to speak \nwith our licensed engineers.`;

      doc.text(content, 20, 95, { maxWidth: 170, lineHeightFactor: 1.5 });
      
      // Footer
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text("© 2026 ElectricMart Nigeria. All rights reserved.", 105, 280, { align: "center" });
      
      // Save
      doc.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
      
    } catch (error) {
      console.error("PDF generation failed:", error);
      showToast("Failed to generate document.", "warning");
    }
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
                  <li key={i} onClick={() => {
                    showToast(`Preparing secure download for ${item}...`, 'success');
                    setTimeout(() => generateResourcePDF(item, cat.title), 1500);
                  }} style={{ cursor: 'pointer' }}>
                    <FileText size={14} />
                    <span>{item}</span>
                    <Download size={14} className="dl-icon" />
                  </li>
                ))}
              </ul>
              <button className="res-card-btn" onClick={() => {
                showToast(`Generating overview for ${cat.title}...`, 'info');
                setTimeout(() => generateResourcePDF(`${cat.title} - Complete Category Overview`, 'Category Archive'), 1500);
              }}>Explore Category <ExternalLink size={14} /></button>
            </div>
          ))}
        </div>

        <section className="res-cta">
          <div className="res-cta-content">
            <div className="cta-text">
              <h2>Need Custom Engineering Advice?</h2>
              <p>Our licensed electrical engineers are available for site survey consultations and material specification advice.</p>
            </div>
            <button className="btn btn-primary" onClick={() => window.open('https://wa.me/?text=Hello! I would like to book a consultation with a licensed ElectricMart engineer for my project.', '_blank')}>
              Book Consultation <PenTool size={18} />
            </button>
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
              <p>While we are primarily a distributor, we have a network of certified ElectricMart partners who can handle professional installation.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Resources;
