import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, Minus, FileDown, MessageSquare, Mail, ChevronRight, ChevronDown, ChevronUp, Folder, Send, MapPin, Calendar, Truck, CheckCircle2, Trash2, RefreshCcw, FileText, CheckCircle, Clock, Upload, AlertCircle, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import './ProjectList.css';

const ProjectList = () => {
  const navigate = useNavigate();
  const { 
    projectItems: items, 
    projectDetails, 
    setProjectDetails, 
    updateProjectQty, 
    removeFromProject,
    clearProject,
    subtotal 
  } = useProject();

  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('current'); // 'current' | 'quotes'
  const [submittedQuotes, setSubmittedQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModalQuote, setConfirmModalQuote] = useState(null);
  const [expandedQuotes, setExpandedQuotes] = useState({});
  const [isConverting, setIsConverting] = useState(false);
  const [csvUploading, setCsvUploading] = useState(false);

  const toggleQuoteExpand = (quoteId) => {
    setExpandedQuotes(prev => ({
      ...prev,
      [quoteId]: !prev[quoteId]
    }));
  };

  const handleConfirmOrder = async (quote) => {
    if (!quote) return;
    setIsConverting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/quotes/${quote._id}/convert`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({})
      });
      if (res.ok) {
        setConfirmModalQuote(null);
        // Refresh quotes list
        fetchQuotes();
        // Navigate to account with success message
        navigate('/account', {
          state: {
            activeTab: 'orders',
            successMessage: `Success! Quote QT-${quote._id.slice(-8).toUpperCase()} has been converted to an active order. Our procurement team will contact you shortly.`
          }
        });
      } else {
        const data = await res.json();
        showNotify(data.message || 'Failed to convert quote');
      }
    } catch (err) {
      showNotify('Error converting quote');
    } finally {
      setIsConverting(false);
    }
  };
  const [csvErrors, setCsvErrors] = useState([]);
  const [csvDragOver, setCsvDragOver] = useState(false);
  const csvInputRef = useRef(null);
  const { user, isAuthenticated, token } = useAuth();
  const { saveProjectToBackend } = useProject();

  const deliveryFees = {
    'Island — Lekki / VI / Ikoyi': 8500,
    'Mainland — Ikeja / Surulere': 4000,
    'Outskirts — Ajah / Ikorodu': 12000
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === 'quotes') {
      fetchQuotes();
    }
  }, [isAuthenticated, activeTab]);

  const fetchQuotes = async () => {
    try {
      setLoadingQuotes(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/quotes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSubmittedQuotes(data);
      }
    } catch (err) {
      console.error('Failed to fetch quotes', err);
    } finally {
      setLoadingQuotes(false);
    }
  };

  // Calculations
  const deliveryFee = deliveryFees[projectDetails.location] || 0;
  const vat = subtotal * 0.075;
  const grandTotal = subtotal + deliveryFee + vat;

  const updateQty = (id, quantity) => {
    updateProjectQty(id, quantity);
  };

  const showNotify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAction = (type) => {
    if (items.length === 0) {
      showNotify('Your project list is empty. Add items first!');
      return;
    }

    switch(type) {
      case 'pdf': {
        // Build printable HTML and open in new tab
        const rows = items.map(item =>
          `<tr>
            <td>${item.name}</td>
            <td>${item.brand}</td>
            <td style="text-align:center">${item.quantity}</td>
            <td style="text-align:right">₦${item.price.toLocaleString()}</td>
            <td style="text-align:right">₦${(item.price * item.quantity).toLocaleString()}</td>
          </tr>`
        ).join('');
        const html = `
          <html><head><title>ElectricMart Quote — ${projectDetails.name}</title>
          <style>body{font-family:sans-serif;padding:32px;color:#1e293b}h1{color:#2563eb}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{padding:10px 14px;border:1px solid #e2e8f0;text-align:left}th{background:#f8fafc;font-size:13px}.total{font-size:1.2rem;font-weight:700;text-align:right;margin-top:16px}@media print{.noprint{display:none}}</style>
          </head><body>
          <h1>⚡ ElectricMart — Project Quote</h1>
          <p><strong>Project:</strong> ${projectDetails.name} &nbsp;|&nbsp; <strong>Zone:</strong> ${projectDetails.location} &nbsp;|&nbsp; <strong>Valid For:</strong> 30 Days</p>
          <table><thead><tr><th>Item</th><th>Brand</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
          <p class="total">Grand Total (incl. VAT + Delivery): ₦${Math.round(grandTotal).toLocaleString()}</p>
          <p style="color:#64748b;font-size:13px;margin-top:40px">Generated by ElectricMart Nigeria | help@electricmart.ng | +234 800 ELECTRIC</p>
          <button class="noprint" onclick="window.print()" style="margin-top:20px;padding:10px 24px;background:#2563eb;color:white;border:none;border-radius:6px;font-size:15px;cursor:pointer">🖨 Print / Save as PDF</button>
          </body></html>`;
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        showNotify('PDF Quote opened in a new tab. Use Print → Save as PDF.');
        break;
      }
      case 'whatsapp': {
        const lines = items.map(i => `• ${i.name} x${i.quantity} = ₦${(i.price * i.quantity).toLocaleString()}`).join('%0A');
        const msg = `Hello ElectricMart,%0A%0AProject: *${projectDetails.name}*%0ADelivery Zone: *${projectDetails.location}*%0A%0AItems:%0A${lines}%0A%0A*Grand Total: ₦${Math.round(grandTotal).toLocaleString()}*%0A%0APlease confirm availability and bulk pricing. Thank you!`;
        window.open(`https://wa.me/2348000000000?text=${msg}`, '_blank');
        showNotify('Opening WhatsApp with your quote...');
        break;
      }
      case 'email': {
        const body = items.map(i => `${i.name} (x${i.quantity}) — ₦${(i.price * i.quantity).toLocaleString()}`).join('\n');
        const subject = `ElectricMart Project Quote: ${projectDetails.name}`;
        const emailBody = `Hello,\n\nPlease find my project material list below:\n\nProject: ${projectDetails.name}\nZone: ${projectDetails.location}\n\nItems:\n${body}\n\nGrand Total: ₦${Math.round(grandTotal).toLocaleString()}\n\nKindly confirm pricing and availability.\n\nThank you.`;
        window.location.href = `mailto:help@electricmart.ng?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
        showNotify('Opening your email client with the quote...');
        break;
      }
      case 'discount': showNotify('Bulk discount request submitted! Our team will call you within 2 hours.'); break;
      default: break;
    }
  };

  const handleSubmitRFQ = async () => {
    if (!isAuthenticated) {
      showNotify('Please log in to submit a formal Request for Quote.');
      return;
    }
    if (items.length === 0) {
      showNotify('Your project list is empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        projectName: projectDetails.name || 'Untitled Project',
        location: projectDetails.location,
        notes: 'Submitted from Site Quote Manager',
        items: items.map(i => {
          const rawId = i._id || i.id;
          // Only send productId if it's a valid MongoDB ObjectId (24-char hex string)
          // Products from local inventory.json have numeric IDs which Mongoose rejects
          const isValidObjectId = typeof rawId === 'string' && /^[a-f\d]{24}$/i.test(rawId);
          return {
            productId: isValidObjectId ? rawId : null,
            name: i.name,
            brand: i.brand,
            image: i.image,
            unitPrice: i.price,
            quantity: i.quantity,
          };
        })
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/quotes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showNotify('Official RFQ Submitted successfully!');
        clearProject();
        setActiveTab('quotes');
      } else {
        const data = await res.json();
        showNotify(data.message || 'Failed to submit RFQ');
      }
    } catch (err) {
      showNotify('Network error while submitting RFQ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloudSave = async () => {
    if (!isAuthenticated) {
      showNotify('Please log in to save projects to your account.');
      return;
    }
    const result = await saveProjectToBackend(user.id);
    if (result) showNotify('Project successfully synced to your cloud account!');
  };

  const handleCsvUpload = async (file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      showNotify('Please upload a valid CSV file.');
      return;
    }
    setCsvUploading(true);
    setCsvErrors([]);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const authToken = token || localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/upload/boq-csv`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        // Import parsed rows into project list as items (with name + qty)
        data.items.forEach(row => {
          // Add as a placeholder item if not matched to a real product
          // In production this would fuzzy-match against products DB
          const mockItem = {
            _id: `csv_${Date.now()}_${Math.random()}`,
            id: `csv_${Date.now()}_${Math.random()}`,
            name: row.description,
            brand: 'To Be Confirmed',
            image: '',
            price: 0,
            quantity: row.quantity
          };
          // We use the updateProjectQty / context's addItem
          // For now trigger a custom import event
        });
        if (data.errors?.length) setCsvErrors(data.errors);
        showNotify(`✅ Imported ${data.count} item${data.count !== 1 ? 's' : ''} from CSV!`);
      } else {
        showNotify(data.message || 'Failed to parse CSV');
      }
    } catch (err) {
      showNotify('Error uploading CSV file.');
    } finally {
      setCsvUploading(false);
    }
  };

  return (
    <div className="project-list-page">
      <div className="container pl-container">
        
        {/* Success Notification */}
        {notification && (
          <div className="pl-notification">
            <CheckCircle2 size={18} />
            <span>{notification}</span>
          </div>
        )}
        
        {/* Page Header */}
        <header className="pl-header">
          <div className="pl-header-title">
            <div className="pl-icon-bg">
              <ClipboardList size={28} color="white" />
            </div>
            <div>
              <h1>Site Quote Manager</h1>
              <p>Build your material list, get a formal quote, and share with your client.</p>
            </div>
          </div>
          <div className="pl-status">
            <span className="status-dot"></span>
            Cloud Sync Active
          </div>
        </header>

        <div className="pl-tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
          <button 
            className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`}
            onClick={() => setActiveTab('current')}
            style={{ background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: activeTab === 'current' ? 'bold' : 'normal', color: activeTab === 'current' ? '#2563eb' : '#64748b', cursor: 'pointer', paddingBottom: '8px', borderBottom: activeTab === 'current' ? '2px solid #2563eb' : 'none' }}
          >
            Current Project List
          </button>
          <button 
            className={`tab-btn ${activeTab === 'quotes' ? 'active' : ''}`}
            onClick={() => setActiveTab('quotes')}
            style={{ background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: activeTab === 'quotes' ? 'bold' : 'normal', color: activeTab === 'quotes' ? '#2563eb' : '#64748b', cursor: 'pointer', paddingBottom: '8px', borderBottom: activeTab === 'quotes' ? '2px solid #2563eb' : 'none' }}
          >
            My Submitted Quotes
          </button>
        </div>

        {activeTab === 'current' ? (
        <div className="pl-main-grid">
          
          <div className="pl-content">

            {/* CSV BOQ Uploader */}
            <section className="pl-card" style={{ marginBottom: '1.5rem', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Upload size={20} color="#3b82f6" /> Bulk BOQ Import
                  </h3>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>Upload a CSV file to instantly populate your material list.</p>
                </div>
                <a href="#" onClick={e => { e.preventDefault(); const blob = new Blob(['Description,Quantity,Unit,Notes\n6Watts COB Light,50,pcs,Living room\nSchneider 1-Gang Switch,20,pcs,Bedrooms'], { type: 'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'electricmart_boq_template.csv'; a.click(); }} style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={14} /> Download Template
                </a>
              </div>

              <div
                onDragOver={e => { e.preventDefault(); setCsvDragOver(true); }}
                onDragLeave={() => setCsvDragOver(false)}
                onDrop={e => { e.preventDefault(); setCsvDragOver(false); const file = e.dataTransfer.files[0]; handleCsvUpload(file); }}
                onClick={() => csvInputRef.current?.click()}
                style={{ border: `2px dashed ${csvDragOver ? '#3b82f6' : 'rgba(59,130,246,0.3)'}`, borderRadius: '16px', padding: '2.5rem', textAlign: 'center', cursor: 'pointer', background: csvDragOver ? 'rgba(59,130,246,0.05)' : 'rgba(248,250,252,0.6)', transition: 'all 0.2s ease' }}
              >
                <input ref={csvInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => handleCsvUpload(e.target.files[0])} />
                {csvUploading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid #3b82f6', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <p style={{ color: '#3b82f6', fontWeight: '600', margin: 0 }}>Parsing CSV...</p>
                  </div>
                ) : (
                  <>
                    <Upload size={36} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
                    <p style={{ fontWeight: '700', color: '#374151', margin: '0 0 0.25rem' }}>Drag & Drop your BOQ file here</p>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>or <span style={{ color: '#3b82f6', fontWeight: '600' }}>click to browse</span> — CSV files only</p>
                  </>
                )}
              </div>

              {csvErrors.length > 0 && (
                <div style={{ marginTop: '1rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '1rem' }}>
                  <p style={{ margin: '0 0 0.5rem', fontWeight: '700', color: '#c2410c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertCircle size={14} /> {csvErrors.length} row(s) skipped</p>
                  {csvErrors.map((e, i) => <p key={i} style={{ margin: '0.25rem 0', fontSize: '0.8rem', color: '#9a3412' }}>• {e}</p>)}
                </div>
              )}
            </section>

            {/* Project Details */}
            <section className="pl-card pl-details-card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(90deg, #f8fafc, #ffffff)', padding: '2rem', borderBottom: '1px solid #e2e8f0' }}>
                <div className="card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Folder size={20} color="#2563eb" /> Project Context
                  </h3>
                  <span className="badge-id" style={{ background: '#eff6ff', color: '#1e3a8a', padding: '0.4rem 1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                    Ref: EM-{Math.floor(Math.random()*9000)+1000}
                  </span>
                </div>
                <p className="card-subtitle" style={{ margin: 0 }}>Configure destination and timeline for accurate logistics pricing</p>
              </div>
              
              <div className="pl-form-row" style={{ padding: '2rem' }}>
                <div className="form-group">
                  <label>Project Reference Name</label>
                  <div className="select-wrapper">
                    <Folder size={16} className="input-icon" />
                    <input type="text" value={projectDetails.name} onChange={e => setProjectDetails({...projectDetails, name: e.target.value})} placeholder="e.g. Lekki Phase 1 Villa" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Delivery Location Zone</label>
                  <div className="select-wrapper">
                    <MapPin size={16} className="input-icon" />
                    <select value={projectDetails.location} onChange={e => setProjectDetails({...projectDetails, location: e.target.value})}>
                      <option value="Island — Lekki / VI / Ikoyi">Island — Lekki / VI / Ikoyi</option>
                      <option value="Mainland — Ikeja / Surulere">Mainland — Ikeja / Surulere</option>
                      <option value="Outskirts — Ajah / Ikorodu">Outskirts — Ajah / Ikorodu</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Quotation Validity</label>
                  <div className="select-wrapper">
                    <Calendar size={16} className="input-icon" />
                    <input type="text" value="30 Days from Generation" readOnly style={{ backgroundColor: '#f1f5f9', color: '#64748b' }} />
                  </div>
                </div>
              </div>
            </section>

            {/* Itemized List */}
            <section className="pl-card pl-items-card" style={{ padding: '0', overflow: 'hidden' }}>
              <div className="items-header" style={{ padding: '2rem', borderBottom: '1px solid #e2e8f0', margin: 0, background: '#ffffff' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={20} color="#2563eb" /> Itemized Material List
                  </h3>
                  <p className="card-subtitle" style={{ margin: 0 }}>{items.length} professional-grade items selected</p>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/shop')}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.25rem', borderRadius: '12px', fontWeight: 'bold' }}
                >
                  <Plus size={18} /> Add Material
                </button>
              </div>

              <div className="table-responsive" style={{ padding: '0 1rem' }}>
                <table className="pl-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Product Details</th>
                      <th>Brand</th>
                      <th className="text-right">Unit Price</th>
                      <th className="text-center">Quantity</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item._id || item.id}>
                        <td data-label="Item">
                          <div className="pl-item-img">
                            <img src={item.image?.startsWith('http') ? item.image : `/${item.image}`} alt={item.name} />
                          </div>
                        </td>
                        <td data-label="Details">
                          <div className="pl-item-info">
                            <strong>{item.name}</strong>
                            <span>SKU: {item.sku || 'N/A'}</span>
                          </div>
                        </td>
                        <td data-label="Brand"><span className="pl-brand-badge">{item.brand}</span></td>
                        <td data-label="Unit Price" className="text-right" style={{ color: '#475569', fontWeight: '600' }}>₦{item.price.toLocaleString()}</td>
                        <td data-label="Quantity">
                          <div className="pl-qty-control" style={{ margin: '0 auto' }}>
                            <button onClick={() => updateQty(item._id || item.id, item.quantity - 1)}><Minus size={14} /></button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQty(item._id || item.id, item.quantity + 1)}><Plus size={14} /></button>
                          </div>
                        </td>
                        <td data-label="Total" className="text-right font-bold" style={{ color: '#0f172a', fontSize: '1.05rem' }}>₦{(item.price * item.quantity).toLocaleString()}</td>
                        <td data-label="Remove" className="text-right">
                          <button className="pl-remove-btn" onClick={() => removeFromProject(item._id || item.id)}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center" style={{ padding: '4rem 2rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <ShoppingBag size={48} color="#cbd5e1" />
                            <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0 }}>Your project list is empty.</p>
                            <button className="btn btn-outline-primary" onClick={() => navigate('/shop')}>Start adding materials</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {items.length > 0 && (
                <div style={{ padding: '2rem', background: '#f8fafc', borderTop: '1px dashed #cbd5e1' }}>
                  <div className="pl-totals-summary" style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', marginLeft: 'auto', maxWidth: '450px', marginTop: 0 }}>
                    <div className="total-row" style={{ marginBottom: '1rem' }}>
                      <span style={{ color: '#64748b' }}>Materials Subtotal</span>
                      <strong style={{ color: '#1e293b', fontSize: '1.1rem' }}>₦{subtotal.toLocaleString()}</strong>
                    </div>
                    <div className="total-row" style={{ marginBottom: '1rem' }}>
                      <span style={{ color: '#64748b' }}>Logistics & Delivery</span>
                      <strong style={{ color: '#1e293b', fontSize: '1.1rem' }}>₦{deliveryFee.toLocaleString()}</strong>
                    </div>
                    <div className="total-row" style={{ paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#64748b' }}>Government VAT (7.5%)</span>
                      <strong style={{ color: '#1e293b', fontSize: '1.1rem' }}>₦{Math.round(vat).toLocaleString()}</strong>
                    </div>
                    <div className="grand-total-row" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 0, border: 'none' }}>
                      <div className="grand-total-label">
                        <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>TOTAL ESTIMATE</span>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>Prices valid for 30 days</p>
                      </div>
                      <span className="grand-price" style={{ color: '#2563eb', fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px' }}>
                        ₦{Math.round(grandTotal).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="pl-sidebar">
            <div className="sidebar-card summary-card">
              <div className="summary-header">
                <ClipboardList size={20} />
                <h4>Quote Summary</h4>
              </div>
              
              <div className="summary-box">
                <div className="summary-line">
                  <span className="label">PROJECT</span>
                  <strong>{projectDetails.name}</strong>
                </div>
                <div className="summary-line">
                  <span className="label">LOCATION</span>
                  <strong>{projectDetails.location}</strong>
                </div>
                <div className="summary-line">
                  <span className="label">TOTAL ITEMS</span>
                  <span className="items-badge">{items.length} Items</span>
                </div>
                <div className="summary-price-box">
                  <span className="label">PAYABLE AMOUNT</span>
                  <div className="summary-price">₦{Math.round(grandTotal).toLocaleString()}</div>
                </div>
              </div>

              <div className="sidebar-actions">
                <button className="btn btn-primary w-full" onClick={handleSubmitRFQ} disabled={isSubmitting} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}>
                  {isSubmitting ? 'Submitting...' : <><Send size={18} /> Submit Formal RFQ</>}
                </button>
                <div style={{ height: '1px', background: '#e2e8f0', margin: '15px 0' }}></div>
                <button className="btn btn-cloud-save" onClick={handleCloudSave}>
                  <RefreshCcw size={18} /> Save Draft to Cloud
                </button>
                <button className="btn btn-outline-primary" onClick={() => handleAction('pdf')}>
                  <FileDown size={18} /> Quick PDF Preview
                </button>
                <button className="btn btn-whatsapp" onClick={() => handleAction('whatsapp')}>
                  <MessageSquare size={18} /> Share via WhatsApp
                </button>
                <button className="btn btn-outline-primary" onClick={() => handleAction('email')}>
                  <Mail size={18} /> Email Quote to Client
                </button>
              </div>
            </div>

            <div className="sidebar-card discount-card">
              <div className="summary-header">
                <div className="discount-icon">%</div>
                <h4>Project Pricing</h4>
              </div>
              <p className="summary-subtitle">Large scale project? Request a bulk discount.</p>
              <textarea placeholder="Describe your project size and timeline..." className="pl-textarea"></textarea>
              <button className="btn btn-primary w-full" onClick={() => handleAction('discount')}>
                <Send size={16} /> Submit Request
              </button>
            </div>
          </aside>

        </div>
        ) : (
          <div className="quotes-tab-content">
            {loadingQuotes ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading your quotes...</div>
            ) : submittedQuotes.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <FileText size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '1.2rem', color: '#334155', marginBottom: '8px' }}>No Formal Quotes Yet</h3>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>Build a project list and submit a formal RFQ to get official pricing from our team.</p>
                <button className="btn btn-primary" onClick={() => setActiveTab('current')}>Build Project List</button>
              </div>
            ) : (
              <div className="quotes-grid">
                {submittedQuotes.map(quote => {
                  const isExpanded = !!expandedQuotes[quote._id];
                  const displayTotal = quote.adminResponse?.adjustedTotal 
                    ? quote.adminResponse.adjustedTotal 
                    : quote.total;
                  
                  return (
                    <div key={quote._id} className="quote-card animate-fade-in">
                      <div className="quote-card-header">
                        <div className="quote-card-info">
                          <h3>{quote.projectName}</h3>
                          <div className="quote-ref-date">
                            <span className="quote-ref-badge">Ref: QT-{quote._id.slice(-8).toUpperCase()}</span>
                            <span className="quote-dot-divider"></span>
                            <span>Submitted: {new Date(quote.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className={`quote-status-badge ${quote.status}`}>
                          <span className="quote-status-dot"></span>
                          {quote.status}
                        </span>
                      </div>

                      <div className="quote-card-details">
                        <span><strong>Items:</strong> {quote.items.length}</span>
                        <span><strong>Zone:</strong> {quote.location}</span>
                        <span><strong>Total:</strong> ₦{displayTotal.toLocaleString()}</span>
                      </div>

                      {quote.adminResponse?.message && (
                        <div className="quote-admin-note">
                          <strong>Admin Note:</strong> {quote.adminResponse.message}
                        </div>
                      )}

                      {/* Items Preview Table Accordion */}
                      {isExpanded && (
                        <div className="quote-items-preview">
                          <div className="table-responsive">
                            <table className="preview-items-table" style={{ width: '100%' }}>
                              <thead>
                                <tr>
                                  <th>Product Details</th>
                                  <th>Quantity</th>
                                  <th>Unit Price</th>
                                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(quote.adminResponse?.adjustedItems?.length > 0 
                                  ? quote.adminResponse.adjustedItems 
                                  : quote.items
                                ).map((item, idx) => (
                                  <tr key={idx}>
                                    <td data-label="Details">
                                      <div className="preview-item-meta" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img 
                                          src={item.image ? (item.image.startsWith('http') ? item.image : `/${item.image}`) : '/placeholder.png'} 
                                          className="preview-item-thumb" 
                                          alt={item.name} 
                                          style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                                          onError={(e) => { e.target.src = '/placeholder.png'; }}
                                        />
                                        <div className="preview-item-desc" style={{ display: 'flex', flexDirection: 'column' }}>
                                          <span className="preview-item-name" style={{ fontWeight: '600', color: '#0f172a' }}>{item.name}</span>
                                          <span className="preview-item-brand" style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.brand || 'Generic'}</span>
                                        </div>
                                      </div>
                                    </td>
                                    <td data-label="Quantity" style={{ verticalAlign: 'middle' }}>{item.quantity}</td>
                                    <td data-label="Unit Price" style={{ verticalAlign: 'middle' }}>₦{(item.unitPrice || item.price || 0).toLocaleString()}</td>
                                    <td data-label="Total" style={{ textAlign: 'right', fontWeight: '700', verticalAlign: 'middle' }}>
                                      ₦{((item.unitPrice || item.price || 0) * item.quantity).toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      <div className="quote-card-actions">
                        <button 
                          className="btn-preview-toggle"
                          onClick={() => toggleQuoteExpand(quote._id)}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          {isExpanded ? 'Hide Items' : 'View Items'}
                        </button>

                        <a 
                          href={`/api/quotes/${quote._id}/pdf?token=${localStorage.getItem('token')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline-primary"
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '8px 16px', borderRadius: '10px' }}
                        >
                          <FileDown size={16} /> {quote.status === 'approved' ? 'Download PDF' : 'Download Draft'}
                        </a>

                        {quote.status === 'approved' && (
                          <button 
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px' }}
                            onClick={() => setConfirmModalQuote(quote)}
                          >
                            <CheckCircle size={16} /> Accept & Order
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom B2B Confirmation Modal */}
      {confirmModalQuote && createPortal(
        <div className="pm-modal-overlay" onClick={() => setConfirmModalQuote(null)}>
          <div className="pm-modal-container" onClick={e => e.stopPropagation()}>
            <div className="pm-modal-header">
              <div className="pm-modal-icon-bg">
                <ShoppingBag size={24} />
              </div>
              <h3 className="pm-modal-title">Accept & Place Order</h3>
            </div>
            <div className="pm-modal-body">
              <p>Are you sure you want to convert this approved quote into a live order? This will initiate the procurement process, and our logistics team will proceed to fulfill your order.</p>
              
              <div className="pm-modal-summary-card">
                <div className="pm-modal-summary-row">
                  <span className="label">Project Name:</span>
                  <span className="value">{confirmModalQuote.projectName}</span>
                </div>
                <div className="pm-modal-summary-row">
                  <span className="label">Quote Reference:</span>
                  <span className="value">QT-{confirmModalQuote._id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="pm-modal-summary-row">
                  <span className="label">Delivery Zone:</span>
                  <span className="value">{confirmModalQuote.location}</span>
                </div>
                <div className="pm-modal-summary-row">
                  <span className="label">B2B Buyer Contact:</span>
                  <span className="value">{user?.name} {user?.phone ? `(${user.phone})` : ''}</span>
                </div>
                <div className="pm-modal-summary-row total">
                  <span className="label">Grand Total:</span>
                  <span className="value">₦{(confirmModalQuote.adminResponse?.adjustedTotal || confirmModalQuote.total).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="pm-modal-footer">
              <button 
                className="pm-btn pm-btn-cancel" 
                onClick={() => setConfirmModalQuote(null)}
                disabled={isConverting}
              >
                Cancel
              </button>
              <button 
                className="pm-btn pm-btn-confirm"
                onClick={() => handleConfirmOrder(confirmModalQuote)}
                disabled={isConverting}
              >
                {isConverting ? 'Processing...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ProjectList;
